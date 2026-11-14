$sdkDir = 'C:\Users\Administrator\AppData\Local\Android\Sdk'
$platformTools = 'C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools'

if (-not (Test-Path $platformTools)) {
    New-Item -ItemType Directory -Path $platformTools -Force | Out-Null
}

[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdkDir, 'User')
[System.Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $sdkDir, 'User')

$userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$platformTools*") {
    $newPath = "$userPath;$platformTools"
    [System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
}

Write-Host "ANDROID_HOME: " ([System.Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User'))
Write-Host "ANDROID_SDK_ROOT: " ([System.Environment]::GetEnvironmentVariable('ANDROID_SDK_ROOT', 'User'))
Write-Host "Path: " ([System.Environment]::GetEnvironmentVariable('Path', 'User'))

