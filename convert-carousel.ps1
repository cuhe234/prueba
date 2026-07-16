# Script para convertir images-grid a image-carousel

function ConvertGridToCarousel {
    param(
        [string]$filePath
    )
    
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    
    # Use a simpler approach - find images-grid and extract content
    $gridPattern = '<div class="images-grid">\s*(.*?)\s*</div>'
    $cardPattern = '<div class="image-card" data-type="image" data-title="([^"]*)">\s*<img src="([^"]*)" alt="([^"]*)" />\s*</div>'
    
    if ($content -match $gridPattern) {
        $gridContent = $matches[1]
        $oldGrid = $matches[0]
        
        # Find all image cards
        $cardRegex = [regex]::new($cardPattern)
        $cardMatches = $cardRegex.Matches($gridContent)
        
        if ($cardMatches.Count -gt 0) {
            $carouselItems = ""
            $count = 0
            
            foreach ($match in $cardMatches) {
                $title = $match.Groups[1].Value
                $src = $match.Groups[2].Value
                $alt = $match.Groups[3].Value
                
                $carouselItems += "            <div class=`"carousel-item`" data-title=`"$title`">`r`n"
                $carouselItems += "                <img src=`"$src`" alt=`"$alt`" />`r`n"
                $carouselItems += "            </div>`r`n"
                $count++
            }
            
            $carouselHtml = @"
        <div class="image-carousel">
            <button class="carousel-button carousel-btn-prev" aria-label="Imagen anterior">❮</button>
            <div class="carousel-wrapper">
                <div class="carousel-container">
$carouselItems
                </div>
                <div class="carousel-counter">1 / $count</div>
                <div class="carousel-title"></div>
            </div>
            <button class="carousel-button carousel-btn-next" aria-label="Imagen siguiente">❯</button>
        </div>
"@
            
            $newContent = $content -replace [regex]::Escape($oldGrid), $carouselHtml
            [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
            
            return $count
        }
    }
    
    return -1
}

$htmlFiles = @(
    "auditorio-teolo.html", "auditorio-tulte.html", "auditorio.html",
    "aulas-teolo.html", "aulas-tulte.html", "aulas.html",
    "cafeteria-teolo.html", "cafeteria-tulte.html", "cafeteria.html",
    "direccion-control-escolar-teolo.html", "direccion-control-escolar-tulte.html", "direccion-control-escolar.html",
    "entrada-teolo.html", "entrada-tulte.html", "entrada.html",
    "estacionamiento-teolo.html", "estacionamiento-tulte.html", "estacionamiento.html",
    "oficinas-teolo.html", "oficinas-tulte.html", "oficinas.html",
    "sanitarios-teolo.html", "sanitarios-tulte.html", "sanitarios.html"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($file in $htmlFiles) {
    $filePath = Join-Path $scriptDir $file
    
    if (-not (Test-Path $filePath)) {
        Write-Host "File not found: $file"
        continue
    }
    
    $result = ConvertGridToCarousel $filePath
    
    if ($result -gt 0) {
        Write-Host "Updated: $file ($result images)"
    } elseif ($result -eq -1) {
        Write-Host "No images found in: $file"
    }
}

Write-Host "Conversion complete!"
