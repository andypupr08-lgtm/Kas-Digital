import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. High-Quality Vector SVG for Google Sheets
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F9D58"/>
      <stop offset="100%" stop-color="#0B8043"/>
    </linearGradient>
    <linearGradient id="foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34A853"/>
      <stop offset="100%" stop-color="#1E8E3E"/>
    </linearGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#043818" flood-opacity="0.32"/>
    </filter>
    <filter id="foldShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="-4" dy="6" stdDeviation="8" flood-color="#043818" flood-opacity="0.35"/>
    </filter>
    <clipPath id="docClip">
      <!-- Document with dog-ear corner cut -->
      <path d="M 120 72 
               L 312 72 
               L 392 152 
               L 392 416 
               A 24 24 0 0 1 368 440 
               L 144 440 
               A 24 24 0 0 1 120 416 
               Z"/>
    </clipPath>
  </defs>

  <!-- Outer background container with soft rounded corners (App Icon Style) -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)"/>

  <!-- Google Sheets Document Body with Shadow -->
  <g filter="url(#cardShadow)">
    <!-- Sheet Background (Green Document Base) -->
    <path d="M 120 96 
             A 24 24 0 0 1 144 72 
             L 304 72 
             L 392 160 
             L 392 416 
             A 24 24 0 0 1 368 440 
             L 144 440 
             A 24 24 0 0 1 120 416 
             Z" 
          fill="#0F9D58"/>

    <!-- Document Top-Right Fold Flap -->
    <path d="M 304 72 
             L 392 160 
             L 328 160 
             A 24 24 0 0 1 304 136 
             Z" 
          fill="url(#foldGrad)" 
          filter="url(#foldShadow)"/>
    
    <!-- Fold Crease Accent -->
    <path d="M 304 72 L 304 136 A 24 24 0 0 0 328 160 L 392 160" fill="none" stroke="#0B8043" stroke-width="2" opacity="0.4"/>

    <!-- White Spreadsheet Grid (Buku Kas & Google Sheets Core Element) -->
    <g transform="translate(162, 196)">
      <!-- Main Spreadsheet Card -->
      <rect width="188" height="184" rx="12" fill="#FFFFFF" filter="url(#foldShadow)"/>
      
      <!-- Top Header Row Accent -->
      <rect x="0" y="0" width="188" height="42" rx="12" fill="#0F9D58"/>
      <rect x="0" y="24" width="188" height="18" fill="#0F9D58"/>

      <!-- Header Columns -->
      <line x1="72" y1="0" x2="72" y2="42" stroke="#0B8043" stroke-width="3"/>
      
      <!-- Table Rows (Row 1, 2, 3) -->
      <!-- Vertical Dividing Line -->
      <line x1="72" y1="42" x2="72" y2="184" stroke="#0F9D58" stroke-width="3" opacity="0.85"/>

      <!-- Horizontal Dividing Lines -->
      <line x1="0" y1="42" x2="188" y2="42" stroke="#0B8043" stroke-width="3"/>
      <line x1="0" y1="89" x2="188" y2="89" stroke="#E2E8F0" stroke-width="2.5"/>
      <line x1="0" y1="136" x2="188" y2="136" stroke="#E2E8F0" stroke-width="2.5"/>

      <!-- Data Cell Indicators (Subtle spreadsheet content bars) -->
      <!-- Header text blocks -->
      <rect x="14" y="16" width="44" height="10" rx="5" fill="#FFFFFF"/>
      <rect x="86" y="16" width="76" height="10" rx="5" fill="#FFFFFF"/>

      <!-- Data rows -->
      <rect x="14" y="60" width="36" height="8" rx="4" fill="#0F9D58" opacity="0.75"/>
      <rect x="86" y="60" width="68" height="8" rx="4" fill="#64748B" opacity="0.6"/>

      <rect x="14" y="106" width="42" height="8" rx="4" fill="#0F9D58" opacity="0.75"/>
      <rect x="86" y="106" width="54" height="8" rx="4" fill="#64748B" opacity="0.6"/>

      <rect x="14" y="152" width="32" height="8" rx="4" fill="#0F9D58" opacity="0.75"/>
      <rect x="86" y="152" width="80" height="8" rx="4" fill="#10B981" opacity="0.9"/>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

