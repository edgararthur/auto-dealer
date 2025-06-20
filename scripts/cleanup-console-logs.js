#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Script to clean up console.log statements for production readiness
 * This will wrap console statements in development environment checks
 */

const PATTERNS_TO_WRAP = [
  /console\.log\s*\(/g,
  /console\.warn\s*\(/g,
  /console\.info\s*\(/g,
  /console\.debug\s*\(/g
];

const PATTERNS_TO_KEEP = [
  /console\.error\s*\(/g // Keep error logs for production debugging
];

function shouldProcessFile(filePath) {
  // Skip node_modules, dist, build directories
  if (filePath.includes('node_modules') || 
      filePath.includes('dist') || 
      filePath.includes('build') ||
      filePath.includes('.git')) {
    return false;
  }
  
  // Only process JavaScript/TypeScript/JSX files
  const ext = path.extname(filePath);
  return ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
}

function wrapConsoleStatement(content) {
  let modified = content;
  let hasChanges = false;
  
  PATTERNS_TO_WRAP.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      // Replace console.log( with conditional logging
      modified = modified.replace(pattern, (match) => {
        hasChanges = true;
        const method = match.replace('console.', '').replace('(', '');
        return `if (process.env.NODE_ENV === 'development') {\n    console.${method}(`;
      });
    }
  });
  
  // Add closing braces for conditional blocks
  if (hasChanges) {
    // This is a simple approach - for complex scenarios, 
    // you might need a proper AST parser
    const lines = modified.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      newLines.push(line);
      
      // If line contains our conditional console statement
      if (line.includes('if (process.env.NODE_ENV === \'development\') {') && 
          line.includes('console.')) {
        // Find the matching closing parenthesis and semicolon
        let j = i;
        let parenCount = 0;
        let foundClosing = false;
        
        while (j < lines.length && !foundClosing) {
          const currentLine = lines[j];
          for (let k = 0; k < currentLine.length; k++) {
            if (currentLine[k] === '(') parenCount++;
            if (currentLine[k] === ')') parenCount--;
            if (parenCount === 0 && currentLine[k] === ')') {
              foundClosing = true;
              break;
            }
          }
          if (foundClosing) {
            // Add the closing brace after this line
            if (j > i) {
              newLines.push('  }');
            } else {
              // Single line console statement
              newLines[newLines.length - 1] = line.replace(/;?\s*$/, ';');
              newLines.push('  }');
            }
          }
          j++;
        }
      }
    }
    
    modified = newLines.join('\n');
  }
  
  return { content: modified, hasChanges };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = wrapConsoleStatement(content);
    
    if (result.hasChanges) {
      fs.writeFileSync(filePath, result.content, 'utf8');
      console.log(`✅ Processed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🧹 Cleaning up console.log statements for production...\n');
  
  // Find all JavaScript/TypeScript files
  const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  
  let processedCount = 0;
  let totalFiles = 0;
  
  files.forEach(file => {
    if (shouldProcessFile(file)) {
      totalFiles++;
      if (processFile(file)) {
        processedCount++;
      }
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Files modified: ${processedCount}`);
  console.log(`   Files unchanged: ${totalFiles - processedCount}`);
  
  if (processedCount > 0) {
    console.log('\n✨ Console.log cleanup completed!');
    console.log('   All console.log statements are now wrapped in development checks.');
    console.log('   In production, these logs will be automatically disabled.');
  } else {
    console.log('\n✅ No console.log statements found that needed cleanup.');
  }
  
  console.log('\n📝 Next steps:');
  console.log('   1. Review the changes and test functionality');
  console.log('   2. Run your application in development mode to verify logs still work');
  console.log('   3. Build for production and verify logs are disabled');
  console.log('   4. Commit the changes to version control');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, wrapConsoleStatement }; 