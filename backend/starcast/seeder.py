"""
StageLink Database Seeder & Data Migration
==========================================
Provides idempotent seeding and data migration into MongoDB Atlas.
Ensures default demo accounts, opportunities, applications, and support tickets
are populated without overwriting existing production records.
Includes dry-run validation support.
"""

import logging
from typing import Dict, Any, List
from django.contrib.auth.hashers import make_password
from pymongo.database import Database

logger = logging.getLogger(__name__)

# Default standard password for initial demo seeds
DEFAULT_SEED_PASSWORD_HASH = make_password("StageLink2026!")

INITIAL_USERS = [
    {
        "id": "cand-1",
        "email": "elena.rostova@example.com",
        "full_name": "Elena Rostova",
        "fullName": "Elena Rostova",
        "phone_number": "+91 98201 00001",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "London, UK",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-15T00:00:00Z",
    },
    {
        "id": "cand-2",
        "email": "marcus.jr@example.com",
        "full_name": "Marcus Sterling Jr.",
        "fullName": "Marcus Sterling Jr.",
        "phone_number": "+91 98201 00002",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Budapest, Hungary",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-15T00:00:00Z",
    },
    {
        "id": "cand-aanya",
        "email": "aanya@stagelink.com",
        "full_name": "Aanya Sharma",
        "fullName": "Aanya Sharma",
        "phone_number": "+91 98201 23456",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-15T00:00:00Z",
    },
    {
        "id": "cand-sophia",
        "email": "sarah@stagelink.com",
        "secondary_email": "sophia@stagelink.com",
        "full_name": "Sophia Bennett",
        "fullName": "Sophia Bennett",
        "phone_number": "+91 98765 43210",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "London, UK / Mumbai",
        "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-20T00:00:00Z",
    },
    {
        "id": "cand-rohit",
        "email": "rohit@stagelink.com",
        "full_name": "Rohit Verma",
        "fullName": "Rohit Verma",
        "phone_number": "+91 98111 87654",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Delhi, India",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-25T00:00:00Z",
    },
    {
        "id": "cand-amitabh",
        "email": "amitabh@stagelink.com",
        "full_name": "Amitabh Bachchan",
        "fullName": "Amitabh Bachchan",
        "phone_number": "+91 98200 00001",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "avatar": "/images/stars/amitabh_bachchan.png",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-01T00:00:00Z",
    },
    {
        "id": "cand-aamir",
        "email": "aamir@stagelink.com",
        "full_name": "Aamir Khan",
        "fullName": "Aamir Khan",
        "phone_number": "+91 98200 00002",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "avatar": "/images/stars/aamir_khan.png",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-01T00:00:00Z",
    },
    {
        "id": "cand-akshay",
        "email": "akshay@stagelink.com",
        "full_name": "Akshay Kumar",
        "fullName": "Akshay Kumar",
        "phone_number": "+91 98200 00003",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "avatar": "/images/stars/akshay_kumar.png",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-01T00:00:00Z",
    },
    {
        "id": "cand-shahid",
        "email": "shahid@stagelink.com",
        "full_name": "Shahid Kapoor",
        "fullName": "Shahid Kapoor",
        "phone_number": "+91 98200 00004",
        "role": "candidate",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "avatar": "/images/stars/shahid_kapoor.png",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-01T00:00:00Z",
    },
    {
        "id": "rec-marcus",
        "email": "recruiter@stagelink.com",
        "full_name": "Marcus Sterling",
        "fullName": "Marcus Sterling",
        "company_name": "Apex Vision Studios",
        "companyName": "Apex Vision Studios",
        "productionCompany": "Apex Vision Studios",
        "phone_number": "+44 20 7946 0912",
        "role": "recruiter",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "country": "United Kingdom",
        "location": "London, UK",
        "website": "https://apexvisionstudios.com",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-08-15T00:00:00Z",
    },
    {
        "id": "superadmin-1",
        "email": "superadmin@stagelink.com",
        "full_name": "Chief Administrator (Super Admin)",
        "fullName": "Chief Administrator (Super Admin)",
        "company_name": "StageLink Global",
        "phone_number": "+91 99999 00000",
        "role": "super_admin",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "country": "India",
        "location": "Mumbai, India",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-08-01T00:00:00Z",
    },
    {
        "id": "user-standard",
        "email": "user@stagelink.com",
        "full_name": "Standard Platform User",
        "fullName": "Standard Platform User",
        "phone_number": "+91 98888 11111",
        "role": "user",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "country": "India",
        "location": "Mumbai, India",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-01T00:00:00Z",
    },
    {
        "id": "admin-1",
        "email": "admin@stagelink.com",
        "full_name": "Audrey Miller (Admin)",
        "fullName": "Audrey Miller (Admin)",
        "company_name": "StageLink Studios",
        "phone_number": "+91 98765 00000",
        "role": "admin",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "country": "India",
        "location": "Mumbai, India",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-08-01T00:00:00Z",
    },
    {
        "id": "staff-sarah",
        "email": "ops@stagelink.com",
        "secondary_email": "operations@stagelink.com",
        "full_name": "Sarah Jenkins (Operations)",
        "fullName": "Sarah Jenkins (Operations)",
        "company_name": "StageLink HQ",
        "phone_number": "+91 98200 11223",
        "role": "operations",
        "department": "Operations Support Desk",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "country": "India",
        "location": "Mumbai, India",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-08-01T00:00:00Z",
    },
    {
        "id": "usr-1",
        "email": "elena.rostova@example.com",
        "full_name": "Elena Rostova",
        "fullName": "Elena Rostova",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "headline": "Action & Dramatic Lead Screen Actress",
        "location": "London, UK",
        "skills": ["Martial Arts", "Stunt Driving", "Stage Combat", "Method Acting", "Firearms Training"],
        "languages": ["English", "French", "Russian"],
        "years_of_experience": 8,
        "availability_status": "Available for Projects",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-07-10T00:00:00Z",
    },
    {
        "id": "cand-aryan",
        "email": "aryan.malhotra@stagelink.com",
        "full_name": "Aryan Malhotra",
        "fullName": "Aryan Malhotra",
        "phone_number": "+91 98200 44556",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "country": "India",
        "city": "Mumbai",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-01T00:00:00Z",
    },
    {
        "id": "cand-tara",
        "email": "tara.singhania@stagelink.com",
        "full_name": "Tara Singhania",
        "fullName": "Tara Singhania",
        "phone_number": "+91 98200 77889",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "country": "India",
        "city": "Mumbai",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-05T00:00:00Z",
    },
    {
        "id": "cand-aarav",
        "email": "aarav.music@stagelink.com",
        "full_name": "Aarav Mukherjee",
        "fullName": "Aarav Mukherjee",
        "phone_number": "+91 98111 22334",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "country": "India",
        "city": "Mumbai",
        "avatar": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-10T00:00:00Z",
    },
    {
        "id": "cand-matteo",
        "email": "matteo.rossi@stagelink.com",
        "full_name": "Matteo Rossi",
        "fullName": "Matteo Rossi",
        "phone_number": "+39 06 6987 1234",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Rome, Italy",
        "country": "Italy",
        "city": "Rome",
        "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-12T00:00:00Z",
    },
    {
        "id": "cand-ananya-dancer",
        "email": "ananya.dancer@stagelink.com",
        "full_name": "Ananya Iyer",
        "fullName": "Ananya Iyer",
        "phone_number": "+91 98450 11223",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Bangalore, India",
        "country": "India",
        "city": "Bangalore",
        "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-15T00:00:00Z",
    },
    {
        "id": "cand-camille",
        "email": "camille.laurent@stagelink.com",
        "full_name": "Camille Laurent",
        "fullName": "Camille Laurent",
        "phone_number": "+33 1 42 68 55 00",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Paris, France",
        "country": "France",
        "city": "Paris",
        "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-18T00:00:00Z",
    },
    {
        "id": "cand-arjun-design",
        "email": "arjun.design@stagelink.com",
        "full_name": "Arjun Varma",
        "fullName": "Arjun Varma",
        "phone_number": "+91 98202 33445",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Mumbai, India",
        "country": "India",
        "city": "Mumbai",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-20T00:00:00Z",
    },
    {
        "id": "cand-sofia-design",
        "email": "sofia.lindqvist@stagelink.com",
        "full_name": "Sofia Lindqvist",
        "fullName": "Sofia Lindqvist",
        "phone_number": "+46 8 123 4567",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Stockholm, Sweden",
        "country": "Sweden",
        "city": "Stockholm",
        "avatar": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-22T00:00:00Z",
    },
    {
        "id": "cand-kunal-comedy",
        "email": "kunal.comedy@stagelink.com",
        "full_name": "Kunal Mathur",
        "fullName": "Kunal Mathur",
        "phone_number": "+91 98101 99887",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "Delhi, India",
        "country": "India",
        "city": "Delhi",
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-24T00:00:00Z",
    },
    {
        "id": "cand-oliver-comedy",
        "email": "oliver.wright@stagelink.com",
        "full_name": "Oliver Wright",
        "fullName": "Oliver Wright",
        "phone_number": "+44 20 7123 4567",
        "role": "talent",
        "password_hash": DEFAULT_SEED_PASSWORD_HASH,
        "location": "London, UK",
        "country": "United Kingdom",
        "city": "London",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "status": "active",
        "is_verified": True,
        "created_at": "2026-09-26T00:00:00Z",
    }
]

