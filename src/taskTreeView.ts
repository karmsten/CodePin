import * as vscode from "vscode";
import { Task } from "./types";
import { getTasks } from "./utils/taskStorage";

class AssigneeTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
}

export class TaskTreeDataProvider
  implements
    vscode.TreeDataProvider<AssigneeTreeItem | TaskTreeItem | TaskNotesItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    AssigneeTreeItem | TaskTreeItem | TaskNotesItem | undefined | null | void
  > = new vscode.EventEmitter<
    AssigneeTreeItem | TaskTreeItem | TaskNotesItem | undefined | null | void
  >();
  readonly onDidChangeTreeData: vscode.Event<
    AssigneeTreeItem | TaskTreeItem | TaskNotesItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(
    element: AssigneeTreeItem | TaskTreeItem | TaskNotesItem
  ): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: AssigneeTreeItem | TaskTreeItem | TaskNotesItem
  ): Thenable<(AssigneeTreeItem | TaskTreeItem | TaskNotesItem)[]> {
    if (!element) {
      return Promise.resolve(this.getAssignees());
    } else if (element instanceof AssigneeTreeItem) {
      return Promise.resolve(this.getTasksForAssignee(element.label));
    } else if (element instanceof TaskTreeItem) {
      return Promise.resolve([new TaskNotesItem(element.task)]);
    } else {
      return Promise.resolve([]);
    }
  }

  private getAssignees(): AssigneeTreeItem[] {
    const tasks = getTasks(this.context);
    const assignees = new Set(
      tasks.map((task) => task.assignee || "Unassigned")
    );
    return Array.from(assignees).map(
      (assignee) =>
        new AssigneeTreeItem(
          assignee,
          vscode.TreeItemCollapsibleState.Collapsed
        )
    );
  }

  private getTasksForAssignee(assignee: string): TaskTreeItem[] {
    const tasks = getTasks(this.context);
    return tasks
      .filter((task) => (task.assignee || "Unassigned") === assignee)
      .map(
        (task) =>
          new TaskTreeItem(task, vscode.TreeItemCollapsibleState.Collapsed)
      );
  }
}

class TaskTreeItem extends vscode.TreeItem {
  constructor(
    public readonly task: Task,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(task.description, collapsibleState);
    this.tooltip = `${task.description} (${task.priority})`;
    this.description = task.priority;
    this.iconPath = this.getIconPath(task.priority);
    this.contextValue = "task";
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

class TaskNotesItem extends vscode.TreeItem {
  constructor(public readonly task: Task) {
    super("Notes", vscode.TreeItemCollapsibleState.None);
    this.tooltip = "Click to edit notes";
    this.description = this.truncateNotes(task.notes || "No notes");
    this.contextValue = "taskNotes";
    this.command = {
      command: "codepin.editTaskNotes",
      title: "Edit Notes",
      arguments: [task],
    };
  }

  private truncateNotes(notes: string, maxLength: number = 50): string {
    return notes.length > maxLength
      ? notes.substring(0, maxLength) + "..."
      : notes;
  }
}
