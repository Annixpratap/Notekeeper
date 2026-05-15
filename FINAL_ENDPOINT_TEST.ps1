$BASE = "https://notekeeper-7bn4.onrender.com"
$passed = 0
$failed = 0

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FINAL ENDPOINT VERIFICATION" -ForegroundColor Cyan
Write-Host "Backend: $BASE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. GET /health
Write-Host "1️⃣  GET /health" -ForegroundColor Yellow
try {
  $resp = Invoke-WebRequest -Uri "$BASE/health" -Method Get -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 2. GET /about
Write-Host "`n2️⃣  GET /about" -ForegroundColor Yellow
try {
  $resp = Invoke-WebRequest -Uri "$BASE/about" -Method Get -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 3. GET /openapi.json
Write-Host "`n3️⃣  GET /openapi.json" -ForegroundColor Yellow
try {
  $resp = Invoke-WebRequest -Uri "$BASE/openapi.json" -Method Get -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 4. POST /register
Write-Host "`n4️⃣  POST /register" -ForegroundColor Yellow
$email = "testuser$(Get-Random)@test.com"
$password = "password123"
try {
  $body = @{email=$email; password=$password} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/register" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $token = ($resp.Content | ConvertFrom-Json).access_token
  Write-Host "   Token obtained" -ForegroundColor Gray
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 5. POST /login
Write-Host "`n5️⃣  POST /login" -ForegroundColor Yellow
try {
  $body = @{email=$email; password=$password} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 6. POST /notes
Write-Host "`n6️⃣  POST /notes" -ForegroundColor Yellow
try {
  $body = @{title="Test Note"; content="Test content"} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/notes" -Method Post -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $noteId = ($resp.Content | ConvertFrom-Json).data.id
  Write-Host "   Note ID: $noteId" -ForegroundColor Gray
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 7. GET /notes
Write-Host "`n7️⃣  GET /notes" -ForegroundColor Yellow
try {
  $resp = Invoke-WebRequest -Uri "$BASE/notes" -Method Get -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 8. GET /notes/{id}
Write-Host "`n8️⃣  GET /notes/{id}" -ForegroundColor Yellow
try {
  $resp = Invoke-WebRequest -Uri "$BASE/notes/$noteId" -Method Get -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 9. PUT /notes/{id}
Write-Host "`n9️⃣  PUT /notes/{id}" -ForegroundColor Yellow
try {
  $body = @{title="Updated Note"; content="Updated content"} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/notes/$noteId" -Method Put -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 10. GET /search
Write-Host "`n🔟 GET /search" -ForegroundColor Yellow
try {
  $resp = Invoke-WebRequest -Uri "$BASE/search?q=Test" -Method Get -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 11. POST /notes/{id}/share
Write-Host "`n1️⃣1️⃣  POST /notes/{id}/share" -ForegroundColor Yellow
$email2 = "testuser$(Get-Random)@test.com"
try {
  # Register second user
  $body = @{email=$email2; password=$password} | ConvertTo-Json
  $resp2 = Invoke-WebRequest -Uri "$BASE/register" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 10
  
  # Share note
  $body = @{share_with_email=$email2} | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "$BASE/notes/$noteId/share" -Method Post -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# 12. DELETE /notes/{id}
Write-Host "`n1️⃣2️⃣  DELETE /notes/{id}" -ForegroundColor Yellow
try {
  $resp = Invoke-WebRequest -Uri "$BASE/notes/$noteId" -Method Delete -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing -TimeoutSec 10
  Write-Host "   ✅ Status: $($resp.StatusCode)" -ForegroundColor Green
  $passed++
} catch {
  Write-Host "   ❌ Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
  $failed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ PASSED: $passed/12" -ForegroundColor Green
Write-Host "❌ FAILED: $failed/12" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -eq 0) {
  Write-Host "ALL ENDPOINTS WORKING PERFECTLY!" -ForegroundColor Green
} else {
  Write-Host "Some endpoints need fixing" -ForegroundColor Yellow
}
