$ErrorActionPreference = "Stop"

$appRoot = Join-Path $PSScriptRoot "app"
$nodePath = Join-Path $PSScriptRoot "runtime\node.exe"
$serverPath = Join-Path $appRoot "server.js"
$port = if ($env:NEXT_DOCTOR_PORT) { $env:NEXT_DOCTOR_PORT } else { "3000" }
$healthUrl = "http://127.0.0.1:$port/api/health"
$appUrl = "http://127.0.0.1:$port/"

function Test-AppReady {
  try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200 -and $response.Content -match '"ready"\s*:\s*true'
  } catch {
    return $false
  }
}

if (Test-AppReady) {
  Start-Process $appUrl
  exit 0
}

if (-not (Test-Path $nodePath)) {
  throw "Bundled Node.js runtime was not found: $nodePath"
}

if (-not (Test-Path $serverPath)) {
  throw "Standalone Next.js server was not found: $serverPath"
}

$env:PORT = $port
$env:HOSTNAME = "127.0.0.1"
$env:DATABASE_URL = "file:$appRoot\data\clinic.db"

Start-Process `
  -FilePath $nodePath `
  -ArgumentList @($serverPath) `
  -WorkingDirectory $appRoot `
  -WindowStyle Hidden

for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Milliseconds 500

  if (Test-AppReady) {
    Start-Process $appUrl
    exit 0
  }
}

throw "Next Doctor did not become ready at $healthUrl"
