<#
.SYNOPSIS
    Fix Claude Desktop Cowork Workspace — Diagnose & Repair
.DESCRIPTION
    Checks and repairs the CoworkVMService, Windows virtualization features,
    and VM bundle integrity for Claude Desktop's Cowork mode.
    Run this as Administrator whenever you see:
    - "Workspace unavailable"
    - "Workspace still starting"
    - "VM service not running"
    - "Virtual Machine Platform not available"
.NOTES
    Author: Auto-generated (May 15, 2026)
    Run as: Administrator (required for service management & Windows features)
#>

#Requires -RunAsAdministrator

Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Claude Cowork Workspace — Diagnose & Repair    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: Check & Start CoworkVMService ────────────────────────
Write-Host "▶ Step 1/5: Checking CoworkVMService..." -ForegroundColor Yellow

$service = Get-Service -Name "CoworkVMService" -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Host "  ❌ CoworkVMService not found on this system." -ForegroundColor Red
    Write-Host "     This means Claude Desktop may not be installed correctly," -ForegroundColor Red
    Write-Host "     or you're on an edition that doesn't support the VM feature." -ForegroundColor Red
} else {
    Write-Host "  Found: CoworkVMService" -ForegroundColor Green
    Write-Host "  Status: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') { 'Green' } else { 'Red' })

    if ($service.Status -ne 'Running') {
        Write-Host "  → Attempting to start CoworkVMService..." -ForegroundColor Yellow
        try {
            Start-Service -Name "CoworkVMService" -ErrorAction Stop
            Write-Host "  ✅ CoworkVMService started successfully!" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed to start CoworkVMService: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "     This usually means a required Windows feature is missing." -ForegroundColor Red
            Write-Host "     See Step 3 below." -ForegroundColor Red
        }
    } else {
        Write-Host "  ✅ Already running!" -ForegroundColor Green
    }
}

Write-Host ""

# ─── Step 2: Kill lingering Claude processes ─────────────────
Write-Host "▶ Step 2/5: Checking for stale Claude processes..." -ForegroundColor Yellow

$claudeProcesses = Get-Process -Name "Claude" -ErrorAction SilentlyContinue
if ($claudeProcesses) {
    Write-Host "  Found $($claudeProcesses.Count) Claude process(es). Killing..." -ForegroundColor Yellow
    $claudeProcesses | Stop-Process -Force
    Write-Host "  ✅ Killed." -ForegroundColor Green
} else {
    Write-Host "  ✅ No stale processes found." -ForegroundColor Green
}

Write-Host ""

# ─── Step 3: Check & Enable required Windows features ─────────
Write-Host "▶ Step 3/5: Checking required Windows features..." -ForegroundColor Yellow

$requiredFeatures = @(
    @{ Name = "VirtualMachinePlatform"; Display = "Virtual Machine Platform" },
    @{ Name = "HypervisorPlatform";     Display = "Windows Hypervisor Platform" },
    @{ Name = "Microsoft-Hyper-V";      Display = "Hyper-V" },
    @{ Name = "Containers";             Display = "Containers" }
)

$allEnabled = $true
$needsReboot = $false

