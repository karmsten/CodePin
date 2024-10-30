import * as vscode from "vscode";
import { Task } from "../types";

export function updateDecorations(editor: vscode.TextEditor, tasks: Task[]) {
  const decorationType = vscode.window.createTextEditorDecorationType({});
  editor.setDecorations(decorationType, []);
}

//not in use
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
