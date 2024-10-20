import * as vscode from "vscode";
import { createTask } from "./commands/createTask";
import { deleteTask } from "./commands/deleteTask";
import { updateTask } from "./commands/updateTask";
import { showAllTasks } from "./commands/showAllTasks";
import { loadTasks, getTasks, saveTasks } from "./utils/taskStorage";
import { updateDecorations } from "./utils/decorations";
import { TaskTreeDataProvider } from "./taskTreeView";
import { Task } from "./types";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codepin" is now active!');

  loadTasks(context);

  const taskTreeDataProvider = new TaskTreeDataProvider(context);
  vscode.window.registerTreeDataProvider("codepinTasks", taskTreeDataProvider);

  let createTaskDisposable = vscode.commands.registerCommand(
    "codepin.createTask",
    async () => {
      await createTask(context);
      taskTreeDataProvider.refresh();
    }
  );
  let deleteTaskDisposable = vscode.commands.registerCommand(
    "codepin.deleteTask",
    async () => {
      await deleteTask(context);
      taskTreeDataProvider.refresh();
    }
  );
  let updateTaskDisposable = vscode.commands.registerCommand(
    "codepin.updateTask",
    async () => {
      await updateTask(context);
      taskTreeDataProvider.refresh();
    }
  );
  let showAllTasksDisposable = vscode.commands.registerCommand(
    "codepin.showAllTasks",
    () => showAllTasks(context)
  );

  let jumpToTaskDisposable = vscode.commands.registerCommand(
    "codepin.jumpToTask",
    (taskId: string) => {
      const tasks = getTasks(context);
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
  );

  let editTaskNotesDisposable = vscode.commands.registerCommand(
    "codepin.editTaskNotes",
    async (task: Task) => {
      const newNotes = await vscode.window.showInputBox({
        prompt: "Edit task notes",
        value: task.notes,
        placeHolder: "Enter notes for this task",
      });

      if (newNotes !== undefined) {
        task.notes = newNotes;
        const tasks = getTasks(context);
        const index = tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          tasks[index] = task;
          saveTasks(context, tasks);
          taskTreeDataProvider.refresh();
        }
      }
    }
  );

  context.subscriptions.push(
    createTaskDisposable,
    deleteTaskDisposable,
    updateTaskDisposable,
    showAllTasksDisposable,
    jumpToTaskDisposable,
    editTaskNotesDisposable
  );

  // Register CodeLens provider
  let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    { scheme: "file", language: "*" },
    new CodePinCodeLensProvider(context)
  );

  let showTaskDetailsDisposable = vscode.commands.registerCommand(
    "codepin.showTaskDetails",
    (task: Task) => {
      const message = [
        `Assignee: ${task.assignee || "Unassigned"}`,
        `Priority: ${task.priority}`,
        `Task: ${task.description}`,
        task.notes ? `Notes: ${task.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      vscode.window.showInformationMessage(message, { detail: message });
    }
  );

  context.subscriptions.push(showTaskDetailsDisposable);

  // Update decorations when the active editor changes
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      updateDecorations(editor, getTasks(context));
    }
  });
}

/* class CodePinCodeLensProvider implements vscode.CodeLensProvider {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

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
    const tasks = getTasks(this.context);
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
} */

class CodePinCodeLensProvider implements vscode.CodeLensProvider {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

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
    const tasks = getTasks(this.context);
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
        title: this.getTaskTitle(task),
        command: "codepin.showTaskDetails",
        arguments: [task],
      });
      codeLenses.push(taskCodeLens);
    }

    return codeLenses;
  }
  private getTaskTitle(task: Task): string {
    const assignee = task.assignee || "Unassigned";
    const priorityIcon = this.getPriorityIcon(task.priority);
    const truncatedDescription =
      task.description.length > 30
        ? task.description.substring(0, 27) + "..."
        : task.description;
    return `${priorityIcon} ${truncatedDescription} (${assignee})`;
  }

  private getPriorityIcon(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "low":
        return "🟢"; // Green circle for low priority
      case "medium":
        return "🟠"; // Orange circle for medium priority
      case "high":
        return "🔴"; // Red circle for high priority
    }
  }
}

export function deactivate() {}
