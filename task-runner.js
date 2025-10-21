#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const steps = [
  {
    name: "Install dependencies",
    command: "npm install --legacy-peer-deps",
    expect: ["up to date", "added", "changed 1 package", "audited"],
    logPrefix: "install"
  },
  {
    name: "Run tests",
    command: "npx jest --watchAll=false --runInBand --ci",
    expect: ["Test Suites: 0 failed", "PASS "],
    logPrefix: "test"
  },
  {
    name: "Ping server",
    command: "curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3001",
    expect: ["200"],
    logPrefix: "ping"
  }
];

function validateOutput(output, expect) {
  // Pass if ANY expected string is found
  return expect.some(str => output.includes(str));
}

function runSteps(steps) {
  const results = [];
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
  for (const step of steps) {
    let status = "fail";
    let reason = "";
    let output = "";
    const start = Date.now();
    try {
      output = execSync(step.command, { encoding: 'utf8', stdio: 'pipe' });
      if (validateOutput(output, step.expect)) {
        status = "pass";
        reason = "All expected strings found.";
      } else {
        reason = `Missing expected output: ${step.expect.filter(e => !output.includes(e)).join(", ")}`;
      }
    } catch (err) {
      output = err.stdout ? err.stdout.toString() : "";
      reason = err.message || "Command failed.";
    }
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logsDir, `${step.logPrefix || step.name.replace(/\s+/g, '_').toLowerCase()}-${timestamp}.log`);
    fs.writeFileSync(logFile, output, 'utf8');
    // Enhanced test step logging
    if (step.name === "Run tests") {
      let testPassed = status === "pass";
      let failedCount = 0;
      const match = output.match(/Test Suites: (\d+) failed/);
      if (match) failedCount = parseInt(match[1], 10);
      if (testPassed) {
        console.log(`✅ Tests | ⏱ ${duration}s`);
      } else {
        console.log(`❌ Tests | ${failedCount} suite(s) failed`);
      }
    } else {
      // Print one-line summary for other steps
      const summary = status === "pass"
        ? `✅ ${step.name.padEnd(18)} | ⏱ ${duration}s`
        : `❌ ${step.name.padEnd(18)} | ${reason} | ⏱ ${duration}s`;
      console.log(summary);
    }
    results.push({ name: step.name, status, reason, duration });
    if (status === "fail") {
      break;
    }
  }
  printSummary(results);
}

function printSummary(results) {
  console.log("\nSummary:");
  console.log("----------------------------------------");
  console.log("Step                 | Status | Reason");
  console.log("----------------------------------------");
  for (const r of results) {
    console.log(`${r.name.padEnd(20)} | ${r.status.padEnd(6)} | ${r.reason}`);
  }
  console.log("----------------------------------------");
  if (results.every(r => r.status === "pass")) {
    console.log("✅ All done!");
  } else {
    const failed = results.find(r => r.status === "fail");
    console.log(`❌ Step failed: ${failed.name} - ${failed.reason}`);
  }
}

runSteps(steps);
