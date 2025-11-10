#!/usr/bin/env python3
"""
Script to verify admin roles in Supabase
"""

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://xcwkwdoxrbzzpwmlqswr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2t3ZG94cmJ6enB3bWxxc3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ0Njc2MiwiZXhwIjoyMDc4MDIyNzYyfQ.bu0NQEcmib1eyYGYE52rF6iya647uAMaq6RNXu2u9GE"

def get_all_profiles():
    """Get all profiles with their roles"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/profiles?select=id,display_name,role,created_at"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error getting profiles: {e}")
        return []

def get_user_email(user_id):
    """Get user email from auth.users"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        users = response.json()
        
        for user in users.get('users', []):
            if user.get('id') == user_id:
                return user.get('email')
        
        return "Unknown"
    except Exception as e:
        return "Error"

def main():
    print("=" * 80)
    print("Current Admin Users in Database")
    print("=" * 80)
    print()
    
    profiles = get_all_profiles()
    
    if not profiles:
        print("No profiles found or error occurred.")
        return
    
    # Filter admin users
    admin_profiles = [p for p in profiles if p.get('role') == 'admin']
    
    if admin_profiles:
        print(f"Found {len(admin_profiles)} admin user(s):\n")
        
        for profile in admin_profiles:
            user_id = profile.get('id')
            display_name = profile.get('display_name', 'N/A')
            created_at = profile.get('created_at', 'N/A')
            
            # Get email from auth.users
            email = get_user_email(user_id)
            
            print(f"  📧 Email: {email}")
            print(f"  👤 Display Name: {display_name}")
            print(f"  🆔 User ID: {user_id}")
            print(f"  🔑 Role: admin")
            print(f"  📅 Created: {created_at}")
            print()
    else:
        print("No admin users found.")
    
    # Show all users summary
    print("=" * 80)
    print(f"Total Users: {len(profiles)}")
    print(f"Admin Users: {len(admin_profiles)}")
    print(f"Regular Users: {len(profiles) - len(admin_profiles)}")
    print("=" * 80)

if __name__ == "__main__":
    main()
