<#
  rename-images.ps1
  Renames the original image files in the "images" folder to the descriptive
  file names used in the HTML (better for SEO and easier to maintain).

  How to run (from the project folder, in PowerShell):
      powershell -ExecutionPolicy Bypass -File .\rename-images.ps1 -WhatIf   # preview only
      powershell -ExecutionPolicy Bypass -File .\rename-images.ps1           # do the rename
#>
[CmdletBinding(SupportsShouldProcess)]
param([string]$Folder = "images")

$map = [ordered]@{
    'images (10).jpg' = 'blackwood-and-bean-logo.jpg'
    'images (9).jpg' = 'restaurant-hero-1.jpg'
    'images (14).jpg' = 'restaurant-hero-2.jpg'
    'images (20).jpg' = 'restaurant-hero-3.jpg'
    'images (22).jpg' = 'menu-banner.jpg'
    'images (16).jpg' = 'breakfast-dish-1.jpg'
    'images (44).jpg' = 'breakfast-dish-2.jpg'
    'images (23).jpg' = 'breakfast-dish-3.jpg'
    'images (25).jpg' = 'lunch-dish-1.jpg' 
    'images (26).jpg' = 'lunch-dish-2.jpg'
    'images (27).jpg' = 'lunch-dish-3.jpg'
    'images (28).jpg' = 'dinner-dish-1.jpg'
    'images (29).jpg' = 'dinner-dish-2.jpg'
    'images (45).jpg' = 'dinner-dish-3.jpg'
    'images (30).jpg' = 'coffee-drink-1.jpg'
    'images (31).jpg' = 'coffee-drink-2.jpg'
    'images (42).jpg' = 'coffee-drink-3.jpg'
    'images (32).jpg' = 'cold-drink-1.jpg'
    'images (33).jpg' = 'cold-drink-2.jpg'
    'images (34).jpg' = 'cold-drink-3.jpg'
    'images (8).jpg' = 'restaurant-interior-1.jpg'
    'images (37).jpg' = 'restaurant-interior-2.jpg'
    'images (38).jpg' = 'restaurant-interior-3.jpg'
    'images (2).jpg' = 'table-setting-1.jpg'
    'images (18).jpg' = 'table-setting-2.jpg'
    'images (17).jpg' = 'table-setting-3.jpg'
    'images (3).jpg' = 'event-venue-1.jpg'
    'images (35).jpg' = 'event-venue-2.jpg'
    'images (1).jpg' = 'event-venue-3.jpg'
    'images (12).jpg' = 'our-story-photo.jpg'
    'images (39).jpg' = 'team-photo-1.jpg'
    'images (40).jpg' = 'team-photo-2.jpg'
    'images (36).jpg' = 'lerato-founder-head-chef.jpg'
    'images (41).jpg' = 'sam-head-barista.jpg'
}

if (-not (Test-Path -LiteralPath $Folder)) { Write-Error "Folder '$Folder' not found. Run this from the project folder."; exit 1 }

$renamed = 0; $missing = @()
foreach ($old in $map.Keys) {
    $oldPath = Join-Path $Folder $old
    $new = $map[$old]
    $newPath = Join-Path $Folder $new
    if (Test-Path -LiteralPath $newPath) { Write-Host "Already done: $new"; continue }
    if (-not (Test-Path -LiteralPath $oldPath)) { $missing += $old; continue }
    if ($PSCmdlet.ShouldProcess($old, "Rename to $new")) {
        Rename-Item -LiteralPath $oldPath -NewName $new
        $renamed++
    }
}
Write-Host "Renamed $renamed file(s)."
if ($missing.Count) { Write-Warning ("Not found in '$Folder': " + ($missing -join ', ')) }
