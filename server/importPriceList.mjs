import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function run() {
  const dataBuffer = fs.readFileSync('/home/ubuntu/upload/GGNPRICELIST2026MAY.pdf');
  const pdfData = await pdfParse(dataBuffer);
  const text = pdfData.text;
  
  console.log("PDF Extracted Length:", text.length);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let currentBrand = 'Ouroboros Labs';
  let currentCategory = 'Peptides';
  
  const parsedProducts = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('OUROBOROS LABS')) {
      currentBrand = 'Ouroboros Labs';
      continue;
    }
    if (line.includes('KEIFEI')) {
      currentBrand = 'Keifei Pharmaceuticals';
      continue;
    }
    if (line.includes('UPA LABS')) {
      currentBrand = 'UPA Labs';
      continue;
    }
    if (line.includes('GENESIS') || line.includes('BIOLAB')) {
      currentBrand = null;
      continue;
    }
    
    if (line === 'PEPTIDES' || line === 'INJECTABLE OILS' || line === 'ORALS' || line === 'SARMS' || line === 'HYBRID INJECTABLES' || line === 'GROWTH HORMONE') {
      currentCategory = line.charAt(0) + line.slice(1).toLowerCase();
      continue;
    }
    
    if (line.match(/R\s*[\d,]+/)) {
      if (!currentBrand) continue;
      parsedProducts.push({
        brand: currentBrand,
        category: currentCategory,
        line
      });
    }
  }

  console.log("Parsed sample products:", parsedProducts.slice(0, 15));
  console.log("Total parsed product lines:", parsedProducts.length);
}

run().catch(console.error);
