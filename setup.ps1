<#
  Set up DAVE on Windows. Nothing here needs administrator rights.

  Run it from the agent-dave folder, in PowerShell:

    powershell -ExecutionPolicy Bypass -File setup.ps1              install pi, Node.js, Git Bash and uv, connect, then open VS Code
    powershell -ExecutionPolicy Bypass -File setup.ps1 -ForgetKey   remove the saved studio key (shared machines)
    powershell -ExecutionPolicy Bypass -File setup.ps1 -Judge       connect the guard's judge model (advanced)
    powershell -ExecutionPolicy Bypass -File setup.ps1 -ForgetJudge remove the judge connection

  Safe to run again: anything already installed is kept.
  -ExecutionPolicy Bypass applies to this one run only; it changes no settings.
#>
param([switch]$ForgetKey, [switch]$Judge, [switch]$ForgetJudge)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
Set-Location $PSScriptRoot

# Where the installers come from. Override only to use a local mirror.
$PiInstallUrl = if ($env:PI_INSTALL_URL) { $env:PI_INSTALL_URL } else { "https://pi.dev/install.ps1" }
$UvInstallUrl = if ($env:UV_INSTALL_URL) { $env:UV_INSTALL_URL } else { "https://astral.sh/uv/install.ps1" }
$VsCodeArch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
$VsCodeInstallUrl = if ($env:VSCODE_INSTALL_URL) { $env:VSCODE_INSTALL_URL } else { "https://update.code.visualstudio.com/latest/win32-$VsCodeArch-user/stable" }

function Ok([string]$Message)   { Write-Host "  OK  $Message" -ForegroundColor Green }
function Warn([string]$Message) { Write-Host "  !   $Message" -ForegroundColor Yellow }
function Fail([string]$Message) { Write-Host "  X   $Message" -ForegroundColor Red; exit 1 }
function Step([string]$Message) { Write-Host ""; Write-Host $Message -ForegroundColor White }

# Everything goes in your user profile, where pi's own installer puts it.
$NodeDir = Join-Path $env:LOCALAPPDATA "pi-node\current"
$PiBin = Join-Path $HOME ".pi\agent\bin"
$UvBin = Join-Path $HOME ".local\bin"

# Run a program quietly and return its exit code. Windows PowerShell 5.1 turns a
# program's stderr into errors when it's redirected, so relax that just here.
function Invoke-Quiet([scriptblock]$Block) {
  $saved = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try { & $Block *> $null } catch { }
  finally { $ErrorActionPreference = $saved }
  return $LASTEXITCODE
}
function Get-Version([string]$Program) {
  $saved = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try { return ((& $Program --version 2>$null) | Select-Object -First 1) } catch { return "" }
  finally { $ErrorActionPreference = $saved }
}

function Update-ProcessPath {
  # Pick up PATH changes the installers saved for your user, plus our folders.
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $env:PATH = (@($PiBin, $NodeDir, $UvBin, $user, $machine, $env:PATH) | Where-Object { $_ }) -join ";"
}
# The PATH this terminal (and any VS Code already running) started with.
$StartPath = $env:PATH
Update-ProcessPath

function Find-VsCode {
  # VS Code's code command: on PATH, or in the user or all-users install folder.
  $cmd = Get-Command code.cmd -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($dir in @((Join-Path $env:LOCALAPPDATA "Programs\Microsoft VS Code"), (Join-Path $env:ProgramFiles "Microsoft VS Code"))) {
    $cli = Join-Path $dir "bin\code.cmd"
    if (Test-Path $cli) { return $cli }
  }
  return $null
}

function Test-NodeOk {
  if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) { return $false }
  if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { return $false }
  $code = Invoke-Quiet { & node.exe -e "const [a,b]=process.versions.node.split('.').map(Number); process.exit(a>22||(a===22&&b>=19)?0:1)" }
  return ($code -eq 0)
}

