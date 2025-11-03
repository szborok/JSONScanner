# JSONScanner - Manufacturing Quality Control System

A sophisticated automated system for scanning, analyzing, and validating manufacturing project data with configurable rule-based quality control checks.

## 🚀 Overview

The JSONScanner is designed to automatically process manufacturing project JSON files, apply configurable quality control rules, and generate detailed analysis results. It supports both automated continuous monitoring and manual processing modes.

### Key Features

- **🔄 Automated Scanning**: Continuous monitoring of project directories with configurable intervals
- **📏 Rule-Based Validation**: Extensible rule engine with 7+ pre-built manufacturing quality rules
- **🎯 Intelligent Filtering**: Smart project discovery with recursive directory scanning
- **📊 Comprehensive Reporting**: Clean, structured result files for frontend integration
- **⚡ Real-time Processing**: Live monitoring with countdown timers and detailed logging
- **🔧 Flexible Configuration**: Easy configuration for different environments and use cases
- **🔐 Read-Only Operation**: Complete read-only processing using organized temporary file structure
- **🔍 Change Detection**: Intelligent change detection using file dates and hash comparison
- **🧹 Organized Temp Structure**: Professional "BRK CNC Management Dashboard" temp organization
- **🗂️ Cross-Platform Compatibility**: Works on Windows, macOS, and Linux using OS temp directories
- **🧹 Automatic Cleanup**: Automatic cleanup of organized temp sessions on completion

## 📁 Project Structure

```
JSONScanner/
├── config/                 # Configuration files
│   └── Settings.js         # Application settings and paths
├── src/                    # Core application source
│   ├── Analyzer.js         # JSON data analysis and validation
│   ├── Executor.js         # Main orchestration and business logic
│   ├── Project.js          # Project data model and operations
│   ├── Results.js          # Result file persistence layer
│   ├── RuleEngine.js       # Rule discovery and execution engine
│   └── Scanner.js          # Recursive project discovery
├── rules/                  # Quality control rule definitions
│   ├── AutoCorrectionContour.js
│   ├── AutoCorrectionPlane.js
│   ├── GunDrill60MinLimit.js
│   ├── M110Contour.js
│   ├── M110Helical.js
│   ├── ReconditionedTool.js
│   └── SingleToolInNC.js
├── utils/                  # Utility modules
│   ├── FileUtils.js        # File system operations
│   ├── Logger.js           # Logging infrastructure
│   ├── ModeManager.js      # Mode management utilities
│   ├── PathUtils.js        # Path processing utilities
│   └── TempFileManager.js  # Organized temp file management
├── test_data/               # Test data directories
│   ├── testPathHumming_auto/   # Test data for auto mode
│   └── testPathOne_manual/     # Test data for manual mode
└── logs/                   # Application logs
```

## � Quick Start

**New to JSON Scanner?** Check out our [Quick Start Guide](docs/QUICKSTART.md) to get running in 5 minutes!

## ✨ Features

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd JSONScanner
```

2. Install dependencies:

```bash
npm install
```

3. Configure the application:
   - Edit `config/Settings.js` for your environment
   - Set up data paths and scanning intervals
   - Configure rule preferences

## 🎮 Usage

### Auto Mode (Continuous Monitoring)

Run the scanner in automatic mode for continuous project monitoring:

```bash
# Standard auto mode
node main.js

# Auto mode with force reprocessing
node main.js --force

# Auto mode with operator filtering
node main.js --operator "john.doe"
```

### Manual Mode

Process specific projects manually:

```bash
# Manual mode with specific path
node main.js --manual --path "/path/to/projects"

# Manual mode with operator filter
node main.js --manual --operator "jane.smith"
```

### Command Line Options

| Option             | Description                          | Example                               |
| ------------------ | ------------------------------------ | ------------------------------------- |
| `--force`          | Reprocess even if result files exist | `node main.js --force`                |
| `--manual`         | Enable manual processing mode        | `node main.js --manual`               |
| `--auto`           | Enable automatic processing mode     | `node main.js --auto`                 |
| `--project <path>` | Specify custom project path          | `node main.js --project "/data/proj"` |
| `--test-readonly`  | Test read-only functionality         | `node main.js --test-readonly`        |
| `--cleanup`        | Clean up generated result files      | `node main.js --cleanup`              |
| `--cleanup-stats`  | Show cleanup statistics              | `node main.js --cleanup-stats`        |
| `--clear-errors`   | Clear fatal error markers            | `node main.js --clear-errors`         |

## 📊 Output & Results

### Result Files

The system generates clean, structured JSON result files for each processed project:

```json
{
  "project": "W5270NS01001A",
  "operator": "szborok",
  "machine": "DMC 105 V Linear",
  "position": "A",
  "summary": {
    "overallStatus": "passed"
  },
  "rules": [
    {
      "name": "GunDrill60MinLimit",
      "status": "passed",
      "violationCount": 0
    }
  ],
  "processedAt": "2025-10-28T13:12:42.226Z",
  "status": "completed"
}
```

### Log Files

Detailed operation logs are saved in `logs/app-YYYY-MM-DD.log` with:

- Scan cycle timings
- Project processing status
- Rule execution results
- Error details and warnings

## 🔐 Organized Temp Structure

JSONScanner uses a professional organized temporary file structure to ensure complete data safety and cross-platform compatibility:

### Organized Temp Hierarchy

```
[OS Temp Directory]/BRK CNC Management Dashboard/
└── JSONScanner/
    └── session_[timestamp]_[id]/
        ├── input_files/     # Original files copied here
        ├── collected_jsons/ # Found JSON files organized
        ├── fixed_jsons/     # Sanitized/fixed JSON files
        └── results/         # Analysis results & reports
