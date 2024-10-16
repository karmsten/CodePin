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
exports.TaskTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
const taskStorage_1 = require("./utils/taskStorage");
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
        if (element) {
            return Promise.resolve([]);
        }
        else {
            const tasks = (0, taskStorage_1.getTasks)(this.context);
            return Promise.resolve(this.getTasks(tasks));
        }
    }
    getTasks(tasks) {
        return tasks.map((task) => new TaskTreeItem(task.description, task.priority, vscode.TreeItemCollapsibleState.None, {
            command: "codepin.jumpToTask",
            title: "Jump to Task",
            arguments: [task.id],
        }));
    }
}
exports.TaskTreeDataProvider = TaskTreeDataProvider;
class TaskTreeItem extends vscode.TreeItem {
    label;
    priority;
    collapsibleState;
    command;
    constructor(label, priority, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.priority = priority;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.tooltip = `${this.label}-(${this.priority})`;
        this.description = this.priority;
        this.iconPath = this.getIconPath(priority);
    }
    getIconPath(priority) {
        const iconName = priority === "high"
            ? "red-circle.svg"
            : priority === "medium"
                ? "yellow-circle.svg"
                : "green-circle.svg";
        return {
            light: vscode.Uri.joinPath(vscode.Uri.file(__dirname), "..", "resources", "light", iconName).fsPath,
            dark: vscode.Uri.joinPath(vscode.Uri.file(__dirname), "..", "resources", "dark", iconName).fsPath,
        };
    }
}
//# sourceMappingURL=taskTreeView.js.map