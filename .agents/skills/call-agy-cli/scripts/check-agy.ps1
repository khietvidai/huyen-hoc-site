<#
.SYNOPSIS
    Kiểm tra trạng thái cài đặt của Antigravity CLI (agy) và agentapi.
#>

$Result = @{
    agyInstalled = $false
    agyPath = $null
    agentapiInstalled = $false
    agentapiPath = $null
}

# 1. Kiểm tra agy trong PATH
$agyCmd = Get-Command "agy" -ErrorAction SilentlyContinue
if ($agyCmd) {
    $Result.agyInstalled = $true
    $Result.agyPath = $agyCmd.Source
} else {
    # Kiểm tra các đường dẫn cài đặt thông dụng
    $commonPaths = @(
        "$env:LOCALAPPDATA\Programs\Antigravity CLI\agy.exe",
        "$env:USERPROFILE\.gemini\antigravity-cli\bin\agy.exe",
        "$env:USERPROFILE\.local\bin\agy.exe"
    )
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $Result.agyInstalled = $true
            $Result.agyPath = $path
            break
        }
    }
}

# 2. Kiểm tra agentapi trong PATH hoặc .gemini/antigravity/bin
$agentapiCmd = Get-Command "agentapi" -ErrorAction SilentlyContinue
if ($agentapiCmd) {
    $Result.agentapiInstalled = $true
    $Result.agentapiPath = $agentapiCmd.Source
} else {
    $fallbackAgentApi = "$env:USERPROFILE\.gemini\antigravity\bin\agentapi.bat"
    if (Test-Path $fallbackAgentApi) {
        $Result.agentapiInstalled = $true
        $Result.agentapiPath = $fallbackAgentApi
    }
}

$Result | ConvertTo-Json
