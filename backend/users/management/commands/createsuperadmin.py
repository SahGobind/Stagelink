from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from starcast.db import mongo_manager
import datetime
import uuid

class Command(BaseCommand):
    help = "Create or update an administrator account in MongoDB Atlas for direct StageLink Admin login."

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email address')
        parser.add_argument('--password', type=str, help='Admin password')
        parser.add_argument('--name', type=str, default='Administrator', help='Admin full name')
        parser.add_argument('--role', type=str, default='admin', choices=['admin', 'super_admin'], help='Admin role (admin or super_admin)')

    def handle(self, *args, **options):
        email = options.get('email')
        password = options.get('password')
        name = options.get('name') or 'Administrator'
        role = options.get('role') or 'admin'

        if not email:
            email = input("Enter Admin Email (e.g. admin@yourdomain.com): ").strip()
        if not email:
            self.stderr.write(self.style.ERROR("Email cannot be empty."))
            return

        email = email.lower().strip()

        if not password:
            import getpass
            password = getpass.getpass("Enter Admin Password: ").strip()
        if not password or len(password) < 6:
            self.stderr.write(self.style.ERROR("Password must be at least 6 characters."))
            return

        col = mongo_manager.get_collection('users')
        user = col.find_one({"email": email})

        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        password_hash = make_password(password)

        if user:
            col.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "role": role,
                    "password_hash": password_hash,
                    "status": "active",
                    "is_verified": True,
                    "updated_at": now_iso
                }}
            )
            self.stdout.write(self.style.SUCCESS(f"Successfully updated existing user '{email}' as {role} with new password!"))
        else:
            new_id = f"admin-{uuid.uuid4().hex[:8]}"
            new_user = {
                "id": new_id,
                "email": email,
                "full_name": name,
                "fullName": name,
                "role": role,
                "password_hash": password_hash,
                "status": "active",
                "is_verified": True,
                "country": "India",
                "location": "Mumbai, India",
                "created_at": now_iso,
                "updated_at": now_iso
            }
            col.insert_one(new_user)
            self.stdout.write(self.style.SUCCESS(f"Successfully created new {role} account '{email}'!"))

        self.stdout.write(self.style.NOTICE(f"\nYou can now log in directly at:"))
        self.stdout.write(f"  URL:      http://localhost:5173/admin/")
        self.stdout.write(f"  Email:    {email}")
        self.stdout.write(f"  Password: (as entered)\n")

