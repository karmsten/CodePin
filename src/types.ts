export interface Task {
  id: string;
  description: string;
  assignee?: string;
  priority: "low" | "medium" | "high";
  filePath: string;
  lineNumber: number;
}
