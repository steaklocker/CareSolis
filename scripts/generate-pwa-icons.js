#!/usr/bin/env node

/**
 * CareSolis PWA Icon Generator
 * Generates all required PWA icons from SVG source
 * Run: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

// SVG template for CareSolis icon
function generateSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" rx="76.8" fill="#0f172a"/>
  
  <!-- Inner background -->
  <rect x="38.4" y="38.4" width="435.2" height="435.2" rx="57.6" fill="#1e293b"/>
  
  <!-- Medical cross (emerald) -->
  <rect x="230.4" y="153.6" width="51.2" height="204.8" rx="8" fill="#10b981"/>
  <rect x="153.6" y="230.4" width="204.8" height="51.2" rx="8" fill="#10b981"/>
  
  <!-- Pulse rings -->
  <circle cx="256" cy="256" r="179.2" stroke="#10b981" stroke-width="7.68" fill="none" opacity="0.3"/>
  <circle cx="256" cy="256" r="215.04" stroke="#10b981" stroke-width="5.12" fill="none" opacity="0.15"/>
  
  ${size >= 192 ? `
  <!-- Text for larger icons -->
  <text x="256" y="394" font-family="system-ui, -apple-system, sans-serif" font-size="40.96" font-weight="bold" text-anchor="middle" fill="#64748b">CARE</text>
  <text x="256" y="435" font-family="system-ui, -apple-system, sans-serif" font-size="40.96" font-weight="bold" text-anchor="middle" fill="#64748b">SOLIS</text>
  ` : ''}
</svg>`;
}

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating CareSolis PWA Icons...\n');

// Generate SVG files for each size
sizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Generated: ${filename}`);
});

// Generate additional icons
const badgeSVG = generateSVG(72);
fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeSVG);
console.log(`✅ Generated: badge-72x72.svg`);

const actionSVG = generateSVG(96);
fs.writeFileSync(path.join(iconsDir, 'action-view.svg'), actionSVG);
fs.writeFileSync(path.join(iconsDir, 'action-dismiss.svg'), actionSVG);
console.log(`✅ Generated: action-view.svg`);
console.log(`✅ Generated: action-dismiss.svg`);

console.log('\n✅ All SVG icons generated successfully!');
console.log('\n📝 Note: SVG icons work as fallbacks for PWA.');
console.log('For PNG icons, use one of these options:');
console.log('  1. Open /icons/generate-icons.html in browser');
console.log('  2. Use ImageMagick: convert icon-512x512.svg icon-512x512.png');
console.log('  3. Use online tool: https://realfavicongenerator.net\n');