# DataSource Model Consolidation

## Overview

This document describes the consolidation of duplicate DataSource model files in the codebase.

## Problem

The codebase had two different model files for the DataSource entity:
- `server/src/models/DataSource.ts` - Using default export with git merge conflicts
- `server/src/models/datasource.model.ts` - Using named exports

This duplication caused:
1. Inconsistent import patterns
2. Potential for diverging schemas
3. Git conflicts in the codebase

## Solution

We consolidated the models into a single file and updated all imports throughout the codebase.

### Changes Made

1. **Consolidated Model File**
   - Updated `server/src/models/datasource.model.ts` to include all functionality from both files
   - Made it export both named exports and a default export for backward compatibility
   - Resolved all git merge conflicts in the process

2. **Updated Central Index Export**
   - Added DataSource exports to `server/src/models/index.ts`
   - Added both named and interface exports

3. **Updated Import Statements**
   - Updated all files importing from the old DataSource.ts to use the consolidated model:
     - `server/src/utils/scheduler-utils.ts`
     - `server/src/utils/collection-utils.ts`
     - `server/src/services/dataCollection/CollectorManager.ts`
     - `server/src/routes/data-source.ts`
     - `server/src/routes/collection.ts`
     - `server/src/routes/collectorTypes.routes.ts`
     - `server/src/index.ts`

4. **Deleted Duplicate File**
   - Removed `server/src/models/DataSource.ts` after consolidation

## Benefits

- Consistent import patterns across the codebase
- Elimination of git conflicts
- Single source of truth for the DataSource schema
- Better maintainability going forward

## Future Work

Consider adopting a consistent naming pattern for all model files:
- Either all models use `*.model.ts` naming (recommended)
- Or all models use PascalCase without `.model.ts` suffix 