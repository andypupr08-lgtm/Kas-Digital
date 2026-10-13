import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const publicDir = path.resolve('public');
const source512 = path.join(publicDir, 'PWA-512.png');
const source192 = path.join(publicDir, 'PWA-192.png');

if (!fs.existsSync(source512)) {
  console.error('Source PWA-512.png not found in public directory!');
  process.exit(1);
}

console.log('Generating all missing and empty icons from public/PWA-512.png...');

// 1. Copy pwa-512x512.png & icon.png
fs.copyFileSync(source512, path.join(publicDir, 'pwa-512x512.png'));
fs.copyFileSync(source512, path.join(publicDir, 'icon.png'));
console.log('✔ Created pwa-512x512.png and icon.png');

// 2. Generate or copy pwa-192x192.png
if (fs.existsSync(source192)) {
  fs.copyFileSync(source192, path.join(publicDir, 'pwa-192x192.png'));
} else {
  execSync(`convert "${source512}" -resize 192x192 "${path.join(publicDir, 'pwa-192x192.png')}"`);
}
console.log('✔ Created pwa-192x192.png');

// 3. Generate Apple touch icons
execSync(`convert "${source512}" -resize 180x180 "${path.join(publicDir, 'apple-touch-icon.png')}"`);
execSync(`convert "${source512}" -resize 152x152 "${path.join(publicDir, 'apple-touch-icon-152x152.png')}"`);
execSync(`convert "${source512}" -resize 167x167 "${path.join(publicDir, 'apple-touch-icon-167x167.png')}"`);
console.log('✔ Created apple-touch-icon sizes (180, 152, 167)');

// 4. Generate Favicons
execSync(`convert "${source512}" -resize 32x32 "${path.join(publicDir, 'favicon-32x32.png')}"`);
execSync(`convert "${source512}" -resize 16x16 "${path.join(publicDir, 'favicon-16x16.png')}"`);
execSync(`convert "${source512}" -define icon:auto-resize=64,48,32,16 "${path.join(publicDir, 'favicon.ico')}"`);
console.log('✔ Created favicons (16x16, 32x32, favicon.ico)');

// 5. Generate Maskable icons (with ~15% safe area margin)
execSync(`convert "${source512}" -resize 410x410 -gravity center -background none -extent 512x512 "${path.join(publicDir, 'pwa-maskable-512x512.png')}"`);
execSync(`convert "${source512}" -resize 154x154 -gravity center -background none -extent 192x192 "${path.join(publicDir, 'pwa-maskable-192x192.png')}"`);
console.log('✔ Created pwa-maskable icons (512x512, 192x192)');

// 6. Generate icon.svg embedding the PWA-512.png as crisp base64 vector wrapper
const b64 = fs.readFileSync(source512).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${b64}" x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>
</svg>\n`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg, 'utf-8');
console.log('✔ Created icon.svg with high-res embedded PWA-512 picture');

console.log('All icons successfully synchronized!');
