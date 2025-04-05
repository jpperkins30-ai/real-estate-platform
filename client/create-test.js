#!/usr/bin/env node

/**
 * Test Generator Script
 * 
 * This script generates properly structured test files based on the flattened test directory structure.
 * It includes test case IDs from the test plan and ensures test IDs are valid.
 * 
 * Usage: node create-test.js --component=components/multiframe/layouts/DualPanelLayout --testid=TC201
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
let targetPath = '';
let testCaseId = '';

// Process arguments
args.forEach(arg => {
  if (arg.startsWith('--component=')) {
    targetPath = arg.substring('--component='.length);
  } else if (arg.startsWith('--testid=')) {
    testCaseId = arg.substring('--testid='.length);
  }
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load test plan
let testPlan = { testCases: [] };
const testPlanPath = path.join(process.cwd(), 'test-plan.json');

if (fs.existsSync(testPlanPath)) {
  try {
    const testPlanContent = fs.readFileSync(testPlanPath, 'utf8');
    testPlan = JSON.parse(testPlanContent);
    console.log(`Loaded test plan with ${testPlan.testCases.length} test cases.`);
  } catch (error) {
    console.error(`Error loading test plan: ${error.message}`);
  }
} else {
  console.warn('Warning: Test plan not found. Test case ID validation will be skipped.');
}

// Main function
async function main() {
  try {
    // If no path provided via arguments, prompt user
    if (!targetPath) {
      targetPath = await promptForInput('Enter component path (e.g., components/multiframe/layouts/DualPanelLayout): ');
    }

    // Process the path
    const pathSegments = targetPath.split('/');
    const componentName = pathSegments[pathSegments.length - 1];
    const category = pathSegments[0];
    
    // Check if it's a valid category
    const validCategories = ['components', 'services', 'hooks', 'context', 'utils'];
    if (!validCategories.includes(category)) {
      console.error(`Error: Invalid category '${category}'. Must be one of: ${validCategories.join(', ')}`);
      process.exit(1);
    }
    
    // If no test case ID provided, prompt user or show available IDs
    if (!testCaseId) {
      // Find relevant test case IDs from the test plan
      const relevantTestCases = testPlan.testCases.filter(tc => 
        tc.description.includes(componentName) || 
        tc.id.startsWith(getTestIdPrefix(category))
      );
      
      if (relevantTestCases.length > 0) {
        console.log('\nFound potentially relevant test cases:');
        relevantTestCases.forEach(tc => {
          console.log(`- ${tc.id}: ${tc.description}`);
        });
        
        testCaseId = await promptForInput('\nEnter test case ID from the list above: ');
      } else {
        console.log('No specific test cases found for this component.');
        testCaseId = await promptForInput('Enter test case ID (e.g., TC101): ');
      }
    }
    
    // Validate test case ID
    if (!/^TC\d+$/.test(testCaseId)) {
      console.error(`Error: Invalid test case ID format '${testCaseId}'. Should be like 'TC101'.`);
      process.exit(1);
    }
    
    // Check if test case ID exists in test plan
    const testCaseExists = testPlan.testCases.some(tc => tc.id === testCaseId);
    if (!testCaseExists) {
      console.warn(`Warning: Test case ID '${testCaseId}' not found in test plan. This may cause validation errors.`);
      
      // Ask if the user wants to continue
      const proceed = await promptForInput('Do you want to proceed anyway? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Test creation canceled.');
        process.exit(0);
      }
    }
    
    // Create test file name in flattened structure
    const testFilePath = createTestFilePath(pathSegments);
    
    // Determine template type based on category
    const templateType = determineTemplateType(category, componentName);
    
    // Get test content based on template
    const testContent = generateTestContent(templateType, pathSegments, componentName, testCaseId);
    
    // Create the test file
    createTestFile(testFilePath, testContent);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Helper function for user prompts
function promptForInput(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Function to create the test file path
function createTestFilePath(pathSegments) {
  // Convert path segments to flattened format
  const flatPathSegments = pathSegments.join('_');
  
  // Determine file extension based on component type
  let extension = 'ts';
  if (pathSegments[0] === 'components') {
    extension = 'tsx';
  }
  
  // Create test file path
  const testDir = path.join(process.cwd(), 'src/__tests__');
  
  // Make sure directory exists
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  return path.join(testDir, `${flatPathSegments}.test.${extension}`);
}

// Function to determine template type
function determineTemplateType(category, componentName) {
  if (category === 'components') {
    if (componentName.includes('Layout')) {
      return 'layout-component';
    }
    return 'component';
  }
  
  if (category === 'hooks') {
    return 'hook';
  }
  
  if (category === 'services') {
    return 'service';
  }
  
  if (category === 'context') {
    return 'context';
  }
  
  return 'util';
}

// Function to get test ID prefix based on category
function getTestIdPrefix(category) {
  const prefixMap = {
    components: 'TC7',
    hooks: 'TC6',
    services: 'TC5',
    context: 'TC9',
    utils: 'TC8'
  };
  
  return prefixMap[category] || 'TC';
}

// Function to generate test content based on template
function generateTestContent(templateType, pathSegments, componentName, testCaseId) {
  // Find test case description from test plan
  const testCase = testPlan.testCases.find(tc => tc.id === testCaseId);
  const testDescription = testCase ? testCase.description : `Test ${componentName}`;
  
  // Calculate import path
  const importPath = `../../src/${pathSegments.join('/')}`;
  
  // Basic content based on template
  switch (templateType) {
    case 'layout-component':
      return generateLayoutComponentTest(importPath, componentName, pathSegments, testCaseId, testDescription);
    case 'component':
      return generateComponentTest(importPath, componentName, testCaseId, testDescription);
    case 'hook':
      return generateHookTest(importPath, componentName, testCaseId, testDescription);
    case 'service':
      return generateServiceTest(importPath, componentName, testCaseId, testDescription);
    case 'context':
      return generateContextTest(importPath, componentName, testCaseId, testDescription);
    default:
      return generateUtilTest(importPath, componentName, testCaseId, testDescription);
  }
}

// Generate layout component test template
function generateLayoutComponentTest(importPath, componentName, pathSegments, testCaseId, testDescription) {
  return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ${componentName} } from '${importPath}';

// Mock PanelContainer component
vi.mock('../../src/components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={\`panel-container-\${id}\`}>
      <div data-testid={\`panel-title-\${id}\`}>{title}</div>
      <div data-testid={\`panel-content-type-\${id}\`}>{contentType}</div>
    </div>
  )
}));

describe('${componentName}', () => {
  it('${testCaseId}: renders panels with the correct props', () => {
    const panels = [
      {
        id: 'panel-1',
        title: 'Panel 1',
        contentType: 'map',
        position: { row: 0, col: 0 }
      },
      // Add more panels based on layout type
    ];
    
    render(<${componentName} panels={panels} />);
    
    // Add assertions based on layout type
    expect(screen.getByTestId('panel-container-panel-1')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-panel-1')).toHaveTextContent('Panel 1');
  });
  
  // Add more tests with different test case IDs as needed
  // it('TC{another-id}: shows empty message when insufficient panels are provided', () => {
  //   render(<${componentName} panels={[]} />);
  //   
  //   // Add assertions for empty state
  // });
});
`;
}

// Generate component test template
function generateComponentTest(importPath, componentName, testCaseId, testDescription) {
  return `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ${componentName} } from '${importPath}';

describe('${componentName}', () => {
  it('${testCaseId}: ${testDescription}', () => {
    render(<${componentName} />);
    
    // Add assertions based on component functionality
  });
  
  // Add more tests with different test case IDs as needed
  // it('TC{another-id}: handles user interactions', () => {
  //   const handleClick = vi.fn();
  //   render(<${componentName} onClick={handleClick} />);
  //   
  //   // Example: fireEvent.click(screen.getByRole('button'));
  //   // expect(handleClick).toHaveBeenCalled();
  // });
});
`;
}

// Generate hook test template
function generateHookTest(importPath, componentName, testCaseId, testDescription) {
  return `import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ${componentName} } from '${importPath}';

describe('${componentName}', () => {
  it('${testCaseId}: ${testDescription}', () => {
    const { result } = renderHook(() => ${componentName}());
    
    // Add assertions for initial state
    // Example: expect(result.current.value).toBe(initialValue);
  });
  
  // Add more tests with different test case IDs as needed
  // it('TC{another-id}: updates state correctly', () => {
  //   const { result } = renderHook(() => ${componentName}());
  //   
  //   act(() => {
  //     // Call a method from the hook
  //     // result.current.updateValue(newValue);
  //   });
  //   
  //   // Add assertions for updated state
  //   // Example: expect(result.current.value).toBe(newValue);
  // });
});
`;
}

// Generate service test template
function generateServiceTest(importPath, componentName, testCaseId, testDescription) {
  return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ${componentName} from '${importPath}';

// Mock dependencies
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('${componentName}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('${testCaseId}: ${testDescription}', async () => {
    // Setup mocks
    // Example: axios.get.mockResolvedValueOnce({ data: mockData });
    
    // Call service method
    // const result = await ${componentName}.fetchData();
    
    // Add assertions
    // Example: expect(axios.get).toHaveBeenCalledWith(expectedUrl);
    // Example: expect(result).toEqual(mockData);
  });
  
  // Add more tests with different test case IDs as needed
  // it('TC{another-id}: handles errors correctly', async () => {
  //   // Setup mocks to throw error
  //   // Example: axios.get.mockRejectedValueOnce(new Error('API Error'));
  //   
  //   // Add assertions for error handling
  //   // Example: await expect(${componentName}.fetchData()).rejects.toThrow('API Error');
  // });
});
`;
}

// Generate context test template
function generateContextTest(importPath, componentName, testCaseId, testDescription) {
  return `import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ${componentName}, use${componentName.replace(/Context$/, '')} } from '${importPath}';

// Create a test component that uses the context
const TestComponent = () => {
  const contextValue = use${componentName.replace(/Context$/, '')}();
  return (
    <div>
      <div data-testid="context-value">{JSON.stringify(contextValue)}</div>
      <button 
        data-testid="context-action" 
        onClick={() => contextValue.someAction?.()}
      >
        Action
      </button>
    </div>
  );
};

describe('${componentName}', () => {
  it('${testCaseId}: ${testDescription}', () => {
    render(
      <${componentName}>
        <TestComponent />
      </${componentName}>
    );
    
    // Add assertions for default context values
    // Example: expect(screen.getByTestId('context-value')).toHaveTextContent(/"propertyName":"defaultValue"/);
  });
  
  // Add more tests with different test case IDs as needed
  // it('TC{another-id}: context actions work correctly', () => {
  //   render(
  //     <${componentName}>
  //       <TestComponent />
  //     </${componentName}>
  //   );
  //   
  //   // Trigger context action
  //   act(() => {
  //     screen.getByTestId('context-action').click();
  //   });
  //   
  //   // Add assertions for context state change
  // });
});
`;
}

// Generate utility test template
function generateUtilTest(importPath, componentName, testCaseId, testDescription) {
  return `import { describe, it, expect } from 'vitest';
import * as ${componentName} from '${importPath}';

describe('${componentName}', () => {
  it('${testCaseId}: ${testDescription}', () => {
    // Example: const result = ${componentName}.calculate(input);
    // expect(result).toBe(expectedOutput);
  });
  
  // Add more tests with different test case IDs as needed
  // it('TC{another-id}: handles edge cases', () => {
  //   // Test with null/undefined inputs
  //   // Test with empty arrays/objects
  //   // Test with extreme values
  // });
});
`;
}

// Function to create the test file
function createTestFile(filePath, content) {
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.error(`Error: Test file already exists at ${filePath}`);
    process.exit(1);
  }
  
  // Write file
  fs.writeFileSync(filePath, content);
  console.log(`Test file created successfully at ${filePath}`);
}

// Run the script
main(); 