INITIAL_TALENT_PROFILES = [
    {
        "user_id": "cand-amitabh",
        "full_name": "Amitabh Bachchan",
        "category": "Film Stars",
        "headline": "Shahenshah of Indian Cinema | Iconic Baritone & Cinema Legend",
        "location": "Mumbai, India",
        "country": "India",
        "skills": ["Iconic Baritone Voice", "Commanding Screen Authority", "Dramatic Monologue", "Urdu & Hindi Diction"],
        "languages": ["Hindi", "English", "Urdu", "Bengali", "Punjabi"],
        "years_of_experience": 55,
        "availability_status": "Available for Projects",
        "is_film_star": True,
        "review_status": "approved",
    },
    {
        "user_id": "cand-aamir",
        "full_name": "Aamir Khan",
        "category": "Film Stars",
        "headline": "Global Acclaimed Method Actor, Director & Producer | 'Mr. Perfectionist'",
        "location": "Mumbai, India",
        "country": "India",
        "skills": ["Method Acting", "Film Direction", "Physical Transformation", "Screenwriting"],
        "languages": ["Hindi", "English", "Urdu", "Marathi"],
        "years_of_experience": 35,
        "availability_status": "Available for Projects",
        "is_film_star": True,
        "review_status": "approved",
    },
    {
        "user_id": "cand-akshay",
        "full_name": "Akshay Kumar",
        "category": "Film Stars",
        "headline": "Action Superstar & Martial Arts Virtuoso | 'Khiladi of Bollywood'",
        "location": "Mumbai, India",
        "country": "India",
        "skills": ["Martial Arts (Black Belt)", "Action Stunts", "Comedic Timing", "Dramatic Lead"],
        "languages": ["Hindi", "Punjabi", "English", "Marathi"],
        "years_of_experience": 34,
        "availability_status": "Available for Projects",
        "is_film_star": True,
        "review_status": "approved",
    },
    {
        "user_id": "cand-shahid",
        "full_name": "Shahid Kapoor",
        "category": "Film Stars",
        "headline": "Bollywood Leading Screen Hero & Dramatic Powerhouse | Master Dancer",
        "location": "Mumbai, India",
        "country": "India",
        "skills": ["Intense Dramatic Acting", "Bollywood Dance", "Action Choreography", "Screen Presence"],
        "languages": ["Hindi", "English", "Punjabi"],
        "years_of_experience": 22,
        "availability_status": "Available for Projects",
        "is_film_star": True,
        "review_status": "approved",
    },
    {
        "user_id": "cand-aryan",
        "full_name": "Aryan Malhotra",
        "category": "Film Stars",
        "headline": "Bollywood A-List Film Star & Dramatic Lead",
        "location": "Mumbai, India",
        "country": "India",
        "skills": ["Method Acting", "Box Office Lead", "Screen Combat", "Dialogue Delivery", "Hindi Diction"],
        "languages": ["Hindi", "English", "Punjabi"],
        "years_of_experience": 12,
        "availability_status": "Available for Projects",
        "is_film_star": True,
        "review_status": "approved",
    },
    {
        "user_id": "cand-tara",
        "full_name": "Tara Singhania",
        "category": "Film Stars",
        "headline": "Pan-India Lead Actress & Film Star | Blockbuster Cinema",
        "location": "Mumbai, India",
        "country": "India",
        "skills": ["Lead Screen Acting", "Classical Kathak", "Action Choreography", "Brand Endorsements"],
        "languages": ["Hindi", "English", "Telugu", "Tamil"],
        "years_of_experience": 8,
        "availability_status": "Available for Projects",
        "is_film_star": True,
        "review_status": "approved",
    },
    {
        "user_id": "cand-aarav",
        "full_name": "Aarav Mukherjee",
        "category": "Musicians",
        "headline": "Bollywood Music Director, Playback Vocalist & Sitar Virtuoso",
        "location": "Mumbai, India",
        "country": "India",
        "skills": ["Film Scoring", "Sitar Performance", "Playback Singing", "Logic Pro", "Orchestration"],
        "languages": ["Hindi", "Bengali", "English"],
        "years_of_experience": 9,
        "availability_status": "Available for Projects",
        "review_status": "approved",
    },
    {
        "user_id": "cand-matteo",
        "full_name": "Matteo Rossi",
        "category": "Musicians",
        "headline": "Cinematic Film Score Composer & Multi-Instrumentalist | Cello Soloist",
        "location": "Rome, Italy",
        "country": "Italy",
        "skills": ["Cinematic Cello", "Piano Scoring", "Film Orchestration", "Soundtrack Mixing"],
        "languages": ["Italian", "English", "French"],
        "years_of_experience": 7,
        "availability_status": "Available for Projects",
        "review_status": "approved",
    },
    {
        "user_id": "cand-ananya-dancer",
        "full_name": "Ananya Iyer",
        "category": "Dancers",
        "headline": "Principal Kathak & Bharatanatyam Soloist | Bollywood Choreographer",
        "location": "Bangalore, India",
        "country": "India",
        "skills": ["Kathak Classical", "Bharatanatyam", "Bollywood Choreography", "Semi-Classical Fusion"],
        "languages": ["Tamil", "Hindi", "English"],
        "years_of_experience": 8,
        "availability_status": "Available for Projects",
        "review_status": "approved",
    },
    {
        "user_id": "cand-camille",
        "full_name": "Camille Laurent",
        "category": "Dancers",
        "headline": "Paris Opera Trained Ballet & Contemporary Performer",
        "location": "Paris, France",
        "country": "France",
        "skills": ["Classical Ballet", "Contemporary Movement", "Pointework", "Physical Choreography"],
        "languages": ["French", "English"],
        "years_of_experience": 6,
        "availability_status": "Available for Projects",
        "review_status": "approved",
    },
    {
        "user_id": "cand-arjun-design",
        "full_name": "Arjun Varma",
        "category": "Graphic Designers",
        "headline": "Film Poster Designer & Key Art Director | OTT Title Sequences",
        "location": "Mumbai, India",
        "country": "India",
        "skills": ["Film Poster Design", "Key Art Direction", "Typography", "Photoshop Composite"],
        "languages": ["Hindi", "English"],
        "years_of_experience": 7,
        "availability_status": "Available for Projects",
        "review_status": "approved",
    },
    {
        "user_id": "cand-sofia-design",
        "full_name": "Sofia Lindqvist",
        "category": "Graphic Designers",
        "headline": "Senior Film Key Art Designer & Creative Director | European Cinema",
        "location": "Stockholm, Sweden",
        "country": "Sweden",
        "skills": ["Key Art Direction", "Minimalist Poster Design", "Editorial Typography", "Film Packaging"],
        "languages": ["Swedish", "English", "German"],
        "years_of_experience": 8,
        "availability_status": "Available for Projects",
        "review_status": "approved",
    },
    {
        "user_id": "cand-kunal-comedy",
        "full_name": "Kunal Mathur",
        "category": "Comedians",
        "headline": "Stand-Up Comedian & Satirical Screen Performer | Netflix Comedy Special",
        "location": "Delhi, India",
        "country": "India",
        "skills": ["Stand-Up Comedy", "Satirical Writing", "Improv", "Comedic Timing"],
        "languages": ["Hindi", "English", "Punjabi"],
        "years_of_experience": 6,
        "availability_status": "Available for Projects",
        "review_status": "approved",
    },
    {
        "user_id": "cand-oliver-comedy",
        "full_name": "Oliver Wright",
        "category": "Comedians",
        "headline": "British Stand-Up Comedian & Satirical Actor | Edinburgh Fringe Winner",
        "location": "London, UK",
        "country": "United Kingdom",
        "skills": ["Stand-Up Satire", "British Wit", "Character Comedy", "Scriptwriting"],
        "languages": ["English"],
        "years_of_experience": 7,
        "availability_status": "Available for Projects",
        "review_status": "approved",
    },
    {
        "user_id": "cand-aanya",
        "full_name": "Aanya Sharma",
        "category": "Actor",
        "headline": "Method & Dramatic Screen Actress",
        "location": "Mumbai, India",
        "skills": ["Method Acting", "Dramatic Monologue", "Classical Dance", "Screen Combat"],
        "languages": ["English", "Hindi"],
        "years_of_experience": 5,
        "availability_status": "Available for Projects",
        "portfolio": {
            "video_reel": "https://www.w3schools.com/html/mov_bbb.mp4",
            "headshots": [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
            ],
            "resume_url": "https://example.com/resumes/aanya_sharma.pdf"
        },
        "experience_credits": [
            {"title": "Mumbai Shadows", "role": "Inspector Priya", "year": 2025}
        ],
        "review_status": "approved"
    },
    {
        "user_id": "usr-1",
        "full_name": "Elena Rostova",
        "category": "Actor",
        "headline": "Action & Dramatic Lead Screen Actress",
        "location": "London, UK",
        "skills": ["Martial Arts", "Stunt Driving", "Stage Combat", "Method Acting", "Firearms Training"],
        "languages": ["English", "Russian", "French"],
        "years_of_experience": 8,
        "availability_status": "Available for Projects",
        "portfolio": {
            "video_reel": "https://www.w3schools.com/html/mov_bbb.mp4",
            "video_audition_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "headshots": [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
            ],
            "resume_url": "https://example.com/resumes/elena_rostova.pdf"
        },
        "experience_credits": [
            {"title": "The Berlin Cipher", "role": "Agent Sonya", "year": 2024},
            {"title": "Shadow Protocol", "role": "Lt. Vance", "year": 2022}
        ],
        "review_status": "approved"
    }
]

