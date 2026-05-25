const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
const outputPath = path.resolve(__dirname, '..', 'src', 'app', 'config', 'build-info.ts');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const appVersion = packageJson.version || '0.0.0';
const buildDate = new Date().toISOString();
const buildVersion = `v${appVersion} (${buildDate})`;

const fileContent = `export const BUILD_VERSION = '${buildVersion}';\n`;

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log(`Generated ${outputPath} with BUILD_VERSION=${buildVersion}`);
