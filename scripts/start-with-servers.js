const { spawn } = require('child_process');

const args = process.argv.slice(2);
const enableAuth = args.includes('--auth') || process.env.START_AUTH_SERVER === 'true' || process.env.AUTH_SERVER === 'true' || process.env.ENABLE_AUTH === 'true';

const commands = [];
if (enableAuth) {
  commands.push({
    name: 'auth',
    command: 'node',
    args: ['auth/server.js'],
  });
}

commands.push({
  name: 'expo',
  command: 'npx',
  args: ['expo', 'start', '--lan', '--clear'],
});

const processes = commands.map((cmd) => {
  const child = spawn(cmd.command, cmd.args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`${cmd.name} process exited with code ${code}`);
    }
  });

  child.on('error', (error) => {
    console.error(`Failed to start ${cmd.name} process:`, error);
  });

  return child;
});

function shutdown() {
  processes.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  });
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
