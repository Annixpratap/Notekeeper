$BASE = "https://notekeeper-7bn4.onrender.com"
$passed = 0
$failed = 0

Write-Host "`n========================================"
Write-Host "FINAL ENDPOINT VERIFICATION"
Write-Host "Backend: $BASE"
Write-Host "========================================`n"

# 1. GET /health
Write-Host "1. GET /health"
try {
  $resp = Invoke-WebRequest -Uri "$BASE/health" -Method Get -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 2. GET /about
Write-Host "`n2. GET /about"
try {
  $resp = Invoke-WebRequest -Uri "$BASE/about" -Method Get -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 3. GET /openapi.json
Write-Host "`n3. GET /openapi.json"
try {
  $resp = Invoke-WebRequest -Uri "$BASE/openapi.json" -Method Get -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 4. POST /register
Write-Host "`n4. POST /register"
$email = "testuser$(Get-Random)@test.com"
$password = "password123"
try {
  $body = @{email=$email; password=$password} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/register" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $token = ($resp.Content | ConvertFrom-Json).access_token
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 5. POST /login
Write-Host "`n5. POST /login"
try {
  $body = @{email=$email; password=$password} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 6. POST /notes
Write-Host "`n6. POST /notes"
try {
  $body = @{title="Test Note"; content="Test content"} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/notes" -Method Post -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $noteId = ($resp.Content | ConvertFrom-Json).data.id
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 7. GET /notes
Write-Host "`n7. GET /notes"
try {
  $resp = Invoke-WebRequest -Uri "$BASE/notes" -Method Get -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 8. GET /notes/{id}
Write-Host "`n8. GET /notes/{id}"
try {
  $resp = Invoke-WebRequest -Uri "$BASE/notes/$noteId" -Method Get -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 9. PUT /notes/{id}
Write-Host "`n9. PUT /notes/{id}"
try {
  $body = @{title="Updated Note"; content="Updated content"} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/notes/$noteId" -Method Put -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 10. GET /search
Write-Host "`n10. GET /search"
try {
  $resp = Invoke-WebRequest -Uri "$BASE/search?q=Test" -Method Get -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 11. POST /notes/{id}/share
Write-Host "`n11. POST /notes/{id}/share"
$email2 = "testuser$(Get-Random)@test.com"
try {
  $body = @{email=$email2; password=$password} | ConvertTo-Json
  $resp2 = Invoke-WebRequest -Uri "$BASE/register" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 10
  
  $body = @{share_with_email=$email2} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/notes/$noteId/share" -Method Post -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

# 12. DELETE /notes/{id}
Write-Host "`n12. DELETE /notes/{id}"
try {
  $resp = Invoke-WebRequest -Uri "$BASE/notes/$noteId" -Method Delete -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing -TimeoutSec 10
  Write-Host "   Status: $($resp.StatusCode) - PASS"
  $passed++
} catch {
  Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) - FAIL"
  $failed++
}

Write-Host "`n========================================"
Write-Host "RESULTS: $passed PASSED, $failed FAILED"
Write-Host "========================================"
