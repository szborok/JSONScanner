// path: src/Results.js
/**
 * Handles saving of rule check results to disk and database.
 * Updated to use DataManager for dual storage support.
 */

const fs = require("fs");
const path = require("path");
const { logInfo, logError } = require("../utils/Logger");

class Results {
  constructor(dataManager = null) {
    this.dataManager = dataManager;
  }

  /**
   * Saves project analysis results to storage (database + optional file).
   * @param {Project} project - The project instance
   * @param {Object} analysisResults - Analysis results from project.getAnalysisResults()
   * @returns {string|null} - Storage ID or file path, null if failed
   */
  async saveProjectResults(project, analysisResults) {
    try {
      // Save to modern storage (DataManager)
      if (this.dataManager) {
        const storageId = await this.dataManager.saveScanResult(
          project,
          analysisResults
        );
        await this.dataManager.saveProject(project);
        return storageId;
      }

      // Fallback: save to traditional file
      return this.saveTraditionalFile(project, analysisResults);
    } catch (error) {
      logError(`Error saving results for ${project.getFullName()}:`, error);
      return null;
    }
  }

  /**
   * Traditional file-based saving (backward compatibility)
   */
  saveTraditionalFile(project, analysisResults) {
    try {
      const resultPath = project.getResultFilePath();

      if (!resultPath) {
        logError(
          `Cannot generate result file path for project: ${project.getFullName()}`
        );
        return null;
      }

      // Ensure directory exists
      const dir = path.dirname(resultPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write clean, structured results to file
      fs.writeFileSync(
        resultPath,
        JSON.stringify(analysisResults, null, 2),
        "utf8"
      );

      logInfo(`✅ Result file saved: ${path.basename(resultPath)}`);

      return resultPath;
    } catch (err) {
      logError(
        `❌ Failed to save result file for ${project.getFullName()}: ${
          err.message
        }`
      );
      return null;
    }
  }

  /**
   * Loads analysis results from disk.
   * @param {string} resultPath - Path to the result file
   * @returns {Object|null} - Parsed results or null if failed
   */
  loadProjectResults(resultPath) {
    try {
      if (!fs.existsSync(resultPath)) {
        return null;
      }

      const content = fs.readFileSync(resultPath, "utf8");
      return JSON.parse(content);
    } catch (err) {
      logError(`Failed to load result file ${resultPath}: ${err.message}`);
      return null;
    }
  }

  /**
   * Gets all result files in a directory.
   * @param {string} scanPath - Directory to scan for result files
   * @returns {Array} - Array of result file paths
   */
  getAllResultFiles(scanPath) {
    const resultFiles = [];

    const scanDirectory = (dirPath) => {
      try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);

          if (item.isDirectory()) {
            scanDirectory(fullPath);
          } else if (item.isFile() && item.name.endsWith("_BRK_result.json")) {
            resultFiles.push(fullPath);
          }
        }
      } catch (err) {
        logError(`Cannot scan directory ${dirPath}: ${err.message}`);
      }
    };

    scanDirectory(scanPath);
    return resultFiles;
  }

  /**
   * Gets all generated files (both fixed and result files) in a directory.
   * @param {string} scanPath - Directory to scan for generated files
   * @returns {Array} - Array of generated file paths
   */
  getAllGeneratedFiles(scanPath) {
    const generatedFiles = [];

    const scanDirectory = (dirPath) => {
      try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);

          if (item.isDirectory()) {
            scanDirectory(fullPath);
          } else if (
            item.isFile() &&
            (item.name.endsWith("_BRK_result.json") ||
              item.name.endsWith("_BRK_fixed.json"))
          ) {
            generatedFiles.push(fullPath);
          }
        }
      } catch (err) {
        logError(`Cannot scan directory ${dirPath}: ${err.message}`);
      }
    };

    scanDirectory(scanPath);
    return generatedFiles;
  }
}

module.exports = Results;
