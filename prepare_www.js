const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');

if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

// Arquivos principais a copiar
const filesToCopy = ['index.html', 'styles.css', 'app.js', 'churches-data.js', 'studies-data.js'];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(wwwDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copiado: ${file} -> www/${file}`);
  }
});

// Copiar pasta assets
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  const files = fs.readdirSync(source);
  files.forEach(file => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(wwwDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  copyFolderRecursiveSync(assetsSrc, assetsDest);
  console.log('Pasta assets copiada para www/assets');
}

console.log('Diretório www preparado com sucesso!');