foreach ($feature in $requiredFeatures) {
    $result = Get-WindowsOptionalFeature -Online -FeatureName $feature.Name -ErrorAction SilentlyContinue
    if ($result -and $result.State -eq "Enabled") {
        Write-Host "  ✅ $($feature.Display)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($feature.Display) — NOT enabled" -ForegroundColor Red
        $allEnabled = $false
        Write-Host "     → Enabling..." -ForegroundColor Yellow
        try {
            Enable-WindowsOptionalFeature -Online -FeatureName $feature.Name -All -NoRestart -ErrorAction Stop | Out-Null
            Write-Host "     ✅ Enabled (reboot may be required)" -ForegroundColor Green
            $needsReboot = $true
        } catch {
            Write-Host "     ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Check hypervisor launch type
Write-Host ""
Write-Host "  Checking hypervisor launch type..." -ForegroundColor Yellow
$hypervisorConfig = bcdedit /enum "{current}" | Select-String "hypervisorlaunchtype"
if ($hypervisorConfig -match "Auto") {
    Write-Host "  ✅ Hyper-V launch type: Auto" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Hyper-V launch type not set to Auto." -ForegroundColor Yellow
    Write-Host "     → Setting hypervisorlaunchtype to Auto..." -ForegroundColor Yellow
    bcdedit /set hypervisorlaunchtype auto
    Write-Host "     ✅ Set. Reboot required." -ForegroundColor Green
    $needsReboot = $true
}

Write-Host ""

# ─── Step 4: Check VM bundle integrity ────────────────────────
Write-Host "▶ Step 4/5: Checking VM bundle files..." -ForegroundColor Yellow

$vmBundlePath = "$env:LOCALAPPDATA\Claude-3p\vm_bundles\claudevm.bundle"
$requiredFiles = @("rootfs.vhdx", "vmlinuz", "initrd", "smol-bin.vhdx")

if (Test-Path $vmBundlePath) {
    $allFilesOk = $true
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $vmBundlePath $file
        if (Test-Path $filePath) {
            $size = (Get-Item $filePath).Length
            $sizeMb = [math]::Round($size / 1MB, 1)
            Write-Host "  ✅ $file ($sizeMb MB)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file — MISSING" -ForegroundColor Red
            $allFilesOk = $false
        }
    }
    if (-not $allFilesOk) {
        Write-Host "  ⚠️ Some VM files are missing. Try clearing the VM bundle:" -ForegroundColor Yellow
        Write-Host "     cd '$env:LOCALAPPDATA\Claude-3p\vm_bundles'" -ForegroundColor White
        Write-Host "     Remove-Item -Recurse -Force claudevm.bundle" -ForegroundColor White
        Write-Host "     Then restart Claude Desktop to trigger a fresh download." -ForegroundColor White
    }
} else {
    Write-Host "  ⚠️ VM bundle directory not found at:" -ForegroundColor Yellow
    Write-Host "     $vmBundlePath" -ForegroundColor White
    Write-Host "  Claude will download it on first launch." -ForegroundColor Yellow
}

Write-Host ""

# ─── Step 5: Summary & Next Steps ─────────────────────────────
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SUMMARY                                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($needsReboot) {
    Write-Host "⚠️  Windows features were enabled — a REBOOT is required." -ForegroundColor Magenta
    Write-Host "   After rebooting, run this script again to verify, then launch Claude Desktop." -ForegroundColor Magenta
    Write-Host ""
}

$service = Get-Service -Name "CoworkVMService" -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq 'Running') {
    Write-Host "✅ The CoworkVMService is RUNNING." -ForegroundColor Green
    Write-Host "   → Close this window and relaunch Claude Desktop." -ForegroundColor White
    Write-Host "   → Wait 30–60 seconds for the workspace to boot." -ForegroundColor White
} else {
    Write-Host "❌ The CoworkVMService could NOT be started." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common reasons:" -ForegroundColor Yellow
    Write-Host "  1. Windows features not fully enabled (see Step 3) — REBOOT required" -ForegroundColor White
    Write-Host "  2. BIOS virtualization (VT-x/AMD-V) is disabled" -ForegroundColor White
    Write-Host "     → Check BIOS: Advanced → CPU Configuration → Intel VT-x / AMD SVM" -ForegroundColor White
    Write-Host "  3. Windows 11 Home edition — lacks Hyper-V support" -ForegroundColor White
    Write-Host "     → Upgrade to Windows 11 Pro/Education/Enterprise" -ForegroundColor White
    Write-Host "  4. Security software blocking VM creation" -ForegroundColor White
    Write-Host "     → Temporarily disable antivirus/firewall and retry" -ForegroundColor White
}

Write-Host ""
Write-Host "Quick fix (one-liner for next time):" -ForegroundColor Cyan
Write-Host "  PowerShell as Admin → Start-Service CoworkVMService" -ForegroundColor White
Write-Host ""
Write-Host "Create a desktop shortcut for easy access:" -ForegroundColor Cyan
Write-Host "  1. Right-click Desktop → New → Shortcut" -ForegroundColor White
Write-Host "  2. Paste: powershell Start-Service CoworkVMService" -ForegroundColor White
Write-Host "  3. Right-click shortcut → Properties → Advanced → Run as administrator" -ForegroundColor White
