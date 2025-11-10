#!/usr/bin/env python3
"""
Debug script to check Supabase API access
"""

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://xcwkwdoxrbzzpwmlqswr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2t3ZG94cmJ6enB3bWxxc3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ0Njc2MiwiZXhwIjoyMDc4MDIyNzYyfQ.bu0NQEcmib1eyYGYE52rF6iya647uAMaq6RNXu2u9GE"

def test_profiles_access():
    """Test access to profiles table"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    
    print("Testing profiles table access...")
    print(f"URL: {url}")
    print()
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Found {len(data)} profiles")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")

def test_auth_users():
    """Test access to auth users"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    
    print("\n" + "="*60)
    print("Testing auth users access...")
    print(f"URL: {url}")
    print()
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print()
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            print(f"Success! Found {len(users)} users")
            
            for user in users:
                print(f"\n  Email: {user.get('email')}")
                print(f"  ID: {user.get('id')}")
                print(f"  Created: {user.get('created_at')}")
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_profiles_access()
    test_auth_users()
