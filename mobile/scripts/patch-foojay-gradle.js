/**
 * Gradle 9 removed JvmVendorSpec.IBM_SEMERU; RN 0.85 still pins foojay 0.5.0.
 * Bump to 1.0.0 after every npm install. See react-native#55781.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '../node_modules/@react-native/gradle-plugin/settings.gradle.kts',
);

if (!fs.existsSync(file)) {
  console.log('patch-foojay: gradle-plugin settings not found, skipping.');
  process.exit(0);
}

const content = fs.readFileSync(file, 'utf8');
const fixed = content.replace(
  'foojay-resolver-convention").version("0.5.0")',
  'foojay-resolver-convention").version("1.0.0")',
);

if (fixed !== content) {
  fs.writeFileSync(file, fixed);
  console.log('Patched foojay-resolver-convention to 1.0.0 for Gradle 9');
} else {
  console.log('patch-foojay: already patched or pattern not found.');
}
