from rest_framework import serializers

class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    full_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(
        choices=['candidate', 'talent', 'recruiter', 'production_company'],
        default='candidate'
    )

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class UserProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    full_name = serializers.CharField()
    role = serializers.CharField()
    company_name = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    headline = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    languages = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    years_of_experience = serializers.IntegerField(required=False, default=0)
    availability_status = serializers.CharField(required=False, default='Available')

class RecruiterRegistrationSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=120)
    companyName = serializers.CharField(max_length=160)
    email = serializers.EmailField()
    phoneNumber = serializers.CharField(required=False, allow_blank=True, max_length=25)
    country = serializers.CharField(max_length=80)
    website = serializers.CharField(required=False, allow_blank=True, max_length=200)
    password = serializers.CharField(min_length=8, write_only=True)
    confirmPassword = serializers.CharField(min_length=8, write_only=True)
    agreeToTerms = serializers.BooleanField()

    def validate(self, data):
        if data['password'] != data['confirmPassword']:
            raise serializers.ValidationError({"confirmPassword": "Passwords do not match."})
        if not data.get('agreeToTerms'):
            raise serializers.ValidationError({"agreeToTerms": "You must accept the Terms of Service and Privacy Policy."})
        return data
