import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function createIconSvg(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.15 : 0;
  const innerSize = size - padding * 2;
  const rx = isMaskable ? 0 : size * 0.22;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff758c" />
        <stop offset="50%" stop-color="#ff7eb3" />
        <stop offset="100%" stop-color="#f43f5e" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.03}" flood-color="#be123c" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <!-- Background rounded square -->
    <rect width="${size}" height="${size}" rx="${rx}" fill="url(#pinkGrad)" />
    
    <!-- Decorative subtle border -->
    <rect x="${size * 0.02}" y="${size * 0.02}" width="${size * 0.96}" height="${size * 0.96}" rx="${rx * 0.9}" fill="none" stroke="white" stroke-width="${size * 0.015}" stroke-opacity="0.4" />
    
    <!-- Big Heart Emblem in center -->
    <g transform="translate(${size / 2}, ${size * 0.44}) scale(${size / 100 * 0.7})">
      <path d="M 0 10 C -15 -10, -40 5, -25 30 C -15 45, 0 55, 0 55 C 0 55, 15 45, 25 30 C 40 5, 15 -10, 0 10 Z" 
            fill="#ffffff" 
            transform="translate(0, -32)"
            filter="url(#shadow)" />
    </g>

    <!-- J&E Text -->
    <text x="${size / 2}" y="${size * 0.82}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-weight="900" 
          font-size="${size * 0.22}" 
          fill="#ffffff" 
          text-anchor="middle"
          letter-spacing="${size * 0.01}"
          filter="url(#shadow)">
      J&amp;E
    </text>
  </svg>
  `;
}

async function generate() {
  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-maskable-512.png', size: 512, maskable: true },
  ];

  for (const item of sizes) {
    const svg = createIconSvg(item.size, item.maskable);
    const dest = path.join(publicDir, item.name);
    await sharp(Buffer.from(svg))
      .resize(item.size, item.size)
      .png()
      .toFile(dest);
    console.log(`Generated: ${dest}`);
  }
}

generate().catch(console.error);
