from rest_framework import serializers

class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    fullName = serializers.CharField(required=False, allow_blank=True, max_length=150)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=30)
    phoneNumber = serializers.CharField(required=False, allow_blank=True, max_length=30)
    role = serializers.ChoiceField(
        choices=['candidate', 'talent', 'recruiter', 'production_company'],
        default='candidate'
    )

    def validate(self, data):
        name = data.get('full_name') or data.get('fullName')
        if not name or len(name.strip()) < 2:
            raise serializers.ValidationError({"full_name": "Full name is required (at least 2 characters)."})
        data['full_name'] = name.strip()
        data['fullName'] = name.strip()
        phone = data.get('phone_number') or data.get('phoneNumber') or ''
        data['phone_number'] = phone.strip()
        data['phoneNumber'] = phone.strip()
        return data

class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True, required=False)
    email = serializers.EmailField(required=False)
    full_name = serializers.CharField(required=False, allow_blank=True)
    fullName = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(required=False, allow_blank=True)
    company_name = serializers.CharField(required=False, allow_blank=True)
    companyName = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    phoneNumber = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    headline = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    categories = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    avatar = serializers.CharField(required=False, allow_blank=True)
    cover_image = serializers.CharField(required=False, allow_blank=True)
    coverImage = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.CharField(required=False, allow_blank=True)
    dateOfBirth = serializers.CharField(required=False, allow_blank=True)
    height = serializers.CharField(required=False, allow_blank=True)
    nationality = serializers.CharField(required=False, allow_blank=True)
    appearance = serializers.CharField(required=False, allow_blank=True)
    body_type = serializers.CharField(required=False, allow_blank=True)
    bodyType = serializers.CharField(required=False, allow_blank=True)
    hair_color = serializers.CharField(required=False, allow_blank=True)
    hairColor = serializers.CharField(required=False, allow_blank=True)
    eye_color = serializers.CharField(required=False, allow_blank=True)
    eyeColor = serializers.CharField(required=False, allow_blank=True)
    instagram = serializers.CharField(required=False, allow_blank=True)
    social_links = serializers.DictField(required=False, default=dict)
    socialLinks = serializers.DictField(required=False, default=dict)
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    languages = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    years_of_experience = serializers.IntegerField(required=False)
    yearsOfExperience = serializers.IntegerField(required=False)
    experience_years = serializers.CharField(required=False, allow_blank=True)
    experienceYears = serializers.CharField(required=False, allow_blank=True)
    experience_level = serializers.CharField(required=False, allow_blank=True)
    experienceLevel = serializers.CharField(required=False, allow_blank=True)
    availability_status = serializers.CharField(required=False, default='Available')
    availabilityStatus = serializers.CharField(required=False, allow_blank=True)
    availability = serializers.CharField(required=False, allow_blank=True)
    preferred_project_types = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    preferredProjectTypes = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    portfolio = serializers.DictField(required=False, default=dict)
    experience = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    education = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    privacy_settings = serializers.DictField(required=False, default=dict)
    privacySettings = serializers.DictField(required=False, default=dict)
    is_published = serializers.BooleanField(required=False)
    review_status = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False, allow_blank=True)


class RecruiterRegistrationSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=120)
    companyName = serializers.CharField(max_length=160)
    email = serializers.CharField(required=False, allow_blank=True, max_length=150)
    phoneNumber = serializers.CharField(required=False, allow_blank=True, max_length=25)
    country = serializers.CharField(required=False, allow_blank=True, default="India", max_length=80)
    website = serializers.CharField(required=False, allow_blank=True, default="", max_length=200)
    password = serializers.CharField(min_length=8, write_only=True)
    confirmPassword = serializers.CharField(min_length=8, write_only=True)
    agreeToTerms = serializers.BooleanField()

    def validate(self, data):
        if data['password'] != data['confirmPassword']:
            raise serializers.ValidationError({"confirmPassword": "Passwords do not match."})
        if not data.get('agreeToTerms'):
            raise serializers.ValidationError({"agreeToTerms": "You must accept the Terms of Service and Privacy Policy."})
        return data