INITIAL_OPPORTUNITIES = [
    {
        "id": "opp-1",
        "refId": "PRD-EC8421",
        "title": "Echoes of the Crown",
        "production_company": "Apex Vision Studios",
        "productionCompany": "Apex Vision Studios",
        "category": "Film & TV",
        "productionCategory": "Film & TV",
        "type": "Feature Film",
        "productionType": "Feature Film",
        "talentNeeded": ["Actors", "Actresses", "Dancers"],
        "location": "London, UK & Budapest",
        "travel_covered": True,
        "description": "High-budget international espionage thriller following undercover intelligence agents across Europe.",
        "shootDate": "2026-11-15",
        "shooting_dates": "Nov 15, 2026 – Feb 20, 2027",
        "applicationDeadline": "2026-10-30",
        "application_deadline": "2026-10-30",
        "deadline": "2026-10-30",
        "compensation": "₹1,50,000",
        "rateUnit": "Month",
        "compensationType": "Paid",
        "artistsNeeded": 5,
        "status": "published",
        "listingStatus": "published",
        "paymentStatus": "paid",
        "applicant_count": 5,
        "shortlisted_count": 2,
        "roles": [
            {
                "id": "role-1",
                "title": "Major Anya Petrova (Lead Agent)",
                "category": "Lead Actor",
                "gender": "Female",
                "age_range": "28-38",
                "description": "Bilingual operational strategist specializing in close-quarters extraction.",
                "required_skills": ["Martial Arts", "Stunt Driving", "Stage Combat", "Method Acting", "Firearms Training"],
                "required_languages": ["English", "Russian"],
                "min_experience_years": 4,
                "rate": "SAG-AFTRA Theatrical Scale + 20%"
            },
            {
                "id": "role-2",
                "title": "Viktor Cross (Counter-Intelligence Lead)",
                "category": "Supporting Actor",
                "gender": "Male",
                "age_range": "35-50",
                "description": "Pragmatic bureau chief with subtle tactical gravitas.",
                "required_skills": ["Dramatic Delivery", "Dialect Mastery", "Method Acting"],
                "required_languages": ["English", "German"],
                "min_experience_years": 5,
                "rate": "SAG-AFTRA Scale"
            }
        ],
        "created_at": "2026-10-01T10:00:00Z"
    },
    {
        "id": "opp-2",
        "refId": "PRD-NO9912",
        "title": "Neon Odyssey: 2088",
        "production_company": "Silverline Theatrical Pictures",
        "productionCompany": "Silverline Theatrical Pictures",
        "category": "Film & TV",
        "productionCategory": "Film & TV",
        "type": "High-End Streaming Series",
        "productionType": "Web Series",
        "talentNeeded": ["Actors", "Voice Artists"],
        "location": "Vancouver, Canada",
        "travel_covered": True,
        "description": "Futuristic episodic narrative exploring cybernetic autonomy and corporate detective thrillers.",
        "shootDate": "2027-01-10",
        "shooting_dates": "Jan 10, 2027 – May 30, 2027",
        "applicationDeadline": "2026-11-15",
        "application_deadline": "2026-11-15",
        "deadline": "2026-11-15",
        "compensation": "₹80,000",
        "rateUnit": "Week",
        "compensationType": "Paid",
        "artistsNeeded": 3,
        "status": "published",
        "listingStatus": "published",
        "paymentStatus": "paid",
        "applicant_count": 3,
        "shortlisted_count": 1,
        "roles": [
            {
                "id": "role-3",
                "title": "Kaelen Voss (Synth Detective)",
                "category": "Lead Actor",
                "gender": "Any",
                "age_range": "25-40",
                "description": "Hard-boiled cybernetic investigator balancing moral decay with high-tech grit.",
                "required_skills": ["Dramatic Delivery", "Sci-Fi Nuance", "Method Acting"],
                "required_languages": ["English"],
                "min_experience_years": 3,
                "rate": "Equity Standard Scale"
            }
        ],
        "created_at": "2026-10-05T12:00:00Z"
    }
]

