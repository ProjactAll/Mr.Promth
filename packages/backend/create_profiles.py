#!/usr/bin/env python3
"""
Script to create profiles for users and set admin role
"""

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://xcwkwdoxrbzzpwmlqswr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2t3ZG94cmJ6enB3bWxxc3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ0Njc2MiwiZXhwIjoyMDc4MDIyNzYyfQ.bu0NQEcmib1eyYGYE52rF6iya647uAMaq6RNXu2u9GE"

# Email addresses to make admin
ADMIN_EMAILS = [
    "donlasahachat11@gmail.com",
    "donlasahachat@gmail.com"
]

def get_all_auth_users():
    """Get all users from auth.users"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json().get('users', [])
    except Exception as e:
        print(f"Error getting auth users: {e}")
        return []

def get_all_profiles():
    """Get all existing profiles"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error getting profiles: {e}")
        return []

def create_profile(user_id, email, role='admin'):
    """Create a profile for a user"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    
    # Extract display name from email
    display_name = email.split('@')[0]
    
    data = {
        "id": user_id,
        "display_name": display_name,
        "role": role
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code in [200, 201]:
            print(f"  ✅ Created profile for {email} with role: {role}")
            return True
        else:
            print(f"  ❌ Failed to create profile for {email}: {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ Error creating profile for {email}: {e}")
        return False

def update_profile_role(user_id, email, role='admin'):
    """Update existing profile role"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}"
    
    data = {
        "role": role
    }
    
    try:
        response = requests.patch(url, headers=headers, json=data)
        
        if response.status_code == 200:
            print(f"  ✅ Updated {email} to role: {role}")
            return True
        else:
            print(f"  ❌ Failed to update {email}: {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ Error updating {email}: {e}")
        return False

def main():
    print("=" * 80)
    print("Creating/Updating Profiles with Admin Role")
    print("=" * 80)
    print()
    
    # Get all auth users and profiles
    auth_users = get_all_auth_users()
    existing_profiles = get_all_profiles()
    existing_profile_ids = {p['id'] for p in existing_profiles}
    
    print(f"Found {len(auth_users)} users in auth.users")
    print(f"Found {len(existing_profiles)} existing profiles")
    print()
    
    for user in auth_users:
        user_id = user.get('id')
        email = user.get('email')
        
        print(f"Processing: {email}")
        
        # Check if this email should be admin
        should_be_admin = email in ADMIN_EMAILS
        role = 'admin' if should_be_admin else 'user'
        
        if user_id in existing_profile_ids:
            # Profile exists, update role if needed
            if should_be_admin:
                update_profile_role(user_id, email, role)
            else:
                print(f"  ℹ️  Profile exists, keeping current role")
        else:
            # Profile doesn't exist, create it
            create_profile(user_id, email, role)
        
        print()
    
    print("=" * 80)
    print("Process completed")
    print("=" * 80)
    
    # Verify results
    print("\nVerifying results...")
    profiles = get_all_profiles()
    admin_count = sum(1 for p in profiles if p.get('role') == 'admin')
    
    print(f"Total profiles: {len(profiles)}")
    print(f"Admin users: {admin_count}")

if __name__ == "__main__":
    main()
