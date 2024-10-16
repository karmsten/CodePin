import * as vscode from "vscode";
import { saveTasks, getTasks } from "../utils/taskStorage";
import { updateDecorations } from "../utils/decorations";
import { Task } from "../types";

export async function updateTask(context: vscode.ExtensionContext) {
  const tasks = getTasks(context);
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
      const updatedTask = await getUpdatedTaskDetails(task);
      if (updatedTask) {
        tasks[index] = updatedTask;
        saveTasks(context, tasks);
        vscode.window.showInformationMessage(
          `Task updated: ${updatedTask.description}`
        );
        if (vscode.window.activeTextEditor) {
          updateDecorations(vscode.window.activeTextEditor, tasks);
        }
      }
    }
  }
}

async function getUpdatedTaskDetails(task: Task): Promise<Task | undefined> {
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
    return {
      ...task,
      description: newDescription,
      priority: newPriority as "low" | "medium" | "high",
      assignee: newAssignee,
    };
  }
  return undefined;
}
