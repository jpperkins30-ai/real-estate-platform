# 🧪 Test Process Quick Guide

## ⚠️ BEFORE ADDING TESTS - READ THIS

This project uses a structured testing approach with test case tracking. Before creating tests, you must follow these steps:

## 🔍 Test Creation Process Checklist

1. **Check the test plan first**
   - Look in `test-plan.json` for existing test cases
   - If your test already has a test case ID, use it
   - If not, work with the tech lead to add a new test case

2. **Use the test generator tool**
   ```
   node create-test.js --component=components/path/to/component --testid=TC101
   ```
   - This creates properly structured test files
   - It ensures proper test case ID usage
   - It validates against the test plan

3. **Follow the test naming convention**
   - Test files must be in: `src/_tests_/`
   - File format must be: `TC{ID}_{category}_{component_name}.test.tsx`
   - Test descriptions must include test case IDs: `it('TC101: should do something')`

## 📂 Test Directory Structure

This project uses a **flattened directory structure** with test case IDs and underscore separators:

```
src/_tests_/
├── TC101_components_multiframe_controls_LayoutSelector.test.tsx   # TC101 for LayoutSelector component
├── TC601_hooks_useDraggable.test.tsx                            # TC601 for useDraggable hook
├── TC2301_services_filterService.test.ts                         # TC2301 for filterService
├── TC2601_integration_PanelIntegration.test.tsx                  # TC2601 for integration test
└── README.md                                                     # Testing guidelines
```

### Important Rules:
- Test case ID (TC{ID}) must be the prefix of the filename
- Use underscores `_` to separate parts of the filename
- All test files should be directly in the `src/_tests_/` directory (not in subdirectories)
- Use the correct category: `components_`, `hooks_`, `services_`, `context_`, `integration_`, etc.
- Always add appropriate component path details: `components_multiframe_layouts_AdvancedLayout`

### Examples:

| Component/Module Path | Correct Test File Path |
|-----------------------|------------------------|
| `src/components/multiframe/PanelHeader.tsx` | `src/_tests_/TC801_components_multiframe_PanelHeader.test.tsx` |
| `src/hooks/useAdvancedLayout.ts` | `src/_tests_/TC401_hooks_useAdvancedLayout.test.tsx` |
| `src/services/layoutService.ts` | `src/_tests_/TC2301_services_layoutService.test.ts` |
| `src/context/FilterContext.tsx` | `src/_tests_/TC1701_context_FilterContext.test.tsx` |

## ⚙️ Running Tests

1. **Run all tests**
   ```
   npm test
   ```

2. **Run a specific test file**
   ```
   npm test -- src/_tests_/TC801_components_PanelHeader.test.tsx
   ```

3. **Run tests in watch mode**
   ```
   npm run test:watch
   ```

4. **Generate coverage report**
   ```
   npm run test:coverage
   ```

## 🚨 Common Errors and Solutions

| Error | Solution |
|-------|----------|
| "Test case ID not found in test plan" | Check `test-plan.json` or ask tech lead to add the test case |
| "File name does not follow convention" | Rename file to `TC{ID}_{category}_{name}.test.tsx` format or use the generator |
| "No test case IDs found" | Add test case IDs to test descriptions: `it('TC101: should...')` |
| "Invalid test case IDs" | Use only test case IDs that exist in the test plan |

## 📚 Detailed Documentation

For more information, see:
- `TESTING.md` - Complete testing guidelines
- `test-plan.json` - All test cases with requirements mapping

## 🛠️ Helpful Tools

- `pre-commit-check.ps1` - Validates tests before commit
- `validate-all-tests.js` - Verifies all tests meet standards
- `create-test.js` - Generates properly structured tests
- `fix-test-imports.ps1` - Fixes import paths in test files
- `fix-test-quotes.ps1` - Fixes quote issues in test files

## ❓ Questions or Issues?

Contact the tech lead for assistance with test case allocation or process questions.

---

**Note:** Tests that don't follow these standards will fail CI checks and block PR merging. 