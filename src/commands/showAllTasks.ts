import * as vscode from "vscode";
import * as path from "path";
import { getTasks } from "../utils/taskStorage";
import { Task } from "../types";

export function showAllTasks(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "codepinTasks",
    "CodePin Tasks",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  const tasks = getTasks(context);
  panel.webview.html = getTasksWebviewContent(tasks);

  const messageListener = panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "jumpToTask":
        jumpToTask(message.taskId, tasks);
        return;
    }
  }, undefined);

  panel.onDidDispose(() => {
    messageListener.dispose();
  }, null);
}

function getTasksWebviewContent(tasks: Task[]): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodePin Tasks</title>
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #4CAF50; color: white; }
      </style>
    </head>
    <body>
      <h1>Tasks</h1>
      <table>
        <tr>
          <th>Description</th>
          <th>Priority</th>
          <th>Assignee</th>
          <th>File</th>
          <th>Action</th>
        </tr>
        ${tasks
          .map(
            (task) => `
          <tr>
            <td>${task.description}</td>
            <td>${task.priority}</td>
            <td>${task.assignee || ""}</td>
            <td>${path.basename(task.filePath)}:${task.lineNumber + 1}</td>
            <td><button onclick="jumpToTask('${
              task.id
            }')">Jump to Task</button></td>
          </tr>
        `
          )
          .join("")}
      </table>
      <script>
        const vscode = acquireVsCodeApi();
        function jumpToTask(taskId) {
          vscode.postMessage({
            command: 'jumpToTask',
            taskId: taskId
          });
        }
      </script>
    </body>
    </html>
  `;
}

function jumpToTask(taskId: string, tasks: Task[]) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    vscode.workspace.openTextDocument(task.filePath).then((doc) => {
      vscode.window.showTextDocument(doc).then((editor) => {
        const position = new vscode.Position(task.lineNumber, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
      });
    });
  }
}