INITIAL_APPLICATIONS = [
    {
        "id": "app-101",
        "opportunity_id": "opp-1",
        "opportunity_title": "Echoes of the Crown",
        "role_id": "role-1",
        "role_title": "Major Anya Petrova (Lead Agent)",
        "production_company": "Apex Vision Studios",
        "candidate_id": "cand-1",
        "candidate_name": "Elena Rostova",
        "candidate_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "candidate_headline": "Action & Dramatic Lead Screen Actress",
        "location": "London, UK",
        "status": "shortlisted",
        "applied_date": "2026-10-12T14:30:00Z",
        "cover_message": "Experienced in high-octane theatrical fight choreography and fluent Russian screen dialogue.",
        "video_audition_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "match_score_value": 92,
        "audition_invitation": {
            "date": "2026-10-25",
            "time": "14:00",
            "timezone": "IST (UTC+5:30)",
            "mode": "In-Studio Chemistry Read",
            "notes": "Prepare Scene 3 monologue and dialogue sides. Bring two physical headshots.",
            "submission_deadline": "2026-10-24 18:00 IST"
        },
        "internal_notes": "Strong physical stamina and excellent diction during previous agent table read."
    },
    {
        "id": "app-102",
        "opportunity_id": "opp-1",
        "opportunity_title": "Echoes of the Crown",
        "role_id": "role-2",
        "role_title": "Viktor Cross (Counter-Intelligence Lead)",
        "production_company": "Apex Vision Studios",
        "candidate_id": "cand-2",
        "candidate_name": "Marcus Sterling Jr.",
        "candidate_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        "candidate_headline": "Classical Shakespearian & Tactical Performer",
        "location": "Budapest, Hungary",
        "status": "under_review",
        "applied_date": "2026-10-13T09:00:00Z",
        "cover_message": "Extensive dialect mastery and German stage background.",
        "video_audition_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "match_score_value": 78,
        "internal_notes": "Needs dialogue pacing check with Anya."
    }
]

