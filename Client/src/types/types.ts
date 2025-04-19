export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
}

export interface ColumnProps {
  column: { id: string; title: string };
  tasks: Task[];
  onDropTask: (taskId: string, newStatus: string) => void;
  openTaskForm: () => void;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  category: "Bug" | "Feature" | "Enhancement";
  attachments: Attachment[];
}