import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Task } from "../types";

let tasks: Task[] = [];

export function getTasks(context: vscode.ExtensionContext): Task[] {
  if (tasks.length === 0) {
    loadTasks(context);
  }
  return tasks;
}

export function saveTasks(context: vscode.ExtensionContext, newTasks: Task[]) {
  tasks = newTasks;
  const tasksFilePath = getTasksFilePath(context);
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to save tasks: ${error}`);
  }
}

export function loadTasks(context: vscode.ExtensionContext) {
  const tasksFilePath = getTasksFilePath(context);
  try {
    if (fs.existsSync(tasksFilePath)) {
      const tasksData = fs.readFileSync(tasksFilePath, "utf-8");
      tasks = JSON.parse(tasksData);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load tasks: ${error}`);
  }
}

function getTasksFilePath(context: vscode.ExtensionContext): string {
  return path.join(context.extensionPath, "tasks.json");
}
