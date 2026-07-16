#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
from pathlib import Path

html_files = [
    "auditorio-teolo.html", "auditorio-tulte.html", "auditorio.html",
    "aulas-teolo.html", "aulas-tulte.html", "aulas.html",
    "cafeteria-teolo.html", "cafeteria-tulte.html", "cafeteria.html",
    "direccion-control-escolar-teolo.html", "direccion-control-escolar-tulte.html", "direccion-control-escolar.html",
    "entrada-teolo.html", "entrada-tulte.html", "entrada.html",
    "estacionamiento-teolo.html", "estacionamiento-tulte.html", "estacionamiento.html",
    "oficinas-teolo.html", "oficinas-tulte.html", "oficinas.html",
    "sanitarios-teolo.html", "sanitarios-tulte.html", "sanitarios.html"
]

script_dir = os.path.dirname(os.path.abspath(__file__))

for file in html_files:
    file_path = os.path.join(script_dir, file)
    
    if not os.path.exists(file_path):
        print(f"File not found: {file}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find images-grid div
    grid_pattern = r'<div class="images-grid">(.*?)</div>'
    grid_match = re.search(grid_pattern, content, re.DOTALL)
    
    if not grid_match:
        print(f"No images-grid found in: {file}")
        continue
    
    grid_content = grid_match.group(1)
    old_grid = grid_match.group(0)
    
    # Extract all image cards
    card_pattern = r'<div class="image-card" data-type="image" data-title="([^"]*)"><img src="([^"]*)" alt="([^"]*)" /></div>'
    card_matches = list(re.finditer(card_pattern, grid_content, re.DOTALL))
    
    if not card_matches:
        print(f"No image cards found in: {file}")
        continue
    
    # Build carousel items
    carousel_items = ""
    count = 0
    for match in card_matches:
        title = match.group(1)
        src = match.group(2)
        alt = match.group(3)
        carousel_items += f'            <div class="carousel-item" data-title="{title}">\n'
        carousel_items += f'                <img src="{src}" alt="{alt}" />\n'
        carousel_items += f'            </div>\n'
        count += 1
    
    # Build new carousel HTML
    carousel_html = f'''        <div class="image-carousel">
            <button class="carousel-button carousel-btn-prev" aria-label="Imagen anterior">❮</button>
            <div class="carousel-wrapper">
                <div class="carousel-container">
{carousel_items}
                </div>
                <div class="carousel-counter">1 / {count}</div>
                <div class="carousel-title"></div>
            </div>
            <button class="carousel-button carousel-btn-next" aria-label="Imagen siguiente">❯</button>
        </div>
'''
    
    # Replace in content
    new_content = content.replace(old_grid, carousel_html)
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated: {file} ({count} images)")

print("Conversion complete!")
