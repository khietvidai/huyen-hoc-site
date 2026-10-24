[CmdletBinding()]
param (
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Prompt,

    [Parameter(Mandatory = $false)]
    [string]$Model = "",

    [Parameter(Mandatory = $false)]
    [string]$Title = "Automated Task",

    [Parameter(Mandatory = $false)]
    [switch]$UseAgentApi
)

# 1. Tìm agy
$agyCmd = Get-Command "agy" -ErrorAction SilentlyContinue
$agyPath = if ($agyCmd) { $agyCmd.Source } else { $null }

if (-not $agyPath) {
    $commonPaths = @(
        "$env:LOCALAPPDATA\agy\bin\agy.exe",
        "$env:LOCALAPPDATA\Programs\Antigravity CLI\agy.exe",
        "$env:USERPROFILE\.gemini\antigravity-cli\bin\agy.exe",
        "$env:USERPROFILE\.local\bin\agy.exe"
    )
    foreach ($p in $commonPaths) {
        if (Test-Path $p) {
            $agyPath = $p
            break
        }
    }
}

# 2. Thực thi qua agy (nếu khả dụng và không yêu cầu tường minh agentapi)
if ($agyPath -and (-not $UseAgentApi)) {
    Write-Host "[call-agy-cli] Executing via Antigravity CLI ($agyPath)..." -ForegroundColor Cyan
    $argsList = @("--dangerously-skip-permissions", "-p", $Prompt)
    if ($Model) {
        $argsList += @("--model", $Model)
    }
    & $agyPath @argsList
    exit $LASTEXITCODE
}

# 3. Fallback sang agentapi
$agentapiCmd = Get-Command "agentapi" -ErrorAction SilentlyContinue
$agentApiPath = if ($agentapiCmd) { $agentapiCmd.Source } else { "$env:USERPROFILE\.gemini\antigravity\bin\agentapi.bat" }

if (Test-Path $agentApiPath) {
    Write-Host "[call-agy-cli] Executing via Antigravity agentapi ($agentApiPath)..." -ForegroundColor Yellow
    & $agentApiPath new-conversation --model=$Model --title=$Title "$Prompt"
    exit $LASTEXITCODE
}

Write-Error "[call-agy-cli] Neither 'agy' nor 'agentapi' could be found. Please install agy via: irm https://antigravity.google/cli/install.ps1 | iex"
exit 1
