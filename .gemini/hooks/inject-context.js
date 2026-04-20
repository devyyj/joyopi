/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    
    let schemaInfo = 'Schema not found.';
    try {
      const schemaPath = path.join(process.cwd(), 'db', 'schema.ts');
      if (fs.existsSync(schemaPath)) {
         // 컨텍스트 크기를 고려해 상단 30줄만 추출 (주로 테이블 정의부)
         schemaInfo = fs.readFileSync(schemaPath, 'utf8').split('\n').slice(0, 30).join('\n') + '\n... (truncated)';
      }
    } catch (e) {
      schemaInfo = `Error reading schema: ${e.message}`;
    }

    if (!payload.data) payload.data = {};
    if (!payload.data.context) payload.data.context = [];
    
    payload.data.context.push({
      type: 'text',
      text: `<hook_context>\n[DB Schema Preview]\n${schemaInfo}\n</hook_context>`
    });

    console.log(JSON.stringify(payload));
    process.exit(0);
  } catch (err) {
    console.error('[Hook Error]', err.message);
    process.exit(1);
  }
});
