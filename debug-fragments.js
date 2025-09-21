const fs = require('fs');
const path = require('path');

// Function to find all JSX files
function findJSXFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findJSXFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to check for Fragment issues
function checkFragmentIssues(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Check for React.Fragment with style
    if (line.includes('React.Fragment') && line.includes('style')) {
      issues.push({
        file: filePath,
        line: lineNum,
        content: line.trim(),
        issue: 'React.Fragment with style prop'
      });
    }
    
    // Check for <> with style
    if (line.includes('<>') && line.includes('style')) {
      issues.push({
        file: filePath,
        line: lineNum,
        content: line.trim(),
        issue: 'Fragment shorthand with style prop'
      });
    }
    
    // Check for Fragment with any invalid props
    if ((line.includes('<>') || line.includes('React.Fragment')) && 
        (line.includes('style=') || line.includes('className=') || line.includes('id='))) {
      issues.push({
        file: filePath,
        line: lineNum,
        content: line.trim(),
        issue: 'Fragment with invalid props'
      });
    }
  }
  
  return issues;
}

console.log('🔍 Scanning for React Fragment issues...\n');

const projectRoot = __dirname;
const jsxFiles = findJSXFiles(projectRoot);
let totalIssues = 0;

for (const file of jsxFiles) {
  const issues = checkFragmentIssues(file);
  if (issues.length > 0) {
    console.log(`❌ ${path.relative(projectRoot, file)}:`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.issue}`);
      console.log(`   Code: ${issue.content}`);
      console.log('');
    });
    totalIssues += issues.length;
  }
}

if (totalIssues === 0) {
  console.log('✅ No Fragment issues found in JSX files');
} else {
  console.log(`❌ Found ${totalIssues} Fragment issues`);
}

console.log('\n🔍 Checking for other potential React errors...');

// Check for common React errors
for (const file of jsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for missing keys in lists
  if (content.includes('.map(') && !content.includes('key=')) {
    console.log(`⚠️  ${path.relative(projectRoot, file)}: Potential missing key in map`);
  }
  
  // Check for incorrect prop types
  if (content.includes('style={styles.') && content.includes('<>')) {
    console.log(`⚠️  ${path.relative(projectRoot, file)}: Fragment with style reference`);
  }
}
