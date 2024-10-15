import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface Task {
  id: string;
  description: string;
  assignee?: string;
  priority: "low" | "medium" | "high";
  filePath: string;
  lineNumber: number;
}

let tasks: Task[] = [];
let tasksFilePath: string;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codepin" is now active!');

  tasksFilePath = path.join(context.extensionPath, "tasks.json");

  loadTasks(); // Load existing tasks

  let createTaskDisposable = vscode.commands.registerCommand(
    "codepin.createTask",
    createTask
  );
  let deleteTaskDisposable = vscode.commands.registerCommand(
    "codepin.deleteTask",
    deleteTask
  );
  let updateTaskDisposable = vscode.commands.registerCommand(
    "codepin.updateTask",
    updateTask
  );
  let showAllTasksDisposable = vscode.commands.registerCommand(
    "codepin.showAllTasks",
    showAllTasks
  );

  context.subscriptions.push(
    createTaskDisposable,
    deleteTaskDisposable,
    updateTaskDisposable,
    showAllTasksDisposable
  );

  let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    { scheme: "file", language: "typescript" },
    new CodePinCodeLensProvider()
  );

  context.subscriptions.push(codeLensProviderDisposable);

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      updateDecorations(editor);
    }
  });
}

async function createTask() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const position = editor.selection.active;
    const description = await vscode.window.showInputBox({
      prompt: "Enter task description",
    });
    const priority = await vscode.window.showQuickPick(
      ["low", "medium", "high"],
      { placeHolder: "Select priority" }
    );
    const assignee = await vscode.window.showInputBox({
      prompt: "Assign to (optional)",
    });

    if (description && priority) {
      const task: Task = {
        id: Date.now().toString(),
        description,
        priority: priority as "low" | "medium" | "high",
        assignee,
        filePath: editor.document.uri.fsPath,
        lineNumber: position.line,
      };

      tasks.push(task);
      saveTasks();
      updateDecorations(editor);
      vscode.window.showInformationMessage(`Task created: ${description}`);
    }
  }
}

async function deleteTask() {
  const taskToDelete = await vscode.window.showQuickPick(
    tasks.map((task) => `${task.description} (${task.priority})`),
    { placeHolder: "Select task to delete" }
  );

  if (taskToDelete) {
    const index = tasks.findIndex(
      (task) => `${task.description} (${task.priority})` === taskToDelete
    );
    if (index !== -1) {
      tasks.splice(index, 1);
      saveTasks();
      vscode.window.showInformationMessage(`Task deleted: ${taskToDelete}`);
      updateDecorations(vscode.window.activeTextEditor);
    }
  }
}

async function updateTask() {
  const taskToUpdate = await vscode.window.showQuickPick(
    tasks.map((task) => `${task.description} (${task.priority})`),
    { placeHolder: "Select task to update" }
  );

  if (taskToUpdate) {
    const index = tasks.findIndex(
      (task) => `${task.description} (${task.priority})` === taskToUpdate
    );
    if (index !== -1) {
      const task = tasks[index];
      const newDescription = await vscode.window.showInputBox({
        prompt: "Enter new description",
        value: task.description,
      });
      const newPriority = await vscode.window.showQuickPick(
        ["low", "medium", "high"],
        { placeHolder: "Select new priority" }
      );
      const newAssignee = await vscode.window.showInputBox({
        prompt: "Enter new assignee",
        value: task.assignee,
      });

      if (newDescription && newPriority) {
        task.description = newDescription;
        task.priority = newPriority as "low" | "medium" | "high";
        task.assignee = newAssignee;
        saveTasks();
        vscode.window.showInformationMessage(`Task updated: ${newDescription}`);
        updateDecorations(vscode.window.activeTextEditor);
      }
    }
  }
}

function showAllTasks() {
  const panel = vscode.window.createWebviewPanel(
    "codepinTasks",
    "CodePin Tasks",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = getTasksWebviewContent(tasks);

  const messageListener = panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "jumpToTask":
        jumpToTask(message.taskId);
        return;
    }
  }, undefined);

  // Clean up the listener when the panel is disposed
  panel.onDidDispose(() => {
    messageListener.dispose();
  }, null);
}

function jumpToTask(taskId: string) {
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

function saveTasks() {
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to save tasks: ${error}`);
  }
}

function loadTasks() {
  try {
    if (fs.existsSync(tasksFilePath)) {
      const tasksData = fs.readFileSync(tasksFilePath, "utf-8");
      tasks = JSON.parse(tasksData);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load tasks: ${error}`);
  }
}

function updateDecorations(editor: vscode.TextEditor | undefined) {
  if (!editor) return;

  const fileUri = editor.document.uri;
  const fileTasks = tasks.filter((task) => task.filePath === fileUri.fsPath);

  const decorations = fileTasks.map((task) => ({
    range: new vscode.Range(task.lineNumber, 0, task.lineNumber, 0),
    renderOptions: {
      after: {
        contentText: `📌 ${task.description}`,
        color: getColorForPriority(task.priority),
      },
    },
  }));

  const decorationType = vscode.window.createTextEditorDecorationType({});
  editor.setDecorations(decorationType, decorations);
}

function getColorForPriority(priority: "low" | "medium" | "high"): string {
  switch (priority) {
    case "low":
      return "green";
    case "medium":
      return "orange";
    case "high":
      return "red";
  }
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

class CodePinCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];

    // Add a CodeLens at the top of the file to create a new task
    const topOfDocument = new vscode.Range(0, 0, 0, 0);
    const createTaskCodeLens = new vscode.CodeLens(topOfDocument, {
      title: "Create Task",
      command: "codepin.createTask",
    });
    codeLenses.push(createTaskCodeLens);

    // Add CodeLenses for existing tasks in this file
    const fileTasks = tasks.filter(
      (task) => task.filePath === document.uri.fsPath
    );
    for (const task of fileTasks) {
      const taskRange = new vscode.Range(
        task.lineNumber,
        0,
        task.lineNumber,
        0
      );
      const taskCodeLens = new vscode.CodeLens(taskRange, {
        title: `📌 ${task.description} (${task.priority})`,
        command: "codepin.updateTask",
      });
      codeLenses.push(taskCodeLens);
    }

    return codeLenses;
  }
}

export function deactivate() {}
