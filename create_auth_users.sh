#!/bin/bash
# Create auth users via Supabase Management API
# This script creates users with proper password hashing

SUPABASE_URL="http://127.0.0.1:54321"
SERVICE_KEY=$(supabase status --output json 2>/dev/null | grep -o '"service_role_key":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SERVICE_KEY" ]; then
  echo "Error: Could not get service role key. Is Supabase running?"
  exit 1
fi

echo "Creating auth users..."

# Coach
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@jomoa.se",
    "password": "coach123",
    "email_confirm": true,
    "user_metadata": {"full_name": "Maria Andersson"}
  }' 2>/dev/null | jq -r '.id // "Error"'

# Clients
for email in "emma@example.se" "sofia@example.se" "anna@example.se"; do
  name=$(echo $email | cut -d'@' -f1 | sed 's/^./\U&/')
  curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$email\",
      \"password\": \"client123\",
      \"email_confirm\": true,
      \"user_metadata\": {\"full_name\": \"$name\"}
    }" 2>/dev/null | jq -r '.id // "Error"'
done

echo "Done! Users created."
