# JSONScanner - CNC Quality Control System

## Overview

JSONScanner is a Node.js-based quality control system for CNC manufacturing projects. It automatically scans project directories, applies business rules, and generates comprehensive analysis reports for manufacturing compliance.

## Core Purpose

- **Automated Quality Control**: Scan CNC project JSON files for rule violations
- **Business Rule Engine**: Auto-discover and execute rules from `/rules/` directory
- **Manufacturing Compliance**: Ensure NC programs meet production standards
- **Analysis Reports**: Generate detailed violation reports with severity levels

---

## Architecture

### Component Flow

```
Scanner → Analyzer → RuleEngine → Results
   ↓         ↓           ↓           ↓
Find    Parse to    Apply      Generate
JSON    Project    Business    Analysis
files   model      Rules       Reports
```

### Key Components

- **Executor** (`src/Executor.js`) - Main orchestrator, handles auto/manual modes
- **Scanner** (`src/Scanner.js`) - Discovers JSON files in project directories
- **Analyzer** (`src/Analyzer.js`) - Parses project data into structured format
- **RuleEngine** (`src/RuleEngine.js`) - Auto-discovers and executes rules
- **Project** (`src/Project.js`) - Core domain model with CompoundJobs and ToolInfo
- **DataManager** (`src/DataManager.js`) - Manages local JSON file persistence
- **Results** (`src/Results.js`) - Generates analysis output and result tracking

### Data Model

```javascript
Project {
  name: "W5270NS01001",           // Work order number
  compoundJobs: Map<fileName, operations[]>,
  tools: Map<toolName, toolInfo>,
  operator: "John Doe",
  machine: "ECUT-01",
  metadata: { timestamps, position, etc. }
}

Operation {
  programName: "NC0001",
  toolName: "D8400123",
  code: ["G01", "M110"],          // G/M codes
  depth: -25.5,
  feedRate: 1200,
  // ... more fields
}
```

---

## Centralized Test Data Setup

**Important**: JSONScanner uses centralized test data from `CNC_TestData` repository.

### Directory Structure

```
Projects/
├── CNC_TestData/                    ← Centralized test data (auto-cloned)
│   ├── source_data/
│   │   └── json_files/              ← Test projects (READ-ONLY)
│   │       ├── W5270NS01001/
│   │       ├── W5270NS01003/
│   │       ├── W5270NS01060/
│   │       └── W5270NS01061/
│   └── working_data/
│       └── BRK CNC Management Dashboard/
│           └── jsonscanner/         ← Processing output
│               └── session_demo/
│                   ├── input_files/
│                   ├── processed_files/
│                   └── results/
└── JSONScanner/                     ← This project
    ├── config.js                    ← Points to ../CNC_TestData
    ├── main.js
    └── scripts/
        └── setup-test-data.js       ← Auto-clones CNC_TestData
```

### Automatic Setup

**First time setup** (happens automatically on `npm install`):

```bash
npm install  # Runs postinstall → setup-test-data.js → clones CNC_TestData
```

**Manual setup** (if needed):

```bash
npm run setup-test-data  # Clones or updates CNC_TestData
```

**Running tests**:

```bash
npm test  # Runs pretest → setup-test-data.js → updates test data → runs tests
```

### Configuration

`config.js` points to centralized test data:

```javascript
testDataPathAuto: path.join(__dirname, "..", "CNC_TestData", "source_data", "json_files"),
testProcessedDataPath: path.join(__dirname, "..", "CNC_TestData", "working_data", "jsonscanner"),
```

**Test Mode vs Production Mode**:

- `app.testMode: true` → Uses `../CNC_TestData/` paths
- `app.testMode: false` → Uses production paths (configured in config.js)

---

## Business Rules System

### Rule Auto-Discovery

Rules are automatically loaded from `/rules/` directory. Each rule file exports a single function.

### Rule Pattern

```javascript
// /rules/ExampleRule.js
function exampleRule(project) {
  const violations = [];

  // Access project data via project.compoundJobs Map
  for (const [fileName, compoundJob] of project.compoundJobs) {
    for (const operation of compoundJob) {
      // Business logic here
      if (violationCondition) {
        violations.push({
          type: "violation_type",
          severity: "error|warning|info",
          message: "Human readable description",
          context: { fileName, operation, additionalData },
        });
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

module.exports = exampleRule;
```

### Built-in Rules

- **AutoCorrectionContour** - Validates auto-correction usage in contour operations
- **AutoCorrectionPlane** - Checks plane auto-correction compliance
- **GunDrill60MinLimit** - Enforces 60-minute limit on gun drill operations
- **M110Contour** - Validates M110 code usage in contour programs
- **M110Helical** - Checks M110 in helical operations
- **ReconditionedTool** - Flags reconditioned tool usage requiring approval
- **SingleToolInNC** - Ensures only one tool per NC program

