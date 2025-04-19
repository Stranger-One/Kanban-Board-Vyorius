import React from "react";
import { useDrag } from "react-dnd";
import { Task } from "../types/types";
import { socket } from "./KanbanBoard";

const TaskCard = ({
  task,
  openTaskForm,
  setUpdateTaskId,
}: {
  task: Task;
  openTaskForm: () => void;
  setUpdateTaskId: (id: string) => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const ref = React.useRef<HTMLDivElement>(null);
  drag(ref);

  const handleDelete = () => {
    socket.emit("task:delete", task._id);
  };

  return (
    <div
      ref={ref}
      className={`bg-white p-4 mb-4 rounded-lg shadow-md border flex items-end justify-between ${
        isDragging ? "opacity-50" : "opacity-100"
      } transition-opacity duration-200`}
    >
      <div className="mb-2">
        <h3 className="font-semibold text-lg text-gray-800">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
      </div>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            openTaskForm();
            setUpdateTaskId(task._id)
          }}
          className="text-blue-500 hover:text-blue-700 text-sm font-medium cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
