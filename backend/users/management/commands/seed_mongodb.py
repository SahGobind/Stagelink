from django.core.management.base import BaseCommand
from starcast.db import mongo_manager, check_db_connection
from starcast.seeder import seed_database

class Command(BaseCommand):
    help = "Seeds initial StageLink demo accounts and records into MongoDB Atlas idempotently."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Validate and simulate inserts without committing to MongoDB.',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        self.stdout.write("Checking MongoDB Atlas connectivity...")
        status = check_db_connection()
        if not status.get("connected"):
            self.stderr.write(self.style.ERROR(
                f"Cannot seed MongoDB: {status.get('message', 'Database not connected')}"
            ))
            return

        db = mongo_manager.get_database()
        self.stdout.write(f"Connected to database '{db.name}'. Ensuring indexes...")
        idx_res = mongo_manager.ensure_indexes()
        self.stdout.write(f"Index status: {idx_res.get('status')}")

        self.stdout.write(f"Seeding collections (dry_run={dry_run})...")
        res = seed_database(db, dry_run=dry_run)
        for collection, stats in res.items():
            if isinstance(stats, dict):
                self.stdout.write(f"  - {collection}: inserted {stats.get('inserted')}, skipped {stats.get('skipped')}")
        self.stdout.write(self.style.SUCCESS("MongoDB Atlas seeding complete."))
