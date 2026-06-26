const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('Usage: node extract-changelog.js <version>');
  process.exit(1);
}

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const content = fs.readFileSync(changelogPath, 'utf8');

const sectionRegex = new RegExp(
  `## \\[${version.replace(/\./g, '\\.')}\\] - [\\d-]+\\n\\n([\\s\\S]*?)(?=\\n## \\[|\\n?$)`
);
const match = content.match(sectionRegex);

if (match) {
  const sectionContent = match[1].trim();
  const outputPath = path.join(__dirname, '..', 'release-changelog.md');
  fs.writeFileSync(outputPath, sectionContent, 'utf8');
  console.log('Changelog extracted for version', version);
} else {
  console.error('Changelog section not found for version', version);
  process.exit(1);
}