```

### How It Works

1. **Auto OS Detection**: Uses `os.tmpdir()` to automatically detect the correct temp directory:

   - **macOS**: `/var/folders/.../T/` or `/tmp/`
   - **Windows**: `C:\Users\[Username]\AppData\Local\Temp\`
   - **Linux**: `/tmp/`

2. **Professional Organization**: Creates "BRK CNC Management Dashboard" main folder with app-specific subfolders

3. **Session Management**: Each scan gets a unique session directory with organized subdirectories

4. **File Type Organization**: Different file types are organized into appropriate subdirectories

5. **Safe Processing**: All analysis occurs on organized temp copies, never touching originals

6. **Automatic Cleanup**: Organized temp sessions are cleaned up automatically

### Key Benefits

- **🛡️ Data Safety**: Original files are never at risk of modification or corruption
- **🗂️ Professional Organization**: Clean, structured temp hierarchy suitable for enterprise environments
- **🌍 Cross-Platform**: Works seamlessly on Windows, macOS, and Linux
- **⚡ Performance**: Organized structure improves file management efficiency
- **🔍 Transparency**: Easy to inspect temp structure and verify originals remain untouched
- **🧹 Clean Operation**: Professional cleanup with no temporary files left behind
- **📊 Change Tracking**: Detailed logging of temp operations and file management

### Testing Organized Temp Functionality

```bash
# Test the organized temp functionality
npm run demo-temp-only

# Interactive demo showing organized structure
node demo-temp-only.js
```

## ⚙️ Configuration

### Main Configuration (`config/Settings.js`)

```javascript
module.exports = {
  app: {
    testMode: true, // Use test data paths
    autorun: true, // Enable auto scanning
    scanIntervalMs: 60000, // Scan every 60 seconds
    logLevel: "info", // Logging verbosity
    forceReprocess: false, // Skip already processed files
  },

  paths: {
    testDataPath: "./test_data/testPathHumming_auto",
    productionDataPath: "/production/test_data/path",
  },
};
```

### Rule Configuration

Rules are automatically discovered and can be configured individually. Each rule exports:

```javascript
module.exports = {
  name: "RuleName",
  description: "Rule description",
  shouldRun: (project) => true, // Condition logic
  execute: (project, compoundJobs, tools) => {
    // Rule implementation
    return { passed: true, violations: [] };
  },
};
```

## 🔧 Development

### Adding New Rules

1. Create a new rule file in `rules/` directory
2. Follow the rule interface pattern
3. Include condition logic and execution function
4. Rules are automatically discovered and loaded

### Project Architecture

- **Clean Architecture**: Separated concerns between data, business logic, and presentation
- **Pure Data Layer**: Results.js handles only file persistence
- **Business Logic**: Executor.js orchestrates processing workflow
- **Future-Ready**: Designed for frontend integration and API development

## 📈 Monitoring & Maintenance

### Log Monitoring

Monitor the application through log files:

- Scan cycle performance
- Project processing statistics
- Rule execution results
- Error patterns and trends

### Performance Tuning

- Adjust `scanIntervalMs` based on workload
- Configure `forceReprocess` for testing vs production
- Monitor log file sizes and implement rotation

## 🐛 Troubleshooting

### Common Issues

1. **No projects found**: Check data paths in configuration
2. **Permission errors**: Ensure write access to output directories
3. **Rule failures**: Check rule-specific logs for details
4. **Memory usage**: Monitor for large project sets

### Debug Mode

Enable detailed logging by setting `logLevel: "debug"` in configuration.

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get running in 5 minutes
- **[FAQ](docs/FAQ.md)** - Frequently asked questions and troubleshooting
- **[API Documentation](docs/API.md)** - Data structures and future REST API design
- **[Architecture](docs/ARCHITECTURE.md)** - System design and component relationships
- **[Development Guide](docs/DEVELOPMENT.md)** - Code standards, testing, and workflow
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment and maintenance

## �🚀 Future Enhancements

- Web-based dashboard interface
- REST API for remote access
- Real-time notifications
- Advanced analytics and reporting
- User management system
- Custom rule builder interface

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the [Development Guidelines](docs/DEVELOPMENT.md)
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📞 Support

For technical support or questions about the JSON Scanner system:

- Review the [documentation](docs/) first
- Check the [troubleshooting guide](docs/DEPLOYMENT.md#troubleshooting)
- Create an issue for bug reports or feature requests
