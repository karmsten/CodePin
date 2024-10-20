export interface Task {
  id: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee?: string;
  filePath: string;
  lineNumber: number;
  notes?: string;
}