### Rule Severity Levels

- **error**: Critical violations, production should stop
- **warning**: Important issues, review required
- **info**: Informational, no action required

---

## Operating Modes

### Auto Mode (Continuous Scanning)

```bash
npm run auto
# or
node main.js --auto
```

- Scans every 60 seconds
- Processes all projects in test data directory
- Logs activity to `logs/`

### Manual Mode (Single Project)

```bash
npm run manual
# or
node main.js --manual --project "W5270NS01001"
```

- Process specific project
- Generate immediate analysis report
- Useful for debugging

### Custom Working Folder

```bash
node main.js --working-folder "/path/to/custom/temp"
```

- Override default temp location
- Useful for production environments

---

## CLI Commands

### Development

```bash
npm run dev:scanner      # Auto mode with enhanced logging
npm run manual           # Manual mode for single project
```

### Utilities

```bash
node debug.js            # View/clear logs, debugging helpers
npm run cleanup          # Remove all generated BRK_fixed/BRK_result files
npm run test-readonly    # Test temp operations without side effects
```

### Export/List Results

```bash
node main.js --export-results /path/to/export    # Export current temp results
node main.js --list-results                      # List all result files
```

### Help

```bash
node main.js --help      # Show all CLI options
```

---

## Read-Only Processing

JSONScanner follows **strict read-only processing** pattern:

1. **Source Data**: Never modified, always in `../CNC_TestData/source_data/`
2. **Copy to Temp**: Files copied to `working_data/.../input_files/`
3. **Processing**: Analysis happens in temp structure
4. **Results**: Written to `working_data/.../results/`

**Temp Structure**:

```
working_data/BRK CNC Management Dashboard/jsonscanner/
└── session_demo/          # Or session_xxxxx for timestamped runs
    ├── input_files/       # Copied from source_data
    ├── processed_files/   # Parsed project data
    └── results/           # Analysis reports
        └── W5270NS01001_analysis.json
```

---

## Configuration Reference

### Test/Production Paths

```javascript
app: {
  testMode: true,                  // Toggle test/production
  usePersistentTempFolder: true,   // Use organized temp structure
  tempBaseName: "BRK CNC Management Dashboard",
  userDefinedWorkingFolder: null   // Override temp location
}
```

### Scan Settings

```javascript
scanner: {
  scanInterval: 60000,             // 60 seconds
  fileExtensions: ['.json'],
  ignoreFolders: ['node_modules', '.git']
}
```

### Rule Configuration

```javascript
rules: {
  GunDrill60MinLimit: {
    enabled: true,
    maxDuration: 60 * 60 * 1000    // 60 minutes
  },
  // ... more rule conditions
}
```

---

## Logging

### Log Levels

- **info**: Normal operations, progress updates
- **warn**: Potential issues, but processing continues
- **error**: Critical errors, processing may stop
- **debug**: Detailed debugging information (dev mode only)

### Log Files

```
logs/
├── app-2025-01-15.log      # Daily rotation
├── app-2025-01-14.log
└── error-2025-01-15.log    # Error-only log
```

### Debugging Utilities

```bash
node debug.js                # View recent logs
node debug.js --clear        # Clear all logs
node debug.js --list         # List all log files
```

---

## Development Workflow

### Adding a New Rule

1. **Create rule file**: `/rules/MyNewRule.js`

   ```javascript
   function myNewRule(project) {
     const violations = [];
     // Rule logic here
     return { passed: violations.length === 0, violations };
   }
   module.exports = myNewRule;
   ```

2. **Add rule configuration** (if needed): `config.js`

   ```javascript
   rules: {
     MyNewRule: {
       enabled: true,
       customParam: "value"
     }
   }
   ```

3. **Test the rule**:
   ```bash
   npm run manual  # Test on sample project
   ```

### Modifying Project Data Structure

1. **Update Project model**: `src/Project.js`
2. **Update Analyzer parsing**: `src/Analyzer.js`
3. **Update affected rules**: `/rules/*`
4. **Run tests**: `npm test`

### Testing Changes

```bash
# Quick test on single project
npm run manual

# Full test suite
npm test

# Test with specific project
node main.js --manual --project "W5270NS01001"
```

---

## Common Tasks

### Process a Single Project

```bash
node main.js --manual --project "W5270NS01001"
```

### View Analysis Results

```bash
cat ../CNC_TestData/working_data/BRK\ CNC\ Management\ Dashboard/jsonscanner/session_demo/results/W5270NS01001_analysis.json
```

### Check Recent Logs

```bash
node debug.js
# or
tail -f logs/app-$(date +%Y-%m-%d).log
```

