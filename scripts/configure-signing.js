const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.error('build.gradle not found at', buildGradlePath);
  console.error('Run "npx expo prebuild --platform android" first');
  process.exit(1);
}

let content = fs.readFileSync(buildGradlePath, 'utf8');

const releaseBlock = `        release {
            storeFile file('release.keystore')
            storePassword 'android'
            keyAlias 'release'
            keyPassword 'android'
        }
`;

const signingConfigsMatch = content.match(/signingConfigs\s*\{/);
if (!signingConfigsMatch) {
  console.error('Could not find signingConfigs block in build.gradle');
  process.exit(1);
}

content = content.replace(
  /(signingConfigs\s*\{)([\s\S]*?)(^    \})/m,
  (match, open, inner, close) => {
    if (inner.includes('release')) {
      return match;
    }
    return `${open}${inner}${releaseBlock}${close}`;
  }
);

content = content.replace(
  /(release\s*\{[\s\S]*?signingConfig\s+)signingConfigs\.debug/m,
  '$1signingConfigs.release'
);

if (content.includes('signingConfigs.release')) {
  fs.writeFileSync(buildGradlePath, content);
  console.log('✓ Release signing config injected into android/app/build.gradle');
} else {
  console.log('⚠ Could not find debug signing config to replace. Attempting alternative...');
  content = content.replace(
    /(release\s*\{[\s\S]*?\})/m,
    (match) => {
      if (match.includes('signingConfig')) return match;
      return match.replace(/(\n    \})/, '\n            signingConfig signingConfigs.release$1');
    }
  );
  fs.writeFileSync(buildGradlePath, content);
  console.log('✓ Fallback signing config injected');
}
