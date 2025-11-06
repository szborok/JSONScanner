// main.js
const Executor = require("./src/Executor");
const DataManager = require("./src/DataManager");
const Logger = require("./utils/Logger");
const UserManager = require("./utils/UserManager");
const config = require("./config");

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    mode: config.app.autorun ? "auto" : "manual",
    projectPath: null,
    forceReprocess: false,
    clearErrors: false,
    cleanup: false,
    cleanupStats: false,
    cleanupInteractive: false,
    testReadOnly: false,
    exportResults: null,
    listResults: false,
    preserveResults: false,
    workingFolder: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--mode":
        options.mode = args[i + 1];
        i++; // Skip next argument
        break;
      case "--manual":
        options.mode = "manual";
        break;
      case "--auto":
        options.mode = "auto";
        break;
      case "--cleanup":
        options.cleanup = true;
        break;
      case "--cleanup-stats":
        options.cleanupStats = true;
        break;
      case "--cleanup-interactive":
        options.cleanupInteractive = true;
        break;
      case "--project":
        options.projectPath = args[i + 1];
        i++; // Skip next argument
        break;
      case "--force":
        options.forceReprocess = true;
        break;
      case "--clear-errors":
        options.clearErrors = true;
        break;
      case "--test-readonly":
        options.testReadOnly = true;
        break;
      case "--export-results":
        options.exportResults = args[i + 1];
        i++; // Skip next argument
        break;
      case "--list-results":
        options.listResults = true;
        break;
      case "--preserve-results":
        options.preserveResults = true;
        break;
      case "--working-folder":
        options.workingFolder = args[i + 1];
        i++; // Skip next argument
        break;
      case "--help":
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
JSON Scanner Application

Usage: node main.js [options]

Options:
  --mode <auto|manual> Override config mode setting
  --manual             Set mode to manual (shortcut for --mode manual)
  --auto               Set mode to auto (shortcut for --mode auto)
  --cleanup            Delete all generated files (BRK_fixed.json and BRK_result.json)
  --cleanup-stats      Show statistics about generated files without deleting
  --cleanup-interactive Cleanup with confirmation prompt
  --project <path>     Scan specific project path (manual mode only)
  --force              Force reprocess even if result files exist
  --clear-errors       Clear fatal error markers before processing
  --test-readonly      Test read-only functionality with temp file operations
  --export-results <dir> Export current temp results to specified directory
  --list-results       List all result files in current temp session
  --preserve-results   Preserve results when cleaning up temp files
  --working-folder <path> Override temp directory with user-defined working folder
  --help               Show this help message

Test Mode Information:
  Test mode is currently ${
    config.app.testMode ? "ENABLED" : "DISABLED"
  } (configured in config.js)
  
  AUTO mode paths:
    - Test mode: ${config.paths.test.testDataPathAuto}
    - Production mode: ${config.paths.production.productionDataPath}
  
  MANUAL mode paths:
    - Test mode: Uses ${config.paths.test.testDataPathManual}
    - Production mode: Prompts user for path input

Read-Only Safety:
  All processing now uses temporary file copies
  Original files are NEVER modified
  Results are saved to temp folder by default
  Use --export-results to copy results to permanent location
  Use --preserve-results to archive results before temp cleanup

