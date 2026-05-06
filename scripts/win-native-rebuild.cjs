/**
 * afterPack hook for electron-builder.
 * Downloads the pre-built Windows binary for better-sqlite3 and replaces
 * the Linux binary that was compiled on this machine.
 *
 * Runs automatically when building with --win target.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const BETTER_SQLITE3_VERSION = '12.9.0';
const ELECTRON_ABI = '145'; // Electron 41.x
const PLATFORM = 'win32';
const ARCH = 'x64';

const TARBALL_NAME = `better-sqlite3-v${BETTER_SQLITE3_VERSION}-electron-v${ELECTRON_ABI}-${PLATFORM}-${ARCH}.tar.gz`;
const DOWNLOAD_URL = `https://github.com/WiseLibs/better-sqlite3/releases/download/v${BETTER_SQLITE3_VERSION}/${TARBALL_NAME}`;

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const follow = (u) => {
      https.get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: HTTP ${res.statusCode} for ${u}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

exports.default = async function (context) {
  // Only run when building for Windows
  if (context.electronPlatformName !== 'win32') return;

  const appOutDir = context.appOutDir;
  const nativeModuleDir = path.join(
    appOutDir,
    'resources',
    'app.asar.unpacked',
    'node_modules',
    'better-sqlite3',
    'build',
    'Release'
  );
  const targetNode = path.join(nativeModuleDir, 'better_sqlite3.node');

  console.log(`\n[win-native-rebuild] Replacing Linux binary with Windows prebuild...`);
  console.log(`[win-native-rebuild] Target: ${targetNode}`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bsql3-win-'));
  const tarballPath = path.join(tmpDir, TARBALL_NAME);

  try {
    console.log(`[win-native-rebuild] Downloading: ${DOWNLOAD_URL}`);
    await download(DOWNLOAD_URL, tarballPath);

    // Extract only the .node file from the tarball
    execSync(`tar -xzf "${tarballPath}" -C "${tmpDir}" --wildcards "*.node"`, { stdio: 'inherit' });

    const extracted = fs.readdirSync(tmpDir, { recursive: true })
      .find(f => f.toString().endsWith('.node'));

    if (!extracted) throw new Error('No .node file found in tarball');

    const srcNode = path.join(tmpDir, extracted.toString());
    fs.mkdirSync(nativeModuleDir, { recursive: true });
    fs.copyFileSync(srcNode, targetNode);

    console.log(`[win-native-rebuild] Replaced with Windows binary successfully.`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};
