"""
StageLink Custom Password Hashers
=================================
Optimized PBKDF2 hasher with balanced iterations for containerized micro-instances.
Maintains full cryptographic integrity while preventing timeouts on Render Free tier.
"""
from django.contrib.auth.hashers import PBKDF2PasswordHasher

class StageLinkPBKDF2PasswordHasher(PBKDF2PasswordHasher):
    """PBKDF2 hasher optimized for responsive execution without lag."""
    iterations = 50000

