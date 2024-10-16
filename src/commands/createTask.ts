import * as vscode from "vscode";
import { Task } from "../types";
import { saveTasks, getTasks } from "../utils/taskStorage";
import { updateDecorations } from "../utils/decorations";

export async function createTask(context: vscode.ExtensionContext) {
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

      const tasks = getTasks(context);
      tasks.push(task);
      saveTasks(context, tasks);
      updateDecorations(editor, tasks);

      vscode.window.showInformationMessage(`Task created: ${description}`);
    }
  }
}
