$BASE = "https://notekeeper-7bn4.onrender.com"
$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Token
    )
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$BASE$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json
        }
        
        $resp = Invoke-WebRequest @params
        $results += @{Name = $Name; Status = $resp.StatusCode; Result = "✅ PASS"}
        Write-Host "✅ $Name - Status: $($resp.StatusCode)"
        return $resp
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode) {
            $results += @{Name = $Name; Status = $statusCode; Result = "⚠️ Got $statusCode"}
            Write-Host "⚠️ $Name - Status: $statusCode"
        } else {
            $results += @{Name = $Name; Status = "ERROR"; Result = "❌ FAIL"}
            Write-Host "❌ $Name - Error: $($_.Exception.Message)"
        }
        return $null
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING ALL ENDPOINTS" -ForegroundColor Cyan
Write-Host "Backend: $BASE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Health
Test-Endpoint -Name "1. GET /health" -Method Get -Endpoint "/health"

# Test 2: About
Test-Endpoint -Name "2. GET /about" -Method Get -Endpoint "/about"

# Test 3: OpenAPI
Test-Endpoint -Name "3. GET /openapi.json" -Method Get -Endpoint "/openapi.json"

# Test 4: Register
Write-Host "`n--- AUTH TESTS ---"
$email = "test$(Get-Random)@test.com"
$password = "password123"
$registerResp = Test-Endpoint -Name "4. POST /auth/register" -Method Post -Endpoint "/auth/register" -Body @{email=$email; password=$password}

if ($registerResp) {
    $registerData = $registerResp.Content | ConvertFrom-Json
    $token = $registerData.access_token
    Write-Host "Token obtained: $($token.Substring(0, 20))..."
    
    # Test 5: Login
    $loginResp = Test-Endpoint -Name "5. POST /auth/login" -Method Post -Endpoint "/auth/login" -Body @{email=$email; password=$password}
    
    if ($loginResp) {
        $loginData = $loginResp.Content | ConvertFrom-Json
        $token = $loginData.access_token
        
        Write-Host "`n--- NOTE TESTS ---"
        
        # Test 6: Create Note
        $createResp = Test-Endpoint -Name "6. POST /notes" -Method Post -Endpoint "/notes" -Body @{title="Test Note"; content="Test content"} -Token $token
        
        if ($createResp) {
            $noteData = $createResp.Content | ConvertFrom-Json
            $noteId = $noteData.data.id
            Write-Host "Note ID: $noteId"
            
            # Test 7: Get All Notes
            Test-Endpoint -Name "7. GET /notes" -Method Get -Endpoint "/notes" -Token $token
            
            # Test 8: Get Note by ID
            Test-Endpoint -Name "8. GET /notes/{id}" -Method Get -Endpoint "/notes/$noteId" -Token $token
            
            # Test 9: Update Note
            Test-Endpoint -Name "9. PUT /notes/{id}" -Method Put -Endpoint "/notes/$noteId" -Body @{title="Updated"; content="Updated content"} -Token $token
            
            # Test 10: Search
            Test-Endpoint -Name "10. GET /search" -Method Get -Endpoint "/search?q=Test" -Token $token
            
            # Test 11: Share Note (create another user first)
            Write-Host "`n--- SHARE TEST ---"
            $email2 = "test$(Get-Random)@test.com"
            $registerResp2 = Test-Endpoint -Name "Register 2nd user" -Method Post -Endpoint "/auth/register" -Body @{email=$email2; password=$password}
            
            if ($registerResp2) {
                Test-Endpoint -Name "11. POST /notes/{id}/share" -Method Post -Endpoint "/notes/$noteId/share" -Body @{share_with_email=$email2} -Token $token
            }
            
            # Test 12: Delete Note
            Write-Host "`n--- DELETE TEST ---"
            Test-Endpoint -Name "12. DELETE /notes/{id}" -Method Delete -Endpoint "/notes/$noteId" -Token $token
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$results | ForEach-Object {
    Write-Host "$($_.Result) - $($_.Name) (Status: $($_.Status))"
}
