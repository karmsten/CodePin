"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskNotesItem = exports.TaskTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
const taskStorage_1 = require("./utils/taskStorage");
class AssigneeTreeItem extends vscode.TreeItem {
    label;
    collapsibleState;
    constructor(label, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = "assigneeSection";
        this.iconPath = new vscode.ThemeIcon("symbol-folder");
        // Add native VS Code styling
        this.resourceUri = vscode.Uri.parse(`assignee-${label}`);
        this.tooltip = new vscode.MarkdownString(`**${label}**\nClick to expand/collapse`);
    }
}
class TaskTreeDataProvider {
    context;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    constructor(context) {
        this.context = context;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.getAssignees());
        }
        else if (element instanceof AssigneeTreeItem) {
            return Promise.resolve(this.getTasksForAssignee(element.label));
        }
        else if (element instanceof TaskTreeItem) {
            return Promise.resolve([
                new TaskActionItem(element.task, "Jump to Task"),
                new TaskNotesItem(element.task),
            ]);
        }
        else {
            return Promise.resolve([]);
        }
    }
    getAssignees() {
        const tasks = (0, taskStorage_1.getTasks)(this.context);
        const assignees = new Set(tasks.map((task) => task.assignee || "Unassigned"));
        return Array.from(assignees).map((assignee) => new AssigneeTreeItem(assignee, vscode.TreeItemCollapsibleState.Collapsed));
    }
    getTasksForAssignee(assignee) {
        const tasks = (0, taskStorage_1.getTasks)(this.context);
        return tasks
            .filter((task) => (task.assignee || "Unassigned") === assignee)
            .map((task) => new TaskTreeItem(task, vscode.TreeItemCollapsibleState.Collapsed));
    }
}
exports.TaskTreeDataProvider = TaskTreeDataProvider;
class TaskActionItem extends vscode.TreeItem {
    task;
    action;
    constructor(task, action) {
        super(action, vscode.TreeItemCollapsibleState.None);
        this.task = task;
        this.action = action;
        this.contextValue = "taskAction";
        // Enhanced button styling using VS Code's native theming
        this.iconPath = new vscode.ThemeIcon("play", new vscode.ThemeColor("button.background"));
        this.tooltip = "Click to jump to task location";
        this.description = "$(arrow-right)";
        // Add command
        this.command = {
            command: "codepin.jumpToTask",
            title: "Jump to Task",
            arguments: [task.id],
        };
    }
}
class TaskTreeItem extends vscode.TreeItem {
    task;
    collapsibleState;
    constructor(task, collapsibleState = vscode
        .TreeItemCollapsibleState.Collapsed) {
        super(task.description, collapsibleState);
        this.task = task;
        this.collapsibleState = collapsibleState;
        this.tooltip = `Priority: ${task.priority}\nAssignee: ${task.assignee || "Unassigned"}`;
        this.description = `${task.priority} | ${task.assignee || "Unassigned"}`;
        this.iconPath = this.getIconPath(task.priority);
        this.contextValue = "task";
    }
    getIconPath(priority) {
        switch (priority) {
            case "high":
                return new vscode.ThemeIcon("circle-filled", new vscode.ThemeColor("charts.red"));
            case "medium":
                return new vscode.ThemeIcon("circle-filled", new vscode.ThemeColor("charts.yellow"));
            case "low":
                return new vscode.ThemeIcon("circle-filled", new vscode.ThemeColor("charts.green"));
            default:
                return new vscode.ThemeIcon("circle-outline");
        }
    }
}
class TaskNotesItem extends vscode.TreeItem {
    task;
    constructor(task) {
        super("Notes", vscode.TreeItemCollapsibleState.None);
        this.task = task;
        this.contextValue = "taskNotes";
        // Show the notes or a placeholder
        this.description = task.notes || "Click to add notes...";
        // Add edit button icon
        this.iconPath = new vscode.ThemeIcon("edit");
        // Create a command that will show the inline editor
        this.command = {
            command: "codepin.showInlineNotesEditor",
            title: "Edit Notes",
            arguments: [this],
        };
    }
}
exports.TaskNotesItem = TaskNotesItem;
//not in use
/*class TaskNotesItem extends vscode.TreeItem {
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
} */
//# sourceMappingURL=taskTreeView.js.map