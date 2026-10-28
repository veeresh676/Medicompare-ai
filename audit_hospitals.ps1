$ErrorActionPreference = "Stop"

$file = ".\hospitals_export.csv"

if (!(Test-Path $file)) {
    Write-Host "ERROR: hospitals_export.csv was not found." -ForegroundColor Red
    exit 1
}

$rows = @(Import-Csv $file)

$unique = @($rows | Sort-Object id -Unique)

$duplicates = @(
    $rows |
    Group-Object id |
    Where-Object { $_.Count -gt 1 }
)

$missingPhones = @(
    $unique | Where-Object {
        [string]::IsNullOrWhiteSpace($_.phoneNumber)
    }
)

$missingStates = @(
    $unique | Where-Object {
        [string]::IsNullOrWhiteSpace($_.state)
    }
)

$missingCoordinates = @(
    $unique | Where-Object {
        [string]::IsNullOrWhiteSpace($_.latitude) -or
        [string]::IsNullOrWhiteSpace($_.longitude)
    }
)

$possibleDemoRecords = @(
    $unique | Where-Object {
        $_.name -match "HealthFirst|HealthPoint|CareBridge|GreenCity|PrimeLife|CoastalCare|Eastern Bay|NorthStar|BlueCross|HarborCare|WellSpring|Pinnacle Specialty|CapitalCare|Deccan Medical|Awadh Medical|Rajasthan HealthPoint|Hooghly Specialty|Kalinga Specialty"
    }
)

Write-Host "`n===== MEDICOMPARE AI: HOSPITAL AUDIT =====" -ForegroundColor Cyan
Write-Host "Total exported rows: $($rows.Count)"
Write-Host "Unique hospital IDs: $($unique.Count)"
Write-Host "Repeated IDs: $($duplicates.Count)"
Write-Host "Unique records missing phone numbers: $($missingPhones.Count)"
Write-Host "Unique records missing states: $($missingStates.Count)"
Write-Host "Unique records missing coordinates: $($missingCoordinates.Count)"
Write-Host "Possible demo records requiring verification: $($possibleDemoRecords.Count)"

$duplicates |
    Select-Object Name, Count |
    Format-Table -AutoSize

$missingPhones |
    Select-Object id, name, city, state |
    Format-Table -AutoSize

$missingStates |
    Select-Object id, name, city |
    Format-Table -AutoSize

$missingCoordinates |
    Select-Object id, name, city |
    Format-Table -AutoSize

$possibleDemoRecords |
    Select-Object id, name, city, phoneNumber |
    Format-Table -AutoSize

$unique |
    Select-Object id, name, city, state, address, phoneNumber,
                  hospitalType, latitude, longitude, imageUrl |
    Export-Csv ".\hospitals_unique_audit.csv" -NoTypeInformation -Encoding UTF8

Write-Host "`nAudit saved to hospitals_unique_audit.csv" -ForegroundColor Green
