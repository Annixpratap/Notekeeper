$BASE = "https://notekeeper-7bn4.onrender.com"
$results = @()

function Test-EP {
    param([string]$Name, [string]$Method, [string]$Endpoint, [object]$Body, [string]$Token)
    try {
        $headers = @{"Content-Type"="application/json"}
        if ($Token) { $headers["Authorization"] = "Bearer $Token" }
        $params = @{Uri="$BASE$Endpoint"; Method=$Method; Headers=$headers; UseBasicParsing=$true; TimeoutSec=10}
        if ($Body) { $params["Body"] = $Body | ConvertTo-Json }
        $resp = Invoke-WebRequest @params
        $results += "$Name - $($resp.StatusCode) ✅"
        return $resp
    } catch {
        $code = $_.Exception.Response.StatusCode.Value__
        $results += "$Name - $code ❌"
        return $null
    }
}

# Test endpoints
$r1 = Test-EP "1. GET /health" Get "/health"
$r2 = Test-EP "2. GET /about" Get "/about"
$r3 = Test-EP "3. GET /openapi.json" Get "/openapi.json"

$email = "test$(Get-Random)@test.com"
$r4 = Test-EP "4. POST /register" Post "/register" @{email=$email; password="password123"}
$token = ($r4.Content | ConvertFrom-Json).access_token

$r5 = Test-EP "5. POST /login" Post "/login" @{email=$email; password="password123"}
$r6 = Test-EP "6. POST /notes" Post "/notes" @{title="Test"; content="Content"} $token
$noteId = ($r6.Content | ConvertFrom-Json).data.id

$r7 = Test-EP "7. GET /notes" Get "/notes" $null $token
$r8 = Test-EP "8. GET /notes/{id}" Get "/notes/$noteId" $null $token
$r9 = Test-EP "9. PUT /notes/{id}" Put "/notes/$noteId" @{title="Updated"; content="Updated"} $token
$r10 = Test-EP "10. GET /search" Get "/search?q=Test" $null $token

$email2 = "test$(Get-Random)@test.com"
Test-EP "Register 2nd user" Post "/register" @{email=$email2; password="password123"} | Out-Null
$r11 = Test-EP "11. POST /notes/{id}/share" Post "/notes/$noteId/share" @{share_with_email=$email2} $token

$r12 = Test-EP "12. DELETE /notes/{id}" Delete "/notes/$noteId" $null $token

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ENDPOINT VERIFICATION RESULTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | ForEach-Object { Write-Host $_ }

Write-Host "`n========================================" -ForegroundColor Cyan
$passed = ($results | Where-Object { $_ -match "✅" }).Count
Write-Host "PASSED: $passed/12" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
