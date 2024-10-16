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
exports.updateTask = updateTask;
const vscode = __importStar(require("vscode"));
const taskStorage_1 = require("../utils/taskStorage");
const decorations_1 = require("../utils/decorations");
async function updateTask(context) {
    const tasks = (0, taskStorage_1.getTasks)(context);
    const taskToUpdate = await vscode.window.showQuickPick(tasks.map((task) => `${task.description} (${task.priority})`), { placeHolder: "Select task to update" });
    if (taskToUpdate) {
        const index = tasks.findIndex((task) => `${task.description} (${task.priority})` === taskToUpdate);
        if (index !== -1) {
            const task = tasks[index];
            const updatedTask = await getUpdatedTaskDetails(task);
            if (updatedTask) {
                tasks[index] = updatedTask;
                (0, taskStorage_1.saveTasks)(context, tasks);
                vscode.window.showInformationMessage(`Task updated: ${updatedTask.description}`);
                if (vscode.window.activeTextEditor) {
                    (0, decorations_1.updateDecorations)(vscode.window.activeTextEditor, tasks);
                }
            }
        }
    }
}
async function getUpdatedTaskDetails(task) {
    const newDescription = await vscode.window.showInputBox({
        prompt: "Enter new description",
        value: task.description,
    });
    const newPriority = await vscode.window.showQuickPick(["low", "medium", "high"], { placeHolder: "Select new priority" });
    const newAssignee = await vscode.window.showInputBox({
        prompt: "Enter new assignee",
        value: task.assignee,
    });
    if (newDescription && newPriority) {
        return {
            ...task,
            description: newDescription,
            priority: newPriority,
            assignee: newAssignee,
        };
    }
    return undefined;
}
//# sourceMappingURL=updateTask.js.map