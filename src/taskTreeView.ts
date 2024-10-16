import * as vscode from "vscode";
import { Task } from "./types";
import { getTasks } from "./utils/taskStorage";

export class TaskTreeDataProvider
  implements vscode.TreeDataProvider<TaskTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TaskTreeItem | undefined | null | void
  > = new vscode.EventEmitter<TaskTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TaskTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TaskTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TaskTreeItem): Thenable<TaskTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      const tasks = getTasks(this.context);
      return Promise.resolve(this.getTasks(tasks));
    }
  }

  private getTasks(tasks: Task[]): TaskTreeItem[] {
    return tasks.map(
      (task) =>
        new TaskTreeItem(
          task.description,
          task.priority,
          vscode.TreeItemCollapsibleState.None,
          {
            command: "codepin.jumpToTask",
            title: "Jump to Task",
            arguments: [task.id],
          }
        )
    );
  }
}

class TaskTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly priority: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-(${this.priority})`;
    this.description = this.priority;
    this.iconPath = this.getIconPath(priority);
  }

  private getIconPath(priority: string): { light: string; dark: string } {
    const iconName =
      priority === "high"
        ? "red-circle.svg"
        : priority === "medium"
        ? "yellow-circle.svg"
        : "green-circle.svg";
    return {
      light: vscode.Uri.joinPath(
        vscode.Uri.file(__dirname),
        "..",
        "resources",
        "light",
        iconName
      ).fsPath,
      dark: vscode.Uri.joinPath(
        vscode.Uri.file(__dirname),
        "..",
        "resources",
        "dark",
        iconName
      ).fsPath,
    };
  }
}
