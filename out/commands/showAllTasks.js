"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAllTasks = showAllTasks;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const taskStorage_1 = require("../utils/taskStorage");
function showAllTasks(context) {
    const panel = vscode.window.createWebviewPanel("codepinTasks", "CodePin Tasks", vscode.ViewColumn.One, { enableScripts: true });
    const tasks = (0, taskStorage_1.getTasks)(context);
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
function getTasksWebviewContent(tasks) {
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
        .map((task) => `
          <tr>
            <td>${task.description}</td>
            <td>${task.priority}</td>
            <td>${task.assignee || ""}</td>
            <td>${path.basename(task.filePath)}:${task.lineNumber + 1}</td>
            <td><button onclick="jumpToTask('${task.id}')">Jump to Task</button></td>
          </tr>
        `)
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
function jumpToTask(taskId, tasks) {
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
//# sourceMappingURL=showAllTasks.js.map