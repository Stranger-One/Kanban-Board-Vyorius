import React from "react";
import { useDrag } from "react-dnd";
import { Task } from "../types/types";
import { socket } from "./KanbanBoard";
import { FaRegFileAlt } from "react-icons/fa";

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

  // console.log({ task });

  return (
    <div
      ref={ref}
      className={`bg-white p-4 mb-4 rounded-xl shadow-md border space-y-4 ${
        isDragging ? "opacity-50" : "opacity-100"
      } transition-opacity duration-200`}
    >
      {/* Title & Description */}
      <div>
        <h3 className="font-semibold text-lg text-gray-800">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
      </div>

      {/* Metadata Tags */}
      <div className="flex gap-2 flex-wrap text-xs">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-sm font-medium">
          {task.status}
        </span>
        <span
          className={`px-2 py-1 rounded-sm font-medium ${
            task.priority === "High"
              ? "bg-red-100 text-red-700"
              : task.priority === "Medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {task.priority}
        </span>
        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-sm font-medium">
          {task.category}
        </span>
      </div>

      {/* Attachments */}
      {task.attachments?.length > 0 && (
        <div className="flex gap-3 flex-wrap items-center">
          {task.attachments.map((url: string, index: number) =>
            url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
              <img
                key={index}
                src={url}
                alt="attachment"
                className="w-12 h-12 object-cover rounded-md border"
              />
            ) : (
                <FaRegFileAlt key={index} size={28} />
            )
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-2">
        <button
          onClick={() => {
            openTaskForm();
            setUpdateTaskId(task._id);
          }}
          className="text-blue-600 border border-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 border border-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