INITIAL_SUPPORT_TICKETS = [
    {
        "id": "STG-1001",
        "ticket_number": "STG-1001",
        "user_id": "cand-aanya",
        "user_name": "Aanya Sharma",
        "user_email": "aanya@stagelink.com",
        "user_role": "candidate",
        "company_name": "",
        "category": "Casting Applications",
        "subject": "Inquiry about self-tape upload format for Cyber Noir",
        "priority": "normal",
        "status": "in_progress",
        "assigned_to": "Sarah Jenkins",
        "assigned_staff_id": "staff-sarah",
        "created_at": "2026-10-18T10:30:00Z",
        "last_reply_at": "2026-10-19T14:15:00Z",
        "last_reply_by": "Sarah Jenkins",
        "last_reply_role": "operations",
        "unread_for_user": True,
        "unread_for_staff": False,
        "messages": [
            {
                "id": "msg-101",
                "sender_id": "cand-aanya",
                "sender_name": "Aanya Sharma",
                "sender_role": "candidate",
                "content": "Hello StageLink Support! I am preparing my callback audition self-tape for the Cyber Noir series. Could you please confirm if 4K ProRes files are accepted or if I should compress to 1080p MP4? Thank you!",
                "timestamp": "2026-10-18T10:30:00Z",
                "attachment": {
                    "name": "tape_specs_preview.png",
                    "size": "2.4 MB",
                    "type": "image/png",
                },
            },
            {
                "id": "msg-102",
                "sender_id": "staff-sarah",
                "sender_name": "Sarah Jenkins",
                "sender_role": "operations",
                "content": "Hi Aanya, thank you for reaching out! For optimal review speeds on production studio monitors, we strongly recommend 1080p H.264/MP4 format under 500MB. This guarantees seamless streaming for the casting directors.",
                "timestamp": "2026-10-19T14:15:00Z",
                "attachment": None,
            },
        ],
        "notes": [
            {
                "id": "note-1",
                "author_id": "staff-sarah",
                "author_name": "Sarah Jenkins",
                "note": "Verified candidate profile is in good standing. Handled within 4h SLA.",
                "timestamp": "2026-10-19T14:16:00Z",
            }
        ],
        "history": [
            {"event": "Ticket created", "timestamp": "2026-10-18T10:30:00Z", "actor": "Aanya Sharma"},
            {"event": "Assigned to Sarah Jenkins", "timestamp": "2026-10-18T11:00:00Z", "actor": "System"},
            {"event": "Status changed to In Progress", "timestamp": "2026-10-19T14:15:00Z", "actor": "Sarah Jenkins"},
        ],
    },
    {
        "id": "STG-1002",
        "ticket_number": "STG-1002",
        "user_id": "rec-marcus",
        "user_name": "Marcus Sterling",
        "user_email": "recruiter@stagelink.com",
        "user_role": "recruiter",
        "company_name": "Apex Vision Studios",
        "category": "Listing Fees & Payments",
        "subject": "Juspay verification receipt confirmation for Apex Vision",
        "priority": "high",
        "status": "resolved",
        "assigned_to": "David Chen",
        "assigned_staff_id": "staff-david",
        "created_at": "2026-10-17T09:15:00Z",
        "last_reply_at": "2026-10-18T16:00:00Z",
        "last_reply_by": "David Chen",
        "last_reply_role": "operations",
        "unread_for_user": False,
        "unread_for_staff": False,
        "messages": [
            {
                "id": "msg-201",
                "sender_id": "rec-marcus",
                "sender_name": "Marcus Sterling",
                "sender_role": "recruiter",
                "content": "Hi Team, we completed the $199 feature listing transaction via Juspay for 'Echoes of the Crown'. We require an itemized VAT invoice for studio accounting records.",
                "timestamp": "2026-10-17T09:15:00Z",
                "attachment": {
                    "name": "juspay_order_receipt.pdf",
                    "size": "450 KB",
                    "type": "application/pdf",
                },
            },
            {
                "id": "msg-202",
                "sender_id": "staff-david",
                "sender_name": "David Chen",
                "sender_role": "operations",
                "content": "Hello Marcus, the itemized studio invoice (Ref: INV-2026-STG89) has been generated and dispatched to your billing email. Your listing is verified and active on the marketplace.",
                "timestamp": "2026-10-18T16:00:00Z",
                "attachment": None,
            },
        ],
        "notes": [
            {
                "id": "note-2",
                "author_id": "staff-david",
                "author_name": "David Chen",
                "note": "Verified Juspay order ID: order_stagelink_82910. Invoice copy archived.",
                "timestamp": "2026-10-18T15:58:00Z",
            }
        ],
        "history": [
            {"event": "Ticket created", "timestamp": "2026-10-17T09:15:00Z", "actor": "Marcus Sterling"},
            {"event": "Priority set to High", "timestamp": "2026-10-17T09:20:00Z", "actor": "System"},
            {"event": "Assigned to David Chen", "timestamp": "2026-10-17T09:30:00Z", "actor": "Admin"},
            {"event": "Status changed to Resolved", "timestamp": "2026-10-18T16:00:00Z", "actor": "David Chen"},
        ],
    },
    {
        "id": "STG-1003",
        "ticket_number": "STG-1003",
        "user_id": "cand-sophia",
        "user_name": "Sophia Bennett",
        "user_email": "sarah@stagelink.com",
        "user_role": "candidate",
        "company_name": "",
        "category": "Profile & Media Uploads",
        "subject": "Playback stutter on uploaded 60fps showreel video",
        "priority": "low",
        "status": "open",
        "assigned_to": "Unassigned",
        "assigned_staff_id": "",
        "created_at": "2026-10-20T11:45:00Z",
        "last_reply_at": "2026-10-20T11:45:00Z",
        "last_reply_by": "Sophia Bennett",
        "last_reply_role": "candidate",
        "unread_for_user": False,
        "unread_for_staff": True,
        "messages": [
            {
                "id": "msg-301",
                "sender_id": "cand-sophia",
                "sender_name": "Sophia Bennett",
                "sender_role": "candidate",
                "content": "Hi! When viewing my candidate profile reel on Safari mobile, the video buffers frequently. Could you re-encode my reel on your media server?",
                "timestamp": "2026-10-20T11:45:00Z",
                "attachment": None,
            }
        ],
        "notes": [],
        "history": [
            {"event": "Ticket created", "timestamp": "2026-10-20T11:45:00Z", "actor": "Sophia Bennett"}
        ],
    }
]

