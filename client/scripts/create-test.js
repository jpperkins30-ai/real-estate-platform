#!/usr/bin/env node

/**
 * create-test.js
 * 
 * Interactive CLI script for creating properly structured test files
 * that follow project conventions.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function createTest() {
  console.log('🧪 Test File Generator');
  console.log('=====================\n');
  console.log('This utility will help you create a well-structured test file\n');
  
  // Collect test info
  const testCaseId = await question('Enter test case ID (e.g., 101): ');
  
  if (!testCaseId.match(/^\d+$/)) {
    console.error('Error: Test case ID must be a number');
    rl.close();
    return;
  }
  
  const testCaseDescription = await question('Enter test case description: ');
  
  if (!testCaseDescription.trim()) {
    console.error('Error: Test case description is required');
    rl.close();
    return;
  }
  
  const componentType = await question('What are you testing? (component/hook/service/other): ');
  
  let componentName = await question('Enter name of the component/hook/service being tested: ');
  
  if (!componentName.trim()) {
    console.error('Error: Component/hook/service name is required');
    rl.close();
    return;
  }
  
  // Ensure proper casing for component name
  componentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  let category = await question('Enter category (optional, e.g., multiframe): ');
  
  // Generate filename
  let fileName = `TC${testCaseId}_`;
  
  if (category.trim()) {
    fileName += `${category.toLowerCase()}_`;
  }
  
  fileName += `${componentName}.test.`;
  
  // Determine file extension
  if (componentType.toLowerCase() === 'component') {
    fileName += 'tsx';
  } else {
    fileName += 'ts';
  }
  
  // Generate test file content
  let content = `// Test Case ${testCaseId}: ${testCaseDescription}\n`;
  
  // Add imports based on component type
  if (componentType.toLowerCase() === 'component') {
    content += `import { render, screen, fireEvent } from '@testing-library/react';\n`;
    
    // Determine the import path
    const importPath = category.trim() 
      ? `../components/${category.toLowerCase()}/${componentName}`
      : `../components/${componentName}`;
    
    content += `import ${componentName} from '${importPath}';\n\n`;
    
    // Add describe block with basic tests
    content += `describe('${componentName}', () => {\n`;
    content += `  it('renders correctly', () => {\n`;
    content += `    render(<${componentName} />);\n`;
    content += `    // Add assertions here\n`;
    content += `  });\n\n`;
    content += `  it('handles user interaction correctly', () => {\n`;
    content += `    // Add interaction tests here\n`;
    content += `  });\n`;
    content += `});\n`;
  } else if (componentType.toLowerCase() === 'hook') {
    content += `import { renderHook, act } from '@testing-library/react-hooks';\n`;
    
    // Determine the import path for hook
    const hookName = componentName.startsWith('use') ? componentName : `use${componentName}`;
    const importPath = category.trim() 
      ? `../hooks/${category.toLowerCase()}/${hookName}`
      : `../hooks/${hookName}`;
    
    content += `import ${hookName} from '${importPath}';\n\n`;
    
    // Add describe block with basic tests
    content += `describe('${hookName}', () => {\n`;
    content += `  it('returns the initial state correctly', () => {\n`;
    content += `    const { result } = renderHook(() => ${hookName}());\n`;
    content += `    // Add assertions here\n`;
    content += `  });\n\n`;
    content += `  it('updates state correctly', () => {\n`;
    content += `    const { result } = renderHook(() => ${hookName}());\n`;
    content += `    act(() => {\n`;
    content += `      // Call hook methods here\n`;
    content += `    });\n`;
    content += `    // Add assertions here\n`;
    content += `  });\n`;
    content += `});\n`;
  } else {
    // Service or other type
    content += `import ${componentName} from '../services/${componentName.toLowerCase()}';\n\n`;
    content += `describe('${componentName}', () => {\n`;
    content += `  it('functions correctly', () => {\n`;
    content += `    // Add test implementation here\n`;
    content += `  });\n`;
    content += `});\n`;
  }
  
  // Define output path
  const outputPath = path.join('src', '__tests__', fileName);
  
  // Confirm creation
  console.log('\nAbout to create a new test file:');
  console.log(`File: ${outputPath}`);
  console.log('\nPreview:');
  console.log('----------------------------------------');
  console.log(content);
  console.log('----------------------------------------');
  
  const confirmation = await question('\nCreate this file? (y/n): ');
  
  if (confirmation.toLowerCase() === 'y') {
    try {
      fs.writeFileSync(outputPath, content);
      console.log(`\n✅ Test file created successfully: ${outputPath}`);
    } catch (error) {
      console.error(`\n❌ Error creating file: ${error.message}`);
    }
  } else {
    console.log('\nFile creation cancelled');
  }
  
  rl.close();
}

createTest(); 