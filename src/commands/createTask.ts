import * as vscode from "vscode";
/* import { Octokit } from "@octokit/rest"; */
import { Task } from "../types";
import { saveTasks, getTasks } from "../utils/taskStorage";
import { updateDecorations } from "../utils/decorations";

export async function createTask(
  context: vscode.ExtensionContext,
  octokit: any
) {
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

    const collaborators = await getCollaborators(octokit);
    const assignee = await vscode.window.showQuickPick(
      ["Unassigned", ...collaborators],
      { placeHolder: "Assign to" }
    );

    if (description && priority) {
      const task: Task = {
        id: Date.now().toString(),
        description,
        priority: priority as "low" | "medium" | "high",
        assignee: assignee === "Unassigned" ? undefined : assignee,
        filePath: editor.document.uri.fsPath,
        lineNumber: position.line,
        notes: "",
      };

      const tasks = getTasks(context);
      tasks.push(task);
      saveTasks(context, tasks);
      updateDecorations(editor, tasks);

      vscode.window.showInformationMessage(`Task created: ${description}`);
    }
  }
}

async function getCollaborators(octokit: any): Promise<string[]> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error("No workspace folder open");
    }

    const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
    const git = gitExtension.getAPI(1);
    const repository = git.repositories[0];

    if (!repository) {
      throw new Error("No git repository found");
    }

    const remoteUrl = repository.state.remotes[0].fetchUrl || "";
    const [owner, repo] = remoteUrl
      .split("/")
      .slice(-2)
      .map((part: string) => part.replace(".git", ""));

    const { data: collaborators } = await octokit.repos.listCollaborators({
      owner,
      repo,
    });

    return collaborators.map((collaborator: any) => collaborator.login);
  } catch (error) {
    console.error("Failed to fetch collaborators", error);
    return [];
  }
}
