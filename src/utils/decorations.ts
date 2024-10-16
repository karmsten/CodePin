import * as vscode from "vscode";
import { Task } from "../types";

export function updateDecorations(editor: vscode.TextEditor, tasks: Task[]) {
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
