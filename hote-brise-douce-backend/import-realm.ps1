# Import Hotel_Realm into Keycloak
$tokenUrl = "http://localhost:8080/realms/master/protocol/openid-connect/token"
$body = "client_id=admin-cli&username=admin&password=admin&grant_type=password"

Write-Host "========================================"
Write-Host "Keycloak Realm Import Script"
Write-Host "========================================"
Write-Host ""

# Step 1: Get admin token
Write-Host "[1/3] Obtaining Keycloak admin token..."
try {
    $response = Invoke-WebRequest -Uri $tokenUrl -Method Post -Body $body -UseBasicParsing -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop
    $token = ($response.Content | ConvertFrom-Json).access_token
    Write-Host "      Token obtained successfully"
} catch {
    Write-Host "      Failed to get token: $($_.Exception.Message)"
    exit 1
}

# Step 2: Read realm JSON
Write-Host "[2/3] Reading Hotel_Realm.json file..."
try {
    $realmJsonPath = "d:\Programmes\keycloak-26.3.1\bin\Hotel_Realm.json"
    if (!(Test-Path $realmJsonPath)) {
        throw "File not found: $realmJsonPath"
    }
    $realmJson = Get-Content $realmJsonPath -Raw
    Write-Host "      Realm configuration loaded"
} catch {
    Write-Host "      Failed to read file: $($_.Exception.Message)"
    exit 1
}

# Step 3: Import realm
Write-Host "[3/3] Importing realm into Keycloak..."
$importUrl = "http://localhost:8080/admin/realms"
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

try {
    $importResponse = Invoke-WebRequest -Uri $importUrl -Method Post -Headers $headers -Body $realmJson -UseBasicParsing -ErrorAction Stop
    Write-Host "      Realm imported successfully (Status: $($importResponse.StatusCode))"
    Write-Host ""
    Write-Host "========================================"
    Write-Host "Import Complete!"
    Write-Host "========================================"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "      Failed to import realm (Status: $statusCode)"
    exit 1
}
