# Read-Only Processing Guide

## 🔒 Complete Data Safety

JSONScanner now features **complete read-only processing** to ensure zero risk to your original CNC manufacturing data.

## How It Works

### Organized Temp Structure
All processing happens in a professionally organized temp folder hierarchy:

```
[OS Temp or Custom Path]/BRK CNC Management Dashboard/JSONScanner/
└── persistent/
    ├── input_files/        # Original JSON files copied here
    ├── collected_jsons/    # Processed JSON collections  
    ├── fixed_jsons/        # Corrected JSON files
    ├── results/            # Analysis reports
    └── [Project Folders]/  # Mirrored project directory structure
        └── [Machine Folders]/
            ├── *.json      # Project JSON files
            ├── *.tls       # Tool list files
            ├── *.h         # NC program files
            └── *_BRK_fixed.json    # Processed results
```

### Safety Guarantees

- ✅ **Original files NEVER modified**
- ✅ **All processing uses temp copies**
- ✅ **Results saved to organized temp structure**
- ✅ **Export functionality for permanent storage**
- ✅ **Session tracking prevents data loss**

## Using Custom Working Folders

### Command Line Usage

```bash
# Use custom temp location
node main.js --manual --working-folder "D:/CNC_Processing"

# Test with custom location
node main.js --test-readonly --working-folder "D:/Test_Location"

# Auto mode with custom temp
node main.js --auto --working-folder "E:/Manufacturing_Temp"
```

### Configuration

Set a default custom working folder in `config.js`:

```javascript
module.exports = {
  app: {
    userDefinedWorkingFolder: "D:/CNC_Processing", // Custom default location
    tempBaseName: "BRK CNC Management Dashboard"   // Organized folder name
  }
}
```

## Result Management

### Exporting Results

```bash
# Export current temp results to permanent location
node main.js --export-results "D:/Manufacturing_Reports/2025-11-06"

# List current temp results
node main.js --list-results

# Process with result preservation
node main.js --manual --preserve-results
```

### Session Management

Each processing session gets a unique ID and tracks:
- Files copied to temp
- Changes detected
- Processing results
- Session metadata

### Cleanup Options

```bash
# Show what would be cleaned up
node main.js --cleanup-stats

# Interactive cleanup with confirmation
node main.js --cleanup-interactive

# Force cleanup all generated files
node main.js --cleanup
```

## Testing Read-Only Functionality

### Basic Test

```bash
# Test read-only processing
node main.js --test-readonly
```

This will:
1. Copy test files to temp location
2. Show organized temp structure creation
3. Demonstrate session management
4. Test change detection
5. Clean up test session

### Custom Location Test

```bash
# Test with custom working folder
node main.js --test-readonly --working-folder "D:/Test_ReadOnly"
```

### Verify Results

After testing, check the created structure:
- Windows: `%TEMP%\BRK CNC Management Dashboard\JSONScanner\`
- Custom: `[Your Path]\BRK CNC Management Dashboard\JSONScanner\`

## Best Practices

### Development
- Always use `--test-readonly` to verify functionality
- Test with custom working folders before production
- Monitor log files for processing details

### Production
- Use custom working folders on fast storage
- Set up automated result exports
- Monitor temp folder usage
- Use `--cleanup-stats` to track storage usage

### Safety
- Original project files remain completely untouched
- All results are in organized temp structure
- Export results before temp cleanup
- Session IDs track all processing activities

## Troubleshooting

### Common Issues

**Permission Errors**
```bash
# Ensure write access to temp location
node main.js --test-readonly --working-folder "D:/Accessible_Path"
```

**Storage Space**
```bash
# Check temp folder usage
node main.js --cleanup-stats

# Clean up old sessions
node main.js --cleanup
```

**Path Issues**
```bash
# Use absolute paths
node main.js --working-folder "D:/Full/Absolute/Path"
```

## Migration from Legacy System

If you're upgrading from a system that modified original files:

1. **Test First**: Use `--test-readonly` extensively
2. **Custom Temp**: Set up dedicated temp storage
3. **Export Setup**: Configure result export locations
4. **Verify Safety**: Confirm original files untouched
5. **Gradual Rollout**: Start with test projects

## Advanced Configuration

### Multiple Temp Locations

Configure different temp locations for different scenarios:

```javascript
// In config.js
module.exports = {
  app: {
    userDefinedWorkingFolder: process.env.CNC_TEMP_PATH || "D:/CNC_Processing"
  }
}
```

### Environment Variables

```bash
# Set temp location via environment
set CNC_TEMP_PATH=E:/Manufacturing_Temp
node main.js --auto
```

This read-only processing system ensures complete data safety while maintaining full functionality and professional organization.