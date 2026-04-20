/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const toolCall = payload?.data?.toolCall;
    
    if (toolCall && (toolCall.name === 'write_file' || toolCall.name === 'replace')) {
      const filePath = toolCall.parameters.file_path;
      if (filePath && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
        console.error(`[Hook] Running ESLint auto-fix on ${filePath}...`);
        try {
          execSync(`npx eslint --fix ${filePath}`, { stdio: 'pipe' });
          console.error(`[Hook] Successfully linted ${filePath}`);
        } catch {
          console.error(`[Hook] Linting failed or produced warnings for ${filePath}`);
        }
      }
    }
    
    // 원본 페이로드를 그대로 반환
    console.log(JSON.stringify(payload));
    process.exit(0);
  } catch (err) {
    console.error('[Hook Error]', err.message);
    process.exit(1);
  }
});
