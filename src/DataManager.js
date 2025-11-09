/**
 * Data Manager for JSONScanner
 * Provides JSONScanner specific data operations using local JSON files
 */

const config = require("../config");
const { logInfo, logError, logWarn } = require("../utils/Logger");
const fs = require("fs");
const path = require("path");

class DataManager {
  constructor() {
    this.dataDir = config.app.testMode
      ? path.join(process.cwd(), "data", "test_processed_data")
      : path.join(process.cwd(), "data", "processed_data");
  }

  async initialize() {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      logInfo(`📊 Data storage initialized: local JSON files`);
      return true;
    } catch (error) {
      logError("Failed to initialize data storage:", error);
      throw error;
    }
  }

  // Save scan results with metadata
  async saveScanResult(project, analysisResults) {
    try {
      const scanResult = {
        projectPath: project.getProjectPath(),
        projectName: project.getFullName(),
        analysisResults: analysisResults,
        timestamp: new Date().toISOString(),
        success: true,
        rulesApplied: analysisResults.rules?.length || 0,
        issuesFound: analysisResults.issues?.length || 0,
      };

      // Save to traditional result file
      await this.saveTraditionalResultFile(project, analysisResults);

      logInfo(`💾 Scan result saved: ${project.getFullName()}`);
      return scanResult;
    } catch (error) {
      logError(
        `Failed to save scan result for ${project.getFullName()}:`,
        error
      );
      throw error;
    }
  }

  // Backward compatibility: save traditional result file
  async saveTraditionalResultFile(project, analysisResults) {
    try {
      const resultPath = project.getResultFilePath();

      if (!resultPath) {
        return null;
      }

      // Ensure directory exists
      const dir = path.dirname(resultPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the result file
      fs.writeFileSync(
        resultPath,
        JSON.stringify(analysisResults, null, 2),
        "utf8"
      );

      return resultPath;
    } catch (error) {
      logError(`Failed to save traditional result file:`, error);
      return null;
    }
  }

  // Simplified methods for local file storage
  async getScanResults(filters = {}) {
    // Not implemented for local storage
    return [];
  }

  async getLatestScanResult(projectName) {
    return null;
  }

  async saveProject(project) {
    return null;
  }

  async getProjects() {
    return [];
  }

  async saveRuleExecution(projectName, ruleName, result) {
    // Not implemented for local storage
  }

  async getAnalytics() {
    return {
      totalScans: 0,
      successfulScans: 0,
      totalProjects: 0,
      totalIssues: 0,
      storageType: "local",
      lastScan: null,
      recentScans: [],
    };
  }

  async cleanup() {
    // Not implemented for local storage
  }

  async createBackup() {
    return { status: "not_implemented" };
  }

  async healthCheck() {
    return {
      status: "ok",
      storageType: "local",
    };
  }

  async disconnect() {
    // Nothing to disconnect for local storage
  }
}

module.exports = DataManager;
