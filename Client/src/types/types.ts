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
  setUpdateTaskId: (id: string) => void;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: string;
  category: string;
//   attachments: Attachment[];
}