if ($Judge -or $ForgetJudge) {
  if (-not (Test-NodeOk)) { Fail "Run setup.ps1 first; the judge setup needs its Node.js." }
  & node.exe scripts\connect.mjs $(if ($Judge) { "--judge" } else { "--forget-judge" })
  exit $LASTEXITCODE
}
if ($ForgetKey) {
  if (-not (Test-NodeOk)) { Fail "Node.js isn't installed, so there's no saved key to remove." }
  & node.exe scripts\connect.mjs --forget-key
  exit $LASTEXITCODE
}

Write-Host "Setting up DAVE" -ForegroundColor White

# ---------- 1. Checking this machine ----------
Step "1. Checking this machine"
if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) { Fail "curl.exe is missing. It ships with Windows 10 and 11; ask for help." }
Ok "curl.exe is here"
if (Get-Command git.exe -ErrorAction SilentlyContinue) { Ok "git is here" } else { Warn "git isn't installed. You can still use this copy of the repo." }

# pi's installer is the source of truth for where pi, Node.js and Git Bash live.
# Load its functions (without running it) so setup can use its verified downloads.
$PiInstaller = Join-Path ([IO.Path]::GetTempPath()) "pi-install-$PID.ps1"
try { Invoke-WebRequest -UseBasicParsing -Uri $PiInstallUrl -OutFile $PiInstaller }
catch { Fail "Couldn't download pi's installer from pi.dev. Check the network, or use the offline bundle." }
$installerSource = Get-Content $PiInstaller -Raw
if ($installerSource -notmatch "(?m)^Invoke-PiInstaller\s*$") {
  Fail "pi's installer has changed shape. Install pi by hand from https://pi.dev, then run setup again."
}
. ([ScriptBlock]::Create([regex]::Replace($installerSource, "(?m)^Invoke-PiInstaller\s*$", "")))
$ErrorActionPreference = "Stop"

# ---------- 2. Node.js ----------
Step "2. Node.js"
if (Test-NodeOk) {
  Ok "Node.js $(Get-Version node.exe)"
} else {
  Install-NodeStandalone
  Update-ProcessPath
  if (-not (Test-NodeOk)) { Fail "Node.js installed, but it doesn't run. Ask for help." }
  Ok "Node.js $(Get-Version node.exe), in $NodeDir"
}

# ---------- 3. Git Bash (pi runs its commands in it) ----------
Step "3. Git Bash"
$bash = Find-ExistingBashForPi
if ($bash) {
  Ok "Git Bash is here: $bash"
} else {
  Install-GitBashStandalone
  Ok "Git Bash installed for pi"
}

# ---------- 4. pi ----------
Step "4. pi"
$pi = Get-Command pi -ErrorAction SilentlyContinue
if ($pi) {
  Ok "pi $(Get-Version pi) is already installed"
} else {
  # Run the installer with its input redirected, so it takes its defaults
  # (install pi) without stopping to ask.
  $noInput = New-TemporaryFile
  $shell = (Get-Process -Id $PID).Path
  $run = Start-Process -FilePath $shell -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$PiInstaller`"") `
    -RedirectStandardInput $noInput.FullName -NoNewWindow -Wait -PassThru
  Remove-Item $noInput.FullName -Force -ErrorAction SilentlyContinue
  if ($run.ExitCode -ne 0) { Fail "pi's installer stopped with an error (shown above)." }
  Update-ProcessPath
  if (-not (Get-Command pi -ErrorAction SilentlyContinue)) { Fail "pi installed, but it can't be found. Open a new terminal and run setup again." }
  Ok "pi $(Get-Version pi)"
}
Remove-Item $PiInstaller -Force -ErrorAction SilentlyContinue