### Clean All Generated Files

```bash
npm run cleanup
```

### Update Test Data

```bash
npm run setup-test-data  # Pulls latest from CNC_TestData repo
```

---

## Troubleshooting

### Issue: "CNC_TestData not found"

**Solution**: Run `npm run setup-test-data`

### Issue: "No projects found to scan"

**Solution**:

1. Verify `CNC_TestData` is sibling folder
2. Check `config.testDataPathAuto` path
3. Run `npm run setup-test-data`

### Issue: "Rule not executing"

**Solution**:

1. Check `config.rules` section for rule conditions
2. Verify rule file exports function correctly
3. Check RuleEngine auto-discovery logs

### Issue: "Path resolution errors"

**Solution**:

1. Ensure all repos are sibling folders
2. Verify `config.app.testMode` setting
3. Check relative paths in config.js

### Issue: "Original files modified"

**Solution**:

1. Check TempFileManager logic
2. Verify read-only processing pattern
3. Report bug - should NEVER modify source data

---

## Dependencies

### Core

- **Node.js**: 18+ required
- **File System**: Native `fs` module for file operations

### Development

- **Scripts**: Custom setup and utility scripts
- **Testing**: Built-in test runner (no external framework)

### No External Dependencies

JSONScanner intentionally has minimal dependencies for maximum portability and reliability.

---

## File Organization

```
JSONScanner/
├── main.js                 # Entry point, CLI arg parsing
├── config.js               # All settings (test/prod paths, rules)
├── package.json
├── README.md
├── PROJECT_OVERVIEW.md     # This file
├── TEST_DATA_SETUP.md      # Centralized test data docs
├── src/
│   ├── Executor.js         # Main orchestrator
│   ├── Scanner.js          # File discovery
│   ├── Analyzer.js         # JSON parsing
│   ├── RuleEngine.js       # Rule execution
│   ├── Project.js          # Domain model
│   ├── DataManager.js      # File persistence
│   └── Results.js          # Report generation
├── rules/
│   ├── AutoCorrectionContour.js
│   ├── GunDrill60MinLimit.js
│   ├── M110Contour.js
│   └── ... (all rules)
├── utils/
│   ├── Logger.js           # Structured logging
│   ├── PersistentTempManager.js  # Temp file handling
│   ├── ProgressTracker.js  # Progress reporting
│   └── CleanupService.js   # Cleanup operations
├── scripts/
│   └── setup-test-data.js  # Auto-clone CNC_TestData
├── logs/                   # Daily log files
└── docs/
    ├── QUICKSTART.md
    ├── ARCHITECTURE.md
    ├── API.md
    └── ... (detailed docs)
```

---

## Integration with Dashboard

JSONScanner is designed to integrate with CNCManagementDashboard:

1. **Analysis Results**: Written to `working_data/.../results/`
2. **Dashboard Reads**: Frontend reads from centralized working_data
3. **Real-time Updates**: Dashboard polls for new analysis files
4. **Unified View**: All backend results displayed in single interface

---

## Best Practices

### Rule Development

- ✅ Keep rules focused (single responsibility)
- ✅ Use descriptive violation messages
- ✅ Include context in violations (fileName, operation, etc.)
- ✅ Test rules with multiple projects
- ❌ Don't modify project data in rules (read-only)

### Performance

- ✅ Use Map for efficient lookups
- ✅ Process projects in parallel when possible
- ✅ Log progress for long operations
- ❌ Don't load entire project directory into memory

### Logging

- ✅ Log at appropriate levels (info/warn/error)
- ✅ Include relevant context (projectId, operation)
- ✅ Use structured logging with objects
- ❌ Don't log sensitive data (if any)

---

## Future Enhancements

### Planned Features

- [ ] Web UI for rule management
- [ ] Real-time dashboard integration
- [ ] Custom rule templates
- [ ] Advanced filtering and search
- [ ] Export to PDF reports

### Technical Improvements

- [ ] TypeScript migration
- [ ] Comprehensive test coverage
- [ ] Performance benchmarking
- [ ] Rule dependency management

---

## Related Documentation

- **Setup Guide**: `TEST_DATA_SETUP.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Reference**: `docs/API.md`
- **Quick Start**: `docs/QUICKSTART.md`
- **Development Guide**: `docs/DEVELOPMENT.md`
- **AI Assistant Context**: `.github/copilot-instructions.md`
- **Ecosystem Context**: `../CNC_TestData/AI_AGENT_CONTEXT.md`

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review `docs/FAQ.md`
3. Check recent logs with `node debug.js`
4. Refer to ecosystem context in `../CNC_TestData/AI_AGENT_CONTEXT.md`

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0  
**Maintainer**: szborok
