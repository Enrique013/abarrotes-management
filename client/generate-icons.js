import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];
const color = '#3b82f6'; // Azul

async function generateIcons() {
  for (const size of sizes) {
    // Crear un SVG simple
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${size * 0.16}" fill="${color}"/>
        <g transform="translate(${size/2}, ${size/2})">
          <!-- Bolsa de compras -->
          <rect x="${-size * 0.15}" y="${-size * 0.1}" width="${size * 0.3}" height="${size * 0.35}" fill="white" rx="${size * 0.02}"/>
          <!-- Asa -->
          <path d="M ${-size * 0.08} ${-size * 0.1} Q ${-size * 0.08} ${-size * 0.18}, 0 ${-size * 0.18} Q ${size * 0.08} ${-size * 0.18}, ${size * 0.08} ${-size * 0.1}"
                stroke="white" stroke-width="${size * 0.015}" fill="none"/>
        </g>
        <text x="${size/2}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.1}" font-weight="bold" fill="white" text-anchor="middle">ABARROTES</text>
      </svg>
    `;

    const outputPath = join(__dirname, 'public', `icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generado: icon-${size}.png`);
  }

  console.log('\n✓ Todos los íconos generados correctamente');
}

generateIcons().catch(console.error);
