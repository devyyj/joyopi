const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/memechat/hooks/useMotionDetection.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the line "      } }" with a single "      }" and correct formatting
const badStr = '        if (ctx && width > 0 && height > 0) {\n          drawScene(ctx, width, height);\n        }\n      } }\n\n      animationFrameRef.current = requestAnimationFrame(predictLoop);\n    }';

const goodStr = '        if (ctx && width > 0 && height > 0) {\n          drawScene(ctx, width, height);\n        }\n      }\n\n      animationFrameRef.current = requestAnimationFrame(predictLoop);\n    }';

// Since newlines might differ (CRLF vs LF on Windows), let's use a regex or normalize newlines.
content = content.replace(/\r\n/g, '\n');

if (content.includes('} }\n\n      animationFrameRef.current = requestAnimationFrame(predictLoop);\n    }')) {
  content = content.replace('} }\n\n      animationFrameRef.current = requestAnimationFrame(predictLoop);\n    }', '}\n\n      animationFrameRef.current = requestAnimationFrame(predictLoop);\n    }');
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Successfully fixed brace balance in useMotionDetection.ts!');
} else {
  console.log('Could not find the target brace pattern.');
}
