/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const toolCall = payload?.data?.toolCall;
    
    if (toolCall && toolCall.name === 'run_shell_command' && toolCall.parameters.command.includes('git commit')) {
      console.error(`[Hook] 'git commit' detected. Running safety check (npm run verify)...`);
      try {
        execSync('npm run verify', { stdio: 'inherit' });
        console.error(`[Hook] Safety check passed. Committing...`);
      } catch (e) {
        console.error(`[Hook] 🚨 Safety check (npm run verify) failed! Commit blocked.`, e.message);
        // Exit code 2 tells the CLI to block the tool call
        process.exit(2);
      }
    }
    
    console.log(JSON.stringify(payload));
    process.exit(0);
  } catch (err) {
    console.error('[Hook Error]', err.message);
    process.exit(1);
  }
});
