#!/bin/bash

echo "Getting admin token..."
TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=admin-cli&username=admin&password=admin&grant_type=password' | jq -r '.access_token')

echo "Token obtained: ${TOKEN:0:50}..."

echo "Importing realm from Hotel_Realm.json..."
curl -X POST http://localhost:8080/admin/realms \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d @/opt/keycloak/Hotel_Realm.json

echo ""
echo "Import completed"
