import * as assert from "assert";
import * as vscode from "vscode";
import * as myExtension from "../extension";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Create Task", async () => {
    // Simulate creating a task
    await vscode.commands.executeCommand("codepin.createTask");
    // You would need to add assertions here to verify the task was created
  });

  test("Show All Tasks", async () => {
    await vscode.commands.executeCommand("codepin.showAllTasks");
    // Add assertions to verify the tasks panel opens
  });

  // Add more tests for other commands
});
