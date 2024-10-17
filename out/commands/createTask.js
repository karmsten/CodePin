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
exports.createTask = createTask;
const vscode = __importStar(require("vscode"));
const taskStorage_1 = require("../utils/taskStorage");
const decorations_1 = require("../utils/decorations");
async function createTask(context) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = editor.selection.active;
        const description = await vscode.window.showInputBox({
            prompt: "Enter task description",
        });
        const priority = await vscode.window.showQuickPick(["low", "medium", "high"], { placeHolder: "Select priority" });
        const assignee = await vscode.window.showInputBox({
            prompt: "Assign to (optional)",
        });
        if (description && priority) {
            const task = {
                id: Date.now().toString(),
                description,
                priority: priority,
                assignee,
                filePath: editor.document.uri.fsPath,
                lineNumber: position.line,
                notes: "",
            };
            const tasks = (0, taskStorage_1.getTasks)(context);
            tasks.push(task);
            (0, taskStorage_1.saveTasks)(context, tasks);
            (0, decorations_1.updateDecorations)(editor, tasks);
            vscode.window.showInformationMessage(`Task created: ${description}`);
        }
    }
}
//# sourceMappingURL=createTask.js.map