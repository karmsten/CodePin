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
exports.deleteTask = deleteTask;
const vscode = __importStar(require("vscode"));
const taskStorage_1 = require("../utils/taskStorage");
const decorations_1 = require("../utils/decorations");
async function deleteTask(context) {
    const tasks = (0, taskStorage_1.getTasks)(context);
    const taskToDelete = await vscode.window.showQuickPick(tasks.map((task) => `${task.description} (${task.priority})`), { placeHolder: "Select task to delete" });
    if (taskToDelete) {
        const index = tasks.findIndex((task) => `${task.description} (${task.priority})` === taskToDelete);
        if (index !== -1) {
            tasks.splice(index, 1);
            (0, taskStorage_1.saveTasks)(context, tasks);
            vscode.window.showInformationMessage(`Task deleted: ${taskToDelete}`);
            if (vscode.window.activeTextEditor) {
                (0, decorations_1.updateDecorations)(vscode.window.activeTextEditor, tasks);
            }
        }
    }
}
//# sourceMappingURL=deleteTask.js.map