# ---------- 5. uv (runs the fetch server) ----------
Step "5. uv"
$Uvx = Join-Path $UvBin "uvx.exe"
if (Test-Path $Uvx) {
  Ok "uv is already installed"
} else {
  # Pin where uv goes, so this script and pi agree on where uvx is.
  $shell = (Get-Process -Id $PID).Path
  $env:UV_PRINT_QUIET = "1"
  $env:UV_INSTALL_DIR = $UvBin
  & $shell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-RestMethod '$UvInstallUrl' | Invoke-Expression"
  Remove-Item Env:UV_PRINT_QUIET, Env:UV_INSTALL_DIR -ErrorAction SilentlyContinue
  Update-ProcessPath
  if (-not (Test-Path $Uvx)) { Fail "Couldn't install uv." }
  Ok "uv installed in $UvBin"
}
# pi finds uvx through your user PATH. The uv installer adds it there; make sure.
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not (($userPath -split ";") -contains $UvBin)) {
  [Environment]::SetEnvironmentVariable("Path", ((@($UvBin, $userPath) | Where-Object { $_ }) -join ";"), "User")
  Ok "Added $UvBin to your PATH"
}
if ((Invoke-Quiet { & uvx.exe mcp-server-fetch --help }) -eq 0) { Ok "fetch server ready" } else { Warn "Couldn't download the fetch server. DAVE will still work; web pages won't." }

# ---------- 6. DAVE's campus-events server ----------
Step "6. campus-events server"
if ((Invoke-Quiet { & npm.cmd install --prefix mcp/campus-events --no-audit --no-fund --no-update-notifier --loglevel=error }) -eq 0) {
  Ok "campus-events server installed"
} elseif (Test-Path "mcp/campus-events/node_modules/@modelcontextprotocol/sdk") {
  Ok "campus-events server already installed (no network, using the copy in this folder)"
} else {
  Warn "Couldn't install campus-events. Check the network, or use the offline bundle, then run setup again."
}

# ---------- 7. VS Code (where you edit DAVE and run pi) ----------
Step "7. VS Code"
$Code = Find-VsCode
if ($Code) {
  Ok "VS Code is here"
} else {
  # The user installer needs no administrator rights. addtopath puts code on your PATH;
  # !runcode keeps it from opening VS Code before setup is finished.
  $VsSetup = Join-Path ([IO.Path]::GetTempPath()) "vscode-setup-$PID.exe"
  try {
    Invoke-WebRequest -UseBasicParsing -Uri $VsCodeInstallUrl -OutFile $VsSetup
    $run = Start-Process -FilePath $VsSetup -ArgumentList "/VERYSILENT", "/NORESTART", "/MERGETASKS=!runcode,addtopath" -Wait -PassThru
    if ($run.ExitCode -ne 0) { Warn "VS Code's installer stopped with exit code $($run.ExitCode)." }
  } catch { Warn "Couldn't download VS Code. Check the network." }
  Remove-Item $VsSetup -Force -ErrorAction SilentlyContinue
  Update-ProcessPath
  $Code = Find-VsCode
  if ($Code) { Ok "VS Code installed" } else { Warn "Couldn't install VS Code. Get it from https://code.visualstudio.com, then run setup again." }
}

# ---------- 8. Connect to the studio ----------
Step "8. Connect to the studio"
& node.exe scripts\connect.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# ---------- Done ----------
Step "Done"
if ($Code) {
  # A VS Code started from here gets this script's PATH, so its terminal finds pi.
  # One that was already running keeps the PATH it started with.
  # The DAVE profile starts empty: no extensions, so nothing else competes with DAVE.
  $codeWasOpen = [bool](Get-Process Code -ErrorAction SilentlyContinue)
  $piDir = Split-Path (Get-Command pi | Select-Object -First 1).Source
  if ((Invoke-Quiet { & $Code --profile DAVE . }) -eq 0) {
    Ok "Opened this folder in VS Code, in its own DAVE profile"
    if ($codeWasOpen -and -not (($StartPath -split ";") -contains $piDir)) {
      Warn "VS Code was already open, so its terminals can't find pi yet. Close every VS Code window, then open this folder again."
    }
    Write-Host ""
    Write-Host 'In its terminal (Ctrl + `), start DAVE:'
  } else {
    $Code = $null
  }
}
if (-not $Code) {
  Write-Host ""
  Write-Host 'Open this folder in VS Code (File > Open Folder), then start DAVE in its terminal (Ctrl + `):'
}
Write-Host ""
Write-Host "  pi"
Write-Host ""
Write-Host "Say yes when pi asks to trust this folder."