// 2. Pure Node.js High-Precision PNG Generation Function
function createGoogleSheetsPng(size, mode = 'any') {
  // mode: 'any' (with rounded icon base or clean transparent),
  //       'maskable' (full bleed background for Android adaptive safe zone),
  //       'ios' (solid background for Apple touch icon)

  const width = size;
  const height = size;

  // CRC32 implementation
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const stride = width * 4;
  const rawData = Buffer.alloc((stride + 1) * height);

  const cx = width / 2;
  const cy = height / 2;

  // Scaling factor relative to 512px design
  const s = size / 512;

  // Base icon squircle radius for standalone app icon
  const outerSquircleRadius = mode === 'maskable' ? 0 : 108 * s;

  // Geometry coordinates
  // Document base
  const docLeft = mode === 'maskable' ? cx - 110 * s : cx - 136 * s;
  const docRight = mode === 'maskable' ? cx + 110 * s : cx + 136 * s;
  const docTop = mode === 'maskable' ? cy - 150 * s : cy - 184 * s;
  const docBottom = mode === 'maskable' ? cy + 150 * s : cy + 184 * s;
  const foldSize = (mode === 'maskable' ? 70 : 88) * s;
  const foldX = docRight - foldSize;
  const foldY = docTop + foldSize;

  // Table grid bounds
  const tblLeft = cx - (mode === 'maskable' ? 75 : 94) * s;
  const tblRight = cx + (mode === 'maskable' ? 75 : 94) * s;
  const tblTop = cy - (mode === 'maskable' ? 38 : 60) * s;
  const tblBottom = cy + (mode === 'maskable' ? 112 : 124) * s;
  const tblHeaderH = (tblBottom - tblTop) * 0.23;
  const colSplitX = tblLeft + (tblRight - tblLeft) * 0.38;
  const rowH = (tblBottom - (tblTop + tblHeaderH)) / 3;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // filter None

    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;

      // Color defaults
      let r = 0, g = 0, b = 0, a = 0;

      if (mode === 'maskable') {
        // Full bleed background for Android adaptive icon
        const gradT = (x + y) / (width + height);
        r = Math.round(15 + (11 - 15) * gradT);
        g = Math.round(157 + (128 - 157) * gradT);
        b = Math.round(88 + (67 - 88) * gradT);
        a = 255;
      } else if (mode === 'ios') {
        // Solid green background for Apple Touch Icon
        const gradT = (x + y) / (width + height);
        r = Math.round(15 + (11 - 15) * gradT);
        g = Math.round(157 + (128 - 157) * gradT);
        b = Math.round(88 + (67 - 88) * gradT);
        a = 255;
      } else {
        // App icon with squircle container
        // Distance from squircle boundary
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        const half = width * 0.46;
        const cornerR = outerSquircleRadius;

        let inside = false;
        let edgeDist = 0;

        if (dx <= half && dy <= half) {
          if (dx > half - cornerR && dy > half - cornerR) {
            const cdx = dx - (half - cornerR);
            const cdy = dy - (half - cornerR);
            const dist = Math.sqrt(cdx * cdx + cdy * cdy);
            inside = dist <= cornerR;
            edgeDist = cornerR - dist;
          } else {
            inside = true;
            edgeDist = Math.min(half - dx, half - dy);
          }
        }

        if (inside) {
          const gradT = (x + y) / (width + height);
          r = Math.round(15 + (11 - 15) * gradT);
          g = Math.round(157 + (128 - 157) * gradT);
          b = Math.round(88 + (67 - 88) * gradT);
          a = 255;
          if (edgeDist < 1.5) {
            a = Math.max(0, Math.min(255, Math.round(edgeDist * 170)));
          }
        }
      }

      // Check if inside Document
      const inDocBase = (x >= docLeft && x <= docRight && y >= docTop && y <= docBottom);
      
      if (inDocBase) {
        // Check top-right fold area
        const inFoldRegion = (x >= foldX && y <= foldY);
        const isCutCorner = inFoldRegion && ((x - foldX) + (foldY - y) > foldSize);
        const isFoldFlap = inFoldRegion && ((x - foldX) + (foldY - y) <= foldSize);

        if (isCutCorner) {
          // This part is cut away (showing background)
          // Keep background r, g, b, a
        } else if (isFoldFlap) {
          // Folded flap (Lighter Green #34A853)
          r = 52;
          g = 168;
          b = 83;
          a = 255;
          // Fold crease shadow
          const distToCrease = Math.abs((x - foldX) + (foldY - y) - foldSize);
          if (distToCrease < 3 * s) {
            r = 11;
            g = 128;
            b = 67;
          }
        } else {
          // Main Document Body (Google Sheets Green #0F9D58)
          r = 15;
          g = 157;
          b = 88;
          a = 255;

          // Check if inside White Table / Spreadsheet Grid
          if (x >= tblLeft && x <= tblRight && y >= tblTop && y <= tblBottom) {
            const relY = y - tblTop;

            if (relY <= tblHeaderH) {
              // Table Header Row: Green header background
              r = 15;
              g = 157;
              b = 88;

              // Header vertical separator line
              if (Math.abs(x - colSplitX) < 1.5 * s) {
                r = 11;
                g = 128;
                b = 67;
              } else {
                // Header cell content indicator (white bars)
                const inBar1 = (x >= tblLeft + 10 * s && x <= colSplitX - 10 * s && relY >= 8 * s && relY <= tblHeaderH - 8 * s);
                const inBar2 = (x >= colSplitX + 10 * s && x <= tblRight - 10 * s && relY >= 8 * s && relY <= tblHeaderH - 8 * s);
                if (inBar1 || inBar2) {
                  r = 255;
                  g = 255;
                  b = 255;
                }
              }
            } else {
              // Table Data Body: Crisp White Background
              r = 255;
              g = 255;
              b = 255;

              // Grid lines
              const bodyRelY = relY - tblHeaderH;
              const isColDivider = Math.abs(x - colSplitX) < 1.5 * s;
              const isRow1Divider = Math.abs(bodyRelY - rowH) < 1.2 * s;
              const isRow2Divider = Math.abs(bodyRelY - rowH * 2) < 1.2 * s;

              if (isColDivider) {
                r = 15;
                g = 157;
                b = 88; // Green column divider
              } else if (isRow1Divider || isRow2Divider) {
                r = 226;
                g = 232;
                b = 240; // Soft slate row divider
              } else {
                // Spreadsheet Cell Content bars
                const curRowIdx = Math.floor(bodyRelY / rowH);
                const curRowTop = curRowIdx * rowH;
                const barTop = curRowTop + rowH * 0.3;
                const barBottom = curRowTop + rowH * 0.7;

                if (bodyRelY >= barTop && bodyRelY <= barBottom) {
                  // Left cell (Green highlight indicator)
                  if (x >= tblLeft + 8 * s && x <= tblLeft + (colSplitX - tblLeft) * 0.7) {
                    r = 15;
                    g = 157;
                    b = 88;
                  }
                  // Right cell (Data value bar)
                  if (x >= colSplitX + 8 * s && x <= colSplitX + (tblRight - colSplitX) * (curRowIdx === 2 ? 0.85 : 0.65)) {
                    if (curRowIdx === 2) {
                      r = 16;
                      g = 185;
                      b = 129; // Green balance
                    } else {
                      r = 148;
                      g = 163;
                      b = 184; // Slate text
                    }
                  }
                }
              }
            }
          }
        }
      }

      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// 3. Generate All Required PWA Sizes
console.log('Generating PWA icons in all standard sizes...');

const iconConfigs = [
  { name: 'pwa-512x512.png', size: 512, mode: 'any' },
  { name: 'pwa-192x192.png', size: 192, mode: 'any' },
  { name: 'pwa-maskable-512x512.png', size: 512, mode: 'maskable' },
  { name: 'pwa-maskable-192x192.png', size: 192, mode: 'maskable' },
  { name: 'apple-touch-icon.png', size: 180, mode: 'ios' },
  { name: 'apple-touch-icon-152x152.png', size: 152, mode: 'ios' },
  { name: 'apple-touch-icon-167x167.png', size: 167, mode: 'ios' },
  { name: 'favicon-32x32.png', size: 32, mode: 'any' },
  { name: 'favicon-16x16.png', size: 16, mode: 'any' },
  { name: 'favicon.ico', size: 64, mode: 'any' },
  { name: 'icon.png', size: 512, mode: 'any' },
];

for (const conf of iconConfigs) {
  const filePath = path.join(publicDir, conf.name);
  const pngBuffer = createGoogleSheetsPng(conf.size, conf.mode);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Created: ${conf.name} (${conf.size}x${conf.size})`);
}

// Also ensure dist directory has them if built
const distDir = path.resolve('dist');
if (fs.existsSync(distDir)) {
  for (const conf of iconConfigs) {
    const srcPath = path.join(publicDir, conf.name);
    const destPath = path.join(distDir, conf.name);
    fs.copyFileSync(srcPath, destPath);
  }
  fs.copyFileSync(path.join(publicDir, 'icon.svg'), path.join(distDir, 'icon.svg'));
  console.log('Synchronized all icons into dist/');
}

console.log('All PWA icons converted and generated successfully!');
