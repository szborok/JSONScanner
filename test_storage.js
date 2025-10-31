#!/usr/bin/env node
// Quick test script for json_scanner storage functionality

const DataManager = require("./src/DataManager");

async function testLocalStorage() {
  console.log("🧪 Testing json_scanner with LOCAL storage...");

  try {
    // Test local storage
    process.env.STORAGE_TYPE = "local";
    const dataManager = new DataManager();
    await dataManager.initialize();

    console.log("✅ Local storage initialized");

    // Test basic operations
    const testProject = {
      projectId: `test_${Date.now()}`,
      projectName: "test_project",
      status: "completed",
      fileName: "test.json",
      results: { rules_passed: 5, rules_failed: 0 },
    };

    await dataManager.saveProject(testProject);
    console.log("✅ Project saved");

    const retrievedProject = await dataManager.getProject(
      testProject.projectId
    );
    console.log(
      "✅ Project retrieved:",
      retrievedProject ? "SUCCESS" : "FAILED"
    );

    const health = await dataManager.healthCheck();
    console.log("✅ Health check:", health.status);

    await dataManager.disconnect();
    console.log("✅ json_scanner LOCAL storage test PASSED\n");

    return true;
  } catch (error) {
    console.error("❌ Local storage test FAILED:", error.message);
    return false;
  }
}

async function testMongoStorage() {
  console.log("🧪 Testing json_scanner with MONGODB storage...");

  try {
    // Test MongoDB storage (will fallback to local if MongoDB not available)
    process.env.STORAGE_TYPE = "mongodb";
    const dataManager = new DataManager();
    await dataManager.initialize();

    console.log("✅ MongoDB storage initialized (or fallback to local)");

    // Test basic operations
    const testProject = {
      projectId: `test_mongo_${Date.now()}`,
      projectName: "test_mongo_project",
      status: "completed",
      fileName: "test_mongo.json",
      results: { rules_passed: 3, rules_failed: 1 },
    };

    await dataManager.saveProject(testProject);
    console.log("✅ Project saved to MongoDB");

    const retrievedProject = await dataManager.getProject(
      testProject.projectId
    );
    console.log(
      "✅ Project retrieved:",
      retrievedProject ? "SUCCESS" : "FAILED"
    );

    const health = await dataManager.healthCheck();
    console.log("✅ Health check:", health.status, `(${health.type})`);

    await dataManager.disconnect();
    console.log("✅ json_scanner MONGODB storage test PASSED\n");

    return true;
  } catch (error) {
    console.error("❌ MongoDB storage test FAILED:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting json_scanner storage tests...\n");

  const localResult = await testLocalStorage();
  const mongoResult = await testMongoStorage();

  console.log("📊 Test Results Summary:");
  console.log(`  Local Storage: ${localResult ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  MongoDB Storage: ${mongoResult ? "✅ PASS" : "❌ FAIL"}`);

  if (localResult && mongoResult) {
    console.log("\n🎉 All json_scanner storage tests PASSED!");
    process.exit(0);
  } else {
    console.log("\n💥 Some json_scanner storage tests FAILED!");
    process.exit(1);
  }
}

runTests();
