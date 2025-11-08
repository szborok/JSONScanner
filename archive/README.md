# Archive - Legacy Executable Files

This directory contains the original standalone executable files that have been **consolidated into `main.js` with flags** for better organization and consistency with other CNC management tools.

## Files Moved to Archive

| Original File | New Flag | Description |
|---------------|----------|-------------|
| `debug.js` | `--debug` | Debug utilities and log viewing |
| `demo-readonly.js` | `--demo-readonly` | Read-only functionality demo |
| `demo-temp-only.js` | `--demo-temp` | Complete temp-only processing demo |
| `quick_test.js` | `--test-quick` | Quick storage tests |
| `test_storage.js` | `--test-storage` | Detailed storage functionality tests |

## Migration Complete

✅ **Before**: Multiple executable files in root directory  
✅ **After**: Single `main.js` entry point with organized flags  

## Usage Examples

```bash
# Old way (archived)
node debug.js
node demo-readonly.js
node quick_test.js

# New way (current)
node main.js --debug
node main.js --demo-readonly
node main.js --test-quick
```

## Benefits of Consolidation

- 🧹 **Cleaner root directory** - Only essential files visible
- 🎯 **Single entry point** - Consistent with ClampingPlateManager pattern
- 🚀 **Better organization** - All functionality discoverable via `--help`
- 📖 **Improved documentation** - Built-in help with examples
- 🔧 **Easier maintenance** - One file to manage CLI interface

## Note

These archived files are kept for reference but should not be executed directly. Use the new flag system in `main.js` instead.