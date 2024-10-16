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
exports.updateDecorations = updateDecorations;
const vscode = __importStar(require("vscode"));
function updateDecorations(editor, tasks) {
    const fileUri = editor.document.uri;
    const fileTasks = tasks.filter((task) => task.filePath === fileUri.fsPath);
    const decorations = fileTasks.map((task) => ({
        range: new vscode.Range(task.lineNumber, 0, task.lineNumber, 0),
        renderOptions: {
            after: {
                contentText: `📌 ${task.description}`,
                color: getColorForPriority(task.priority),
            },
        },
    }));
    const decorationType = vscode.window.createTextEditorDecorationType({});
    editor.setDecorations(decorationType, decorations);
}
function getColorForPriority(priority) {
    switch (priority) {
        case "low":
            return "green";
        case "medium":
            return "orange";
        case "high":
            return "red";
    }
}
//# sourceMappingURL=decorations.js.map