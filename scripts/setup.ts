import { execSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';

function main() {
  console.log('\n  Front-End Development Framework Setup\n');

  console.log('  Installing dependencies...');
  execSync('bun install', { stdio: 'inherit' });

  if (!existsSync('.env.local')) {
    copyFileSync('.env.example', '.env.local');
    console.log('  Created .env.local from .env.example');
  } else {
    console.log('  .env.local already exists, skipping');
  }

  console.log("\n  Setup complete. Run 'bun dev' to start.\n");
}

main();