INITIAL_COMPANIES = [
    {
        "id": "comp-1",
        "name": "Apex Vision Studios",
        "industry": "High-Concept Action Thrillers",
        "location": "London, UK & Budapest",
        "website": "https://apexvisionstudios.com",
        "description": "Award-winning international production company developing theatrical espionage sagas.",
        "verified": True,
        "active_projects_count": 3
    },
    {
        "id": "comp-2",
        "name": "Silverline Theatrical Pictures",
        "industry": "Independent Drama & Series",
        "location": "Los Angeles, CA, USA",
        "website": "https://silverlinepictures.com",
        "description": "Leading studio specializing in character-driven period dramas and award contenders.",
        "verified": True,
        "active_projects_count": 2
    }
]

INITIAL_NOTIFICATIONS = [
    {
        "id": "notif-1",
        "user_id": "cand-aanya",
        "title": "Application Shortlisted!",
        "message": "Apex Vision Studios shortlisted your application for 'Major Anya Petrova' in Echoes of the Crown.",
        "type": "shortlist",
        "read": False,
        "timestamp": "2026-10-14T09:12:00Z",
        "link": "/candidate/applications/app-101"
    },
    {
        "id": "notif-2",
        "user_id": "cand-aanya",
        "title": "Audition Callback Invited",
        "message": "You have an audition invitation scheduled for Thursday at 14:00.",
        "type": "audition",
        "read": False,
        "timestamp": "2026-10-14T11:05:00Z",
        "link": "/candidate/applications/app-101"
    }
]


