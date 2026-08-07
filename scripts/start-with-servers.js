const { exec } = require('child_process');
const killPort = require('kill-port');

async function run(command) {
  return new Promise((resolve, reject) => {
    const proc = exec(command, { env: process.env, cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });

    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
  });
}

(async () => {
  try {
    console.log('Membersihkan port 3000 dan 8081 jika digunakan...');
    await killPort(3000, 'tcp');
    await killPort(8081, 'tcp');

    console.log('Menjalankan auth server...');
    const auth = exec('node auth/server.js', { env: process.env, cwd: process.cwd() });
    auth.stdout.pipe(process.stdout);
    auth.stderr.pipe(process.stderr);

    console.log('Menjalankan Expo di LAN...');
    const expo = exec('npx expo start --lan --clear --dev-client', { env: process.env, cwd: process.cwd() });
    expo.stdout.pipe(process.stdout);
    expo.stderr.pipe(process.stderr);
  } catch (err) {
    console.error('Gagal menjalankan startup helper:', err);
    process.exit(1);
  }
})();