Examples:
  node main.js --manual --project "path/to/project"
  node main.js --auto --force
  node main.js --cleanup (removes all generated files)
  node main.js --cleanup-stats (shows what would be deleted)
  node main.js --cleanup-interactive (asks for confirmation)
  node main.js --clear-errors
  node main.js --test-readonly (test read-only temp file operations)
  node main.js --list-results (show current temp results)
  node main.js --export-results "/path/to/save" (export temp results)
  node main.js --manual --preserve-results (keep results when done)
  node main.js --working-folder "D:/CNC_Processing" (custom temp location)
  `);
}

// Test read-only functionality
async function testReadOnlyFunctionality() {
  const PersistentTempManager = require("./utils/PersistentTempManager");
  const fs = require("fs");
  const path = require("path");

  try {
    Logger.logInfo("🧪 Starting read-only functionality test...");

    const tempManager = new PersistentTempManager();
    const testDataPath = config.getScanPath();

    if (!testDataPath) {
      Logger.logError("No test data path available for read-only test");
      return;
    }

    if (!fs.existsSync(testDataPath)) {
      Logger.logError(`Test data path does not exist: ${testDataPath}`);
      return;
    }

    Logger.logInfo(`📂 Testing with path: ${testDataPath}`);

    // Find some test files
    const testFiles = [];
    const findFiles = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items.slice(0, 3)) {
        // Limit to first 3 items
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (
          stats.isFile() &&
          (item.endsWith(".json") || item.endsWith(".txt"))
        ) {
          testFiles.push(fullPath);
        } else if (stats.isDirectory() && testFiles.length < 2) {
          try {
            findFiles(fullPath);
          } catch (err) {
            // Skip directories we can't read
          }
        }

        if (testFiles.length >= 2) break;
      }
    };

    findFiles(testDataPath);

    if (testFiles.length === 0) {
      Logger.logWarn("No test files found in test data path");
      return;
    }

    Logger.logInfo(`📄 Found ${testFiles.length} test file(s) to copy`);

    // Test copying files to temp
    for (const testFile of testFiles) {
      Logger.logInfo(`📋 Testing copy: ${path.basename(testFile)}`);
      const tempPath = await tempManager.copyToTemp(testFile);
      Logger.logInfo(`✅ Copied to: ${tempPath}`);
    }

    // Get session info
    const sessionInfo = tempManager.getSessionInfo();
    Logger.logInfo(`📊 Session info:`);
    Logger.logInfo(`   - Session ID: ${sessionInfo.sessionId}`);
    Logger.logInfo(`   - Temp path: ${sessionInfo.sessionPath}`);
    Logger.logInfo(`   - Tracked files: ${sessionInfo.trackedFiles}`);

    // Test change detection
    Logger.logInfo("🔍 Testing change detection...");
    const changes = await tempManager.detectChanges();
    Logger.logInfo(`📝 Change detection result: ${changes.summary}`);

    // Cleanup
    Logger.logInfo("🧹 Cleaning up test session...");
    tempManager.cleanup();

    Logger.logInfo("✅ Read-only functionality test completed successfully!");
  } catch (error) {
    Logger.logError(`❌ Read-only test failed: ${error.message}`);
    Logger.logError(`Stack trace: ${error.stack}`);
  }
}

// List temp results
async function listTempResults() {
  const TempFileManager = require("./utils/TempFileManager");
  const fs = require("fs");
  const path = require("path");

  try {
    // Find existing sessions
    const tempBasePath = path.join(require("os").tmpdir(), "jsonscanner");

    if (!fs.existsSync(tempBasePath)) {
      Logger.logInfo("No temp sessions found");
      return;
    }

    const sessions = fs
      .readdirSync(tempBasePath)
      .filter(
        (item) =>
          item.startsWith("session_") &&
          fs.statSync(path.join(tempBasePath, item)).isDirectory()
      );

    if (sessions.length === 0) {
      Logger.logInfo("No active temp sessions found");
      return;
    }

    Logger.logInfo(`📋 Found ${sessions.length} temp session(s):`);

    for (const session of sessions) {
      const sessionPath = path.join(tempBasePath, session);
      const resultsDir = path.join(sessionPath, "results");

      Logger.logInfo(`\n📁 Session: ${session}`);

      if (fs.existsSync(resultsDir)) {
        const resultFiles = fs.readdirSync(resultsDir);
        if (resultFiles.length > 0) {
          Logger.logInfo(`   📄 Results (${resultFiles.length} files):`);
          for (const file of resultFiles) {
            const filePath = path.join(resultsDir, file);
            const stats = fs.statSync(filePath);
            Logger.logInfo(
              `     - ${file} (${
                stats.size
              } bytes, ${stats.mtime.toLocaleString()})`
            );
          }
        } else {
          Logger.logInfo(`   📄 No result files`);
        }
      } else {
        Logger.logInfo(`   📄 No results directory`);
      }
    }
  } catch (error) {
    Logger.logError(`❌ Failed to list temp results: ${error.message}`);
  }
}

// Export temp results
async function exportTempResults(destinationDir) {
  const TempFileManager = require("./utils/TempFileManager");
  const fs = require("fs");
  const path = require("path");

  try {
    // Find existing sessions
    const tempBasePath = path.join(require("os").tmpdir(), "jsonscanner");

    if (!fs.existsSync(tempBasePath)) {
      Logger.logError("No temp sessions found");
      return;
    }

    const sessions = fs
      .readdirSync(tempBasePath)
      .filter(
        (item) =>
          item.startsWith("session_") &&
          fs.statSync(path.join(tempBasePath, item)).isDirectory()
      );

    if (sessions.length === 0) {
      Logger.logError("No active temp sessions found");
      return;
    }

    // Use the most recent session
    const latestSession = sessions.sort().pop();
    const sessionPath = path.join(tempBasePath, latestSession);
    const resultsDir = path.join(sessionPath, "results");

    if (!fs.existsSync(resultsDir)) {
      Logger.logError(`No results found in latest session: ${latestSession}`);
      return;
    }

    const resultFiles = fs.readdirSync(resultsDir);
    if (resultFiles.length === 0) {
      Logger.logError("No result files to export");
      return;
    }

    // Ensure destination exists
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    // Copy results
    let copiedCount = 0;
    for (const file of resultFiles) {
      const sourcePath = path.join(resultsDir, file);
      const destPath = path.join(destinationDir, file);
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
    }

    Logger.logInfo(
      `✅ Exported ${copiedCount} result file(s) from session ${latestSession}`
    );
    Logger.logInfo(`📁 Results saved to: ${destinationDir}`);
  } catch (error) {
    Logger.logError(`❌ Failed to export temp results: ${error.message}`);
  }
}

// Start the JSON scanner application
async function main() {
  let dataManager = null;

  try {
    const options = parseArguments();

    // Apply command line overrides FIRST, before any operations
    if (options.mode === "manual") {
      config.app.autorun = false;
    } else if (options.mode === "auto") {
      config.app.autorun = true;
    }

    // Apply working folder override if provided
    if (options.workingFolder) {
      config.app.userDefinedWorkingFolder = options.workingFolder;
      console.log(`📁 Using user-defined working folder: ${options.workingFolder}`);
    }

    // Handle cleanup modes
    if (options.cleanup || options.cleanupStats || options.cleanupInteractive) {
      const CleanupService = require("./utils/CleanupService");
      const cleanupService = new CleanupService();

      if (options.cleanupStats) {
        Logger.logInfo("📊 Running cleanup statistics...");
        await cleanupService.getCleanupStats();
      } else if (options.cleanupInteractive) {
        Logger.logInfo("🤝 Running interactive cleanup...");
        await cleanupService.interactiveCleanup();
      } else if (options.cleanup) {
        Logger.logInfo("🧹 Starting cleanup mode...");
        await cleanupService.cleanupGeneratedFiles();
        Logger.logInfo("✅ Cleanup completed successfully");
      }

      process.exit(0);
    }

    // Handle read-only test mode
    if (options.testReadOnly) {
      Logger.logInfo("🧪 Testing read-only functionality...");
      await testReadOnlyFunctionality();
      process.exit(0);
    }

    // Handle result management
    if (options.listResults) {
      Logger.logInfo("📋 Listing temp results...");
      await listTempResults();
      process.exit(0);
    }

    if (options.exportResults) {
      Logger.logInfo(`📤 Exporting temp results to: ${options.exportResults}`);
      await exportTempResults(options.exportResults);
      process.exit(0);
    }

    Logger.logInfo("🚀 Starting JSON Scanner Application...");
    Logger.logInfo(`📝 Log file: ${Logger.getLogFilePath()}`);
    Logger.logInfo(
      `⚙️  Configuration: ${options.mode.toUpperCase()} mode, ${
        config.app.logLevel
      } level`
    );
    Logger.logInfo(
      `📁 Data source: ${config.app.testMode ? "Test data" : "Production data"}`
    );

    // Initialize data storage
    Logger.logInfo("📊 Initializing data storage...");
    dataManager = new DataManager();
    await dataManager.initialize();

    Logger.logInfo(
      `🎯 Active scan path: ${config.getScanPath() || "Will prompt user"}`
    );

    if (options.forceReprocess) {
      config.app.forceReprocess = true;
      Logger.logInfo(
        "🔄 Force reprocess enabled - will reprocess even if result files exist"
      );
    }

    // Initialize user manager for permission checking
    const userManager = new UserManager();

    // Create executor with options
    const executor = new Executor(dataManager);

    await executor.start(options);

    Logger.logInfo("✅ Application started successfully");
  } catch (error) {
    Logger.logError(`❌ Application startup failed: ${error.message}`);
    Logger.logError(`Stack trace: ${error.stack}`);
    process.exit(1);
  } finally {
    // Cleanup data manager on exit
    if (dataManager) {
      try {
        await dataManager.disconnect();
        Logger.logInfo("📊 Data storage disconnected");
      } catch (error) {
        Logger.logError("Error disconnecting data storage:", error);
      }
    }
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  Logger.logInfo("🛑 Received shutdown signal (SIGINT)");
  Logger.logInfo("👋 Application shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  Logger.logInfo("🛑 Received shutdown signal (SIGTERM)");
  Logger.logInfo("👋 Application shutting down gracefully...");
  process.exit(0);
});

main().catch((error) => {
  Logger.logError(`💥 Unhandled error in main: ${error.message}`);
  Logger.logError(`Stack trace: ${error.stack}`);
  process.exit(1);
});
