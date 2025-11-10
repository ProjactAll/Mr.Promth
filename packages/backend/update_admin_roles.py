#!/usr/bin/env python3
"""
Script to update user roles to admin in Supabase
"""

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://xcwkwdoxrbzzpwmlqswr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2t3ZG94cmJ6enB3bWxxc3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ0Njc2MiwiZXhwIjoyMDc4MDIyNzYyfQ.bu0NQEcmib1eyYGYE52rF6iya647uAMaq6RNXu2u9GE"

# Email addresses to update
ADMIN_EMAILS = [
    "donlasahachat11@gmail.com",
    "donlasahachat@gmail.com"
]

def get_user_by_email(email):
    """Get user ID from auth.users by email"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Use Supabase Admin API to get user by email
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        users = response.json()
        
        # Find user with matching email
        for user in users.get('users', []):
            if user.get('email') == email:
                return user.get('id')
        
        return None
    except Exception as e:
        print(f"Error getting user for {email}: {e}")
        return None

def update_profile_role(user_id, email, role='admin'):
    """Update user role in profiles table"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # Update profile role using REST API
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}"
    
    data = {
        "role": role
    }
    
    try:
        response = requests.patch(url, headers=headers, json=data)
        response.raise_for_status()
        
        if response.status_code == 200:
            print(f"✅ Successfully updated {email} to {role}")
            return True
        else:
            print(f"❌ Failed to update {email}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error updating {email}: {e}")
        return False

def main():
    print("=" * 60)
    print("Updating user roles to admin")
    print("=" * 60)
    print()
    
    for email in ADMIN_EMAILS:
        print(f"Processing: {email}")
        
        # Get user ID from auth.users
        user_id = get_user_by_email(email)
        
        if user_id:
            print(f"  Found user ID: {user_id}")
            # Update role in profiles table
            update_profile_role(user_id, email)
        else:
            print(f"  ⚠️  User not found in auth.users - they may need to sign up first")
        
        print()
    
    print("=" * 60)
    print("Update process completed")
    print("=" * 60)

if __name__ == "__main__":
    main()
