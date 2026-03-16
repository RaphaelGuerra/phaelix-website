import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const indexPath = path.join(rootDir, 'index.html');
const localesDir = path.join(rootDir, 'locales');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const requiredKeys = [...new Set([...indexHtml.matchAll(/data-key="([^"]+)"/g)].map((m) => m[1]))];
const requiredSet = new Set(requiredKeys);

const localeFiles = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith('.json'))
  .sort();

let hasErrors = false;

for (const file of localeFiles) {
  const filePath = path.join(localesDir, file);
  const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const dictKeys = Object.keys(dict);

  const missing = requiredKeys.filter((key) => !Object.prototype.hasOwnProperty.call(dict, key));
  const unused = dictKeys.filter((key) => !requiredSet.has(key));

  if (missing.length > 0) {
    hasErrors = true;
    console.error(`\n[validate:i18n] ${file} is missing ${missing.length} key(s):`);
    missing.forEach((key) => console.error(`  - ${key}`));
  }

  if (unused.length > 0) {
    console.warn(`\n[validate:i18n] ${file} has ${unused.length} unused key(s):`);
    unused.forEach((key) => console.warn(`  - ${key}`));
  }
}

if (hasErrors) {
  console.error(
    '\n[validate:i18n] Failed: locale coverage does not match index.html data-key usage.',
  );
  process.exit(1);
}

console.log(
  `[validate:i18n] Passed: ${localeFiles.length} locale files cover ${requiredKeys.length} data-key values.`,
);
