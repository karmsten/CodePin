import * as vscode from "vscode";
import { saveTasks, getTasks } from "../utils/taskStorage";
import { updateDecorations } from "../utils/decorations";

export async function deleteTask(context: vscode.ExtensionContext) {
  const tasks = getTasks(context);
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
      saveTasks(context, tasks);
      vscode.window.showInformationMessage(`Task deleted: ${taskToDelete}`);
      if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor, tasks);
      }
    }
  }
}
