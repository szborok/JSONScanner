# JSONScanner

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional Node.js-based quality control system for CNC manufacturing projects. JSONScanner automatically scans project directories, applies business rules, and generates comprehensive analysis reports for manufacturing compliance.

## 🎯 Features

### ✨ **Complete Read-Only Processing**
- **Zero Risk**: Original files are NEVER modified
- **Organized Temp Structure**: Professional `BRK CNC Management Dashboard/JSONScanner/` hierarchy
- **User-Defined Working Folders**: Custom temp locations via `--working-folder` CLI option
- **Session Management**: Tracks changes and maintains organized file structure

### 🔧 **CNC Manufacturing Workflow**
- **Automatic Project Discovery**: Scans JSON files in project directories
- **Business Rule Engine**: Auto-discovers and executes rules from `/rules/` directory
- **Comprehensive Analysis**: Generates detailed compliance reports
- **Multi-Mode Operation**: Auto (continuous scanning) and Manual (one-time processing)

### 📊 **Data Management**
- **Dual Storage Support**: Local JSON files and MongoDB integration
- **Results Tracking**: Organized analysis output with result management
- **Change Detection**: Monitors file modifications and updates processing accordingly
- **Persistent Temp Management**: Maintains organized temp structure across sessions

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd JSONScanner

# Install dependencies
npm install

# Configure settings
cp config.js.example config.js
# Edit config.js with your specific paths and settings
```

### Basic Usage

```bash
# Manual processing (processes once and exits)
node main.js --manual

# Auto mode (continuous scanning every 60 seconds)
node main.js --auto

# Process specific project
node main.js --manual --project "path/to/project"

# Use custom working folder
node main.js --manual --working-folder "D:/CNC_Processing"

# Test read-only functionality
node main.js --test-readonly

# Get help
node main.js --help
```

## 📋 Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--manual` | Run in manual mode (process once and exit) | `node main.js --manual` |
| `--auto` | Run in auto mode (continuous scanning) | `node main.js --auto` |
| `--project <path>` | Process specific project path | `--project "C:/Projects/W5270NS01001A"` |
| `--working-folder <path>` | Use custom temp location | `--working-folder "D:/CNC_Processing"` |
| `--test-readonly` | Test read-only functionality | `node main.js --test-readonly` |
| `--force` | Force reprocess existing results | `--force` |
| `--cleanup` | Remove all generated files | `--cleanup` |
| `--cleanup-stats` | Show cleanup statistics | `--cleanup-stats` |
| `--export-results <dir>` | Export temp results to directory | `--export-results "D:/Results"` |
| `--list-results` | List current temp results | `--list-results` |

## 🏗️ Architecture

### Core Components

```
src/
├── Executor.js          # Main orchestrator for auto/manual modes
├── Scanner.js           # Discovers JSON files in project directories
├── Analyzer.js          # Parses project data into structured format
├── RuleEngine.js        # Auto-discovers and executes business rules
├── Project.js           # Core domain model with CompoundJobs and ToolInfo
├── DataManager.js       # Wraps StorageAdapter for JSON/MongoDB persistence
└── Results.js           # Manages analysis output and result tracking
```

### Utilities

```
utils/
├── PersistentTempManager.js  # Organized temp structure management
├── Logger.js                 # Structured logging with daily rotation
├── CleanupService.js         # Temp file cleanup and retention
└── UserManager.js            # User management and authentication
```

### Business Rules

```
rules/
├── AutoCorrectionContour.js  # Contour auto-correction validation
├── AutoCorrectionPlane.js    # Plane auto-correction validation
├── GunDrill60MinLimit.js     # Gun drill time limit enforcement
├── M110Contour.js           # M110 contour code validation
├── M110Helical.js           # M110 helical operation validation
├── ReconditionedTool.js     # Reconditioned tool usage rules
└── SingleToolInNC.js        # Single tool per NC file validation
```

## 📁 Data Flow

1. **Scanner** discovers JSON files → 
2. **Analyzer** parses into Project model → 
3. **RuleEngine** applies business rules → 
4. **Results** writes analysis output to organized temp structure

## ⚙️ Configuration

### Key Settings (`config.js`)

```javascript
// Application modes
app: {
  testMode: true,                           // Test vs production paths
  autorun: false,                          // Default to manual mode
  usePersistentTempFolder: true,           // Use organized temp structure
  userDefinedWorkingFolder: null,          // Custom temp location
  tempBaseName: "BRK CNC Management Dashboard"
}

// Storage configuration
storage: {
  type: "local",                           // "local" or "mongodb"
  mongodb: {
    connectionString: "mongodb://localhost:27017/jsonscanner"
  }
}
```

