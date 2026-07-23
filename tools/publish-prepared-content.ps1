[CmdletBinding()]
param(
    [switch]$ValidateOnly,
    [switch]$SkipDeploymentWait
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$expectedBranch = "main"
$allowedPathPattern = '^(content/catalog\.json|content/trips/[^/]+/trip\.json)$'

function Invoke-Native {
    param(
        [Parameter(Mandatory)]
        [string]$FilePath,
        [Parameter(ValueFromRemainingArguments)]
        [string[]]$Arguments
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Příkaz selhal ($LASTEXITCODE): $FilePath $($Arguments -join ' ')"
    }
}

function Get-ChangedPaths {
    $paths = @(
        git -C $repoRoot diff --name-only
        git -C $repoRoot diff --cached --name-only
        git -C $repoRoot ls-files --others --exclude-standard
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Sort-Object -Unique

    if ($LASTEXITCODE -ne 0) {
        throw "Nepodařilo se načíst změny Git repozitáře."
    }
    return @($paths)
}

function Assert-AllowedChanges {
    param([string[]]$Paths)

    $forbidden = @($Paths | Where-Object { $_ -notmatch $allowedPathPattern })
    if ($forbidden.Count -gt 0) {
        throw "Publikování bylo zastaveno. Mimo veřejný obsah jsou změněné soubory: $($forbidden -join ', ')"
    }
}

Push-Location $repoRoot
try {
    if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
        throw "Cílová složka není Git repozitář: $repoRoot"
    }

    $branch = (git branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0 -or $branch -ne $expectedBranch) {
        throw "Publikovat lze pouze z větve '$expectedBranch'. Aktuální větev: '$branch'."
    }

    $changedPaths = @(Get-ChangedPaths)
    Assert-AllowedChanges -Paths $changedPaths

    Write-Host "Spouštím úplnou kontrolu veřejného obsahu..."
    Invoke-Native -FilePath npm.cmd -Arguments @("run", "check")

    if ($ValidateOnly) {
        Write-Host "Kontrola publish workflow proběhla úspěšně. Commit ani push nebyl proveden."
        exit 0
    }

    if ($changedPaths.Count -eq 0) {
        throw "Není připravena žádná změna veřejného obsahu."
    }

    Write-Host "Ověřuji synchronizaci s origin/main..."
    Invoke-Native -FilePath git -Arguments @("fetch", "origin", $expectedBranch)
    $sync = (git rev-list --left-right --count "origin/$expectedBranch...HEAD").Trim() -split '\s+'
    if ($LASTEXITCODE -ne 0 -or $sync.Count -ne 2) {
        throw "Nepodařilo se ověřit synchronizaci s origin/$expectedBranch."
    }
    if ([int]$sync[0] -gt 0 -or [int]$sync[1] -gt 0) {
        throw "Lokální větev není přesně synchronní s origin/$expectedBranch (behind=$($sync[0]), ahead=$($sync[1])). Nejprve stav bezpečně vyřešte."
    }

    Invoke-Native -FilePath git -Arguments @("add", "-A", "--", "content/catalog.json", "content/trips")
    $stagedPaths = @(git diff --cached --name-only | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($LASTEXITCODE -ne 0 -or $stagedPaths.Count -eq 0) {
        throw "Po kontrole není připravena žádná změna ke commitu."
    }
    Assert-AllowedChanges -Paths $stagedPaths

    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    Invoke-Native -FilePath git -Arguments @("commit", "-m", "Publish prepared TravelApp trips ($stamp)")
    $commitSha = (git rev-parse HEAD).Trim()
    Invoke-Native -FilePath git -Arguments @("push", "origin", $expectedBranch)

    Write-Host "Commit $commitSha byl odeslán. GitHub Actions nyní nasadí GitHub Pages."

    if ($SkipDeploymentWait) {
        Write-Host "Čekání na GitHub Pages bylo přeskočeno."
        exit 0
    }

    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if ($null -eq $gh) {
        Write-Warning "GitHub CLI není dostupné; stav Pages ověřte v GitHub Actions."
        exit 0
    }

    $runId = $null
    for ($attempt = 0; $attempt -lt 10 -and $null -eq $runId; $attempt++) {
        $runsJson = gh run list `
            --repo pocitacpc-hub/TravelApp-PublishedTrips `
            --workflow deploy-pages.yml `
            --commit $commitSha `
            --limit 1 `
            --json databaseId
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Commit byl odeslán, ale nepodařilo se načíst stav GitHub Actions."
            exit 0
        }
        $runs = @($runsJson | ConvertFrom-Json)
        if ($runs.Count -gt 0) {
            $runId = $runs[0].databaseId
            break
        }
        Start-Sleep -Seconds 3
    }

    if ($null -eq $runId) {
        Write-Warning "Commit byl odeslán, ale deploy workflow zatím nebyl nalezen. Ověřte GitHub Actions ručně."
        exit 0
    }

    Write-Host "Čekám na dokončení GitHub Pages workflow #$runId..."
    Invoke-Native -FilePath gh -Arguments @("run", "watch", $runId, "--repo", "pocitacpc-hub/TravelApp-PublishedTrips", "--exit-status")
    Write-Host "GitHub Pages byly úspěšně nasazeny."
}
finally {
    Pop-Location
}
