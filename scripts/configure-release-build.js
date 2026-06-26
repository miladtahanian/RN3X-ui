const fs = require('fs');
const path = require('path');

const version = process.env.RELEASE_VERSION || '1.0.5';
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.error('build.gradle not found at:', buildGradlePath);
  process.exit(1);
}

let content = fs.readFileSync(buildGradlePath, 'utf8');

content = content.replace(
  /enableSeparateBuildPerCPUArchitecture\s*=\s*(true|false)/,
  'enableSeparateBuildPerCPUArchitecture = true'
);

content = content.replace(
  /versionName\s+"[^"]*"/,
  `versionName "${version}"`
);

const parts = version.split('.').map(Number);
const versionCode = parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
content = content.replace(
  /versionCode\s+\d+/,
  `versionCode ${versionCode}`
);

if (!content.includes('abi {')) {
  const splitsBlock = `
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk true
        }
    }
`;
  content = content.replace(
    /(defaultConfig\s*\{[\s\S]*?\n    \})/,
    (match) => match + splitsBlock
  );
}

if (!content.includes('applicationVariants.all')) {
  const namingBlock = `
    applicationVariants.all { variant ->
        variant.outputs.each { output ->
            def abi = output.getFilter(com.android.build.OutputFile.ABI)
            if (abi == null) abi = "universal"
            output.outputFileName = "RN3X-ui-${version}-" + abi + ".apk"
        }
    }
`;
  const lastBrace = content.lastIndexOf('}');
  if (lastBrace > 0) {
    content = content.substring(0, lastBrace) + namingBlock + '\n}';
  }
}

const releaseBuildTypeMatch = content.match(
  /release\s*\{[\s\S]*?\n    \}/
);
if (releaseBuildTypeMatch) {
  let releaseBlock = releaseBuildTypeMatch[0];
  if (!releaseBlock.includes('minifyEnabled')) {
    releaseBlock = releaseBlock.replace(
      /(release\s*\{)/,
      '$1\n            minifyEnabled true\n            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"'
    );
    content = content.replace(releaseBuildTypeMatch[0], releaseBlock);
  }
}

content = content.replace(
  /(hermesEnabled\s*=\s*)(true|false)/,
  '$1true'
);
content = content.replace(
  /(enableHermes:\s*)(true|false)/,
  '$1true'
);

fs.writeFileSync(buildGradlePath, content, 'utf8');
console.log(`Build configured for version ${version} with ABI splits`);

fs.writeFileSync(
  path.join(__dirname, '..', 'android', 'app', 'proguard-rules.pro'),
  `-keep class ir.tahanian.rnpanel.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
`,
  'utf8'
);
console.log('proguard-rules.pro created');
