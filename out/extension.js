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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
/* import { Octokit } from "@octokit/rest"; */
const createTask_1 = require("./commands/createTask");
const deleteTask_1 = require("./commands/deleteTask");
const updateTask_1 = require("./commands/updateTask");
const showAllTasks_1 = require("./commands/showAllTasks");
const taskStorage_1 = require("./utils/taskStorage");
const decorations_1 = require("./utils/decorations");
const taskTreeView_1 = require("./taskTreeView");
let octokit;
async function activate(context) {
    console.log('Congratulations, your extension "codepin" is now active!');
    try {
        const session = await vscode.authentication.getSession("github", ["repo"], {
            createIfNone: true,
        });
        const { Octokit } = await import("@octokit/rest");
        octokit = new Octokit({ auth: session.accessToken });
        vscode.window.showInformationMessage("Successfully authenticated with GitHub");
    }
    catch (error) {
        vscode.window.showErrorMessage("Failed to authenticate with GitHub");
        console.error(error);
    }
    (0, taskStorage_1.loadTasks)(context);
    const taskTreeDataProvider = new taskTreeView_1.TaskTreeDataProvider(context);
    vscode.window.registerTreeDataProvider("codepinTasks", taskTreeDataProvider);
    let createTaskDisposable = vscode.commands.registerCommand("codepin.createTask", async () => {
        await (0, createTask_1.createTask)(context, octokit);
        taskTreeDataProvider.refresh();
    });
    let deleteTaskDisposable = vscode.commands.registerCommand("codepin.deleteTask", async () => {
        await (0, deleteTask_1.deleteTask)(context);
        taskTreeDataProvider.refresh();
    });
    let updateTaskDisposable = vscode.commands.registerCommand("codepin.updateTask", async () => {
        await (0, updateTask_1.updateTask)(context);
        taskTreeDataProvider.refresh();
    });
    let showAllTasksDisposable = vscode.commands.registerCommand("codepin.showAllTasks", () => (0, showAllTasks_1.showAllTasks)(context));
    let jumpToTaskDisposable = vscode.commands.registerCommand("codepin.jumpToTask", (taskId) => {
        const tasks = (0, taskStorage_1.getTasks)(context);
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            vscode.workspace.openTextDocument(task.filePath).then((doc) => {
                vscode.window.showTextDocument(doc).then((editor) => {
                    const position = new vscode.Position(task.lineNumber, 0);
                    editor.selection = new vscode.Selection(position, position);
                    editor.revealRange(new vscode.Range(position, position));
                });
            });
        }
    });
    let editTaskNotesDisposable = vscode.commands.registerCommand("codepin.editTaskNotes", async (task) => {
        const newNotes = await vscode.window.showInputBox({
            prompt: "Edit task notes",
            value: task.notes,
            placeHolder: "Enter notes for this task",
        });
        if (newNotes !== undefined) {
            task.notes = newNotes;
            const tasks = (0, taskStorage_1.getTasks)(context);
            const index = tasks.findIndex((t) => t.id === task.id);
            if (index !== -1) {
                tasks[index] = task;
                (0, taskStorage_1.saveTasks)(context, tasks);
                taskTreeDataProvider.refresh();
            }
        }
    });
    context.subscriptions.push(createTaskDisposable, deleteTaskDisposable, updateTaskDisposable, showAllTasksDisposable, jumpToTaskDisposable, editTaskNotesDisposable);
    // Register CodeLens provider
    let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider({ scheme: "file", language: "*" }, new CodePinCodeLensProvider(context));
    let showTaskDetailsDisposable = vscode.commands.registerCommand("codepin.showTaskDetails", (task) => {
        const priorityIcon = getPriorityIcon(task.priority);
        const mainMessage = `${priorityIcon} ${task.description} (${task.assignee || "Unassigned"})`;
        const detailMessage = [
            `Priority: ${task.priority}`,
            `Assignee: ${task.assignee || "Unassigned"}`,
            `Task: ${task.description}`,
            task.notes ? `Notes: ${task.notes}` : null,
        ]
            .filter(Boolean)
            .join("\n\n");
        vscode.window.showInformationMessage(mainMessage, {
            detail: detailMessage,
        });
    });
    function getPriorityIcon(priority) {
        switch (priority) {
            case "low":
                return "🟢";
            case "medium":
                return "🟠";
            case "high":
                return "🔴";
        }
    }
    context.subscriptions.push(showTaskDetailsDisposable);
    // Update decorations when the active editor changes
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            (0, decorations_1.updateDecorations)(editor, (0, taskStorage_1.getTasks)(context));
        }
    });
}
class CodePinCodeLensProvider {
    context;
    constructor(context) {
        this.context = context;
    }
    provideCodeLenses(document, token) {
        const codeLenses = [];
        // Add a CodeLens at the top of the file to create a new task
        const topOfDocument = new vscode.Range(0, 0, 0, 0);
        const createTaskCodeLens = new vscode.CodeLens(topOfDocument, {
            title: "Create Task",
            command: "codepin.createTask",
        });
        codeLenses.push(createTaskCodeLens);
        // Add CodeLenses for existing tasks in this file
        const tasks = (0, taskStorage_1.getTasks)(this.context);
        const fileTasks = tasks.filter((task) => task.filePath === document.uri.fsPath);
        for (const task of fileTasks) {
            const taskRange = new vscode.Range(task.lineNumber, 0, task.lineNumber, 0);
            const taskCodeLens = new vscode.CodeLens(taskRange, {
                title: this.getTaskTitle(task),
                command: "codepin.showTaskDetails",
                arguments: [task],
            });
            codeLenses.push(taskCodeLens);
        }
        return codeLenses;
    }
    getTaskTitle(task) {
        const assignee = task.assignee || "Unassigned";
        const priorityIcon = this.getPriorityIcon(task.priority);
        const truncatedDescription = task.description.length > 30
            ? task.description.substring(0, 27) + "..."
            : task.description;
        return `${priorityIcon} ${truncatedDescription} (${assignee})`;
    }
    getPriorityIcon(priority) {
        switch (priority) {
            case "low":
                return "🟢"; // Green circle for low priority
            case "medium":
                return "🟠"; // Orange circle for medium priority
            case "high":
                return "🔴"; // Red circle for high priority
        }
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map