def seed_database(db: Database, dry_run: bool = False) -> Dict[str, Any]:
    """
    Seeds initial reference data into MongoDB Atlas idempotently.
    Never overwrites existing records or resets user passwords if already present.
    """
    summary = {
        "dry_run": dry_run,
        "users": {"inserted": 0, "skipped": 0},
        "talent_profiles": {"inserted": 0, "skipped": 0},
        "casting_opportunities": {"inserted": 0, "skipped": 0},
        "applications": {"inserted": 0, "skipped": 0},
        "support_tickets": {"inserted": 0, "skipped": 0},
        "companies": {"inserted": 0, "skipped": 0},
        "notifications": {"inserted": 0, "skipped": 0},
    }

    # 1. Users
    for user in INITIAL_USERS:
        existing = db.users.find_one({"$or": [{"id": user["id"]}, {"email": user["email"]}]})
        if existing:
            summary["users"]["skipped"] += 1
        else:
            if not dry_run:
                db.users.insert_one(user.copy())
            summary["users"]["inserted"] += 1

    # 2. Talent Profiles
    for profile in INITIAL_TALENT_PROFILES:
        existing = db.talent_profiles.find_one({"user_id": profile["user_id"]})
        if existing:
            summary["talent_profiles"]["skipped"] += 1
        else:
            if not dry_run:
                db.talent_profiles.insert_one(profile.copy())
            summary["talent_profiles"]["inserted"] += 1

    # 3. Opportunities
    for opp in INITIAL_OPPORTUNITIES:
        existing = db.casting_opportunities.find_one({"id": opp["id"]})
        if existing:
            summary["casting_opportunities"]["skipped"] += 1
        else:
            if not dry_run:
                db.casting_opportunities.insert_one(opp.copy())
            summary["casting_opportunities"]["inserted"] += 1

    # 4. Applications
    for app in INITIAL_APPLICATIONS:
        existing = db.applications.find_one({"id": app["id"]})
        if existing:
            summary["applications"]["skipped"] += 1
        else:
            if not dry_run:
                db.applications.insert_one(app.copy())
            summary["applications"]["inserted"] += 1

    # 5. Support Tickets
    for ticket in INITIAL_SUPPORT_TICKETS:
        existing = db.support_tickets.find_one({"id": ticket["id"]})
        if existing:
            summary["support_tickets"]["skipped"] += 1
        else:
            if not dry_run:
                db.support_tickets.insert_one(ticket.copy())
            summary["support_tickets"]["inserted"] += 1

    # 6. Companies
    for comp in INITIAL_COMPANIES:
        existing = db.companies.find_one({"id": comp["id"]})
        if existing:
            summary["companies"]["skipped"] += 1
        else:
            if not dry_run:
                db.companies.insert_one(comp.copy())
            summary["companies"]["inserted"] += 1

    # 7. Notifications
    for notif in INITIAL_NOTIFICATIONS:
        existing = db.notifications.find_one({"id": notif["id"]})
        if existing:
            summary["notifications"]["skipped"] += 1
        else:
            if not dry_run:
                db.notifications.insert_one(notif.copy())
            summary["notifications"]["inserted"] += 1

    logger.info("MongoDB seed operation completed: %s", summary)
    return summary