### Environment Modes

- **Test Mode**: Uses `working_data/` for safe development
- **Production Mode**: Uses configured production paths
- **Read-Only**: All processing in temp folders, original files untouched

## 🔒 Read-Only Safety Features

### Organized Temp Structure
```
[OS Temp or User-Defined]/BRK CNC Management Dashboard/JSONScanner/
└── persistent/
    ├── input_files/        # Original JSON files copied here
    ├── collected_jsons/    # Processed JSON collections
    ├── fixed_jsons/        # Corrected JSON files
    ├── results/            # Analysis reports
    └── [Project Folders]/  # Mirrored project directory structure
```

### Safety Guarantees
- ✅ **Original files NEVER modified**
- ✅ **All processing uses temp copies**
- ✅ **Results saved to organized temp structure**
- ✅ **Export functionality for permanent storage**
- ✅ **Session tracking for change detection**

## 📊 Business Rules System

### Rule Development Pattern

```javascript
// Example rule structure
function exampleRule(project) {
  const violations = [];
  
  for (const [fileName, compoundJob] of project.compoundJobs) {
    // Business logic here
    if (violationCondition) {
      violations.push({
        type: "violation_type",
        severity: "error|warning|info",
        message: "Human readable description",
        context: { additionalData }
      });
    }
  }
  
  return { 
    passed: violations.length === 0, 
    violations 
  };
}

module.exports = exampleRule;
```

### Auto-Discovery
Rules are automatically discovered from the `/rules/` directory. Each rule file exports a single function that receives a project object and returns validation results.

## 🛠️ Development

### Project Structure
```
JSONScanner/
├── config.js                    # Main configuration
├── main.js                      # Entry point with CLI handling
├── package.json                 # Dependencies and scripts
├── src/                         # Core application logic
├── utils/                       # Shared utilities
├── rules/                       # Business rule modules
├── data/                        # Test data and storage
├── docs/                        # Detailed documentation
└── logs/                        # Application logs (git-ignored)
```

### Development Commands

```bash
# Development mode with enhanced logging
npm run dev:scanner

# Quick test without side effects
node quick_test.js

# Debug utilities
node debug.js

# Cleanup generated files
npm run cleanup
```

### Testing

```bash
# Test read-only functionality
node main.js --test-readonly

# Test with custom working folder
node main.js --test-readonly --working-folder "D:/Test"

# Manual processing of test data
node main.js --manual --project "data/test_data/testPathHumming_auto"
```

## 🔧 Advanced Usage

### Custom Working Folders

```bash
# Use custom temp location
node main.js --manual --working-folder "D:/CNC_Processing"

# Export results from temp to permanent location
node main.js --export-results "D:/Manufacturing_Reports"

# List current temp results
node main.js --list-results
```

### Continuous Integration

```bash
# Cleanup before processing
node main.js --cleanup

# Process with force reprocessing
node main.js --manual --force

# Show cleanup statistics
node main.js --cleanup-stats
```

### Result Management

```bash
# Export current temp results
node main.js --export-results "/path/to/permanent/storage"

# List all result files in current session
node main.js --list-results

# Process with result preservation
node main.js --manual --preserve-results
```

## 📈 Monitoring and Logging

### Log Files
- Location: `logs/app-YYYY-MM-DD.log`
- Daily rotation with structured format
- Configurable log levels (info, warn, error)

### Session Tracking
- Unique session IDs for each processing run
- File change detection and tracking
- Organized temp file management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-rule`)
3. Add your business rule to `/rules/` directory
4. Test with `node main.js --test-readonly`
5. Commit changes (`git commit -am 'Add new manufacturing rule'`)
6. Push to branch (`git push origin feature/new-rule`)
7. Create a Pull Request

### Adding New Rules

1. Create a new file in `/rules/` directory
2. Export a single function that takes a `project` parameter
3. Return `{ passed: boolean, violations: array }`
4. Test with existing projects
5. Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for CNC manufacturing quality control
- Designed for zero-risk read-only processing
- Supports both local and enterprise MongoDB storage
- Comprehensive business rule validation system

---

**Note**: This system prioritizes data safety through complete read-only processing. All operations use organized temp folder structures, ensuring original manufacturing data remains untouched.