# Test Processed Data Directory

This directory serves as the temporary processing workspace when JSONScanner operates in **test mode**.

## Purpose

When `config.app.testMode = true`, all temporary file operations use this directory instead of the system temp directory. This provides:

- **Organized Structure**: All test processing happens in a predictable location
- **Easy Access**: Test results are easily accessible in the project directory
- **Development Convenience**: No need to hunt through system temp folders
- **Consistent Workflow**: Matches the structure used by other CNC management tools

## Structure

When JSONScanner runs in test mode, it creates an organized hierarchy:

```
test_processed_data/
└── BRK CNC Management Dashboard/
    └── JSONScanner/
        └── session_xxxxx/
            ├── input_files/      (copied original files)
            ├── collected_jsons/  (discovered JSON files)
            ├── fixed_jsons/      (processed JSON files)
            └── results/          (analysis results)
```

## Usage

- **Test Mode**: Automatically used when `testMode: true` in config
- **Production Mode**: System temp directory used instead
- **Manual Override**: Can be overridden with `--working-folder` CLI argument

## Cleanup

- Session directories are automatically created and cleaned up
- Old sessions (>24 hours) are automatically removed
- Manual cleanup available via cleanup commands

This ensures complete read-only processing where original files in `test_source_data` are never modified.
