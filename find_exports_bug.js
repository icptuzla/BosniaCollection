import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'dist', 'assets');
const filePath = path.join(assetsDir, 'chunk-vendor-D6BNcwK6.js');
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const index = content.indexOf('function Dl()');
  if (index !== -1) {
    const snippet = content.substring(index, index + 1600);
    console.log("Snippet from chunk-vendor around function Dl() (larger):");
    console.log(snippet);
  }
}
