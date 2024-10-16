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
exports.getTasks = getTasks;
exports.saveTasks = saveTasks;
exports.loadTasks = loadTasks;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let tasks = [];
function getTasks(context) {
    if (tasks.length === 0) {
        loadTasks(context);
    }
    return tasks;
}
function saveTasks(context, newTasks) {
    tasks = newTasks;
    const tasksFilePath = getTasksFilePath(context);
    try {
        fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to save tasks: ${error}`);
    }
}
function loadTasks(context) {
    const tasksFilePath = getTasksFilePath(context);
    try {
        if (fs.existsSync(tasksFilePath)) {
            const tasksData = fs.readFileSync(tasksFilePath, "utf-8");
            tasks = JSON.parse(tasksData);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to load tasks: ${error}`);
    }
}
function getTasksFilePath(context) {
    return path.join(context.extensionPath, "tasks.json");
}
//# sourceMappingURL=taskStorage.js.map