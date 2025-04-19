import React, { useCallback, useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import TaskCard from "./TaskCard";

import io from "socket.io-client";
import TaskForm from "./CreateTaskForm";
import { ColumnProps, Task } from "../types/types";
export const socket = io("http://localhost:5000");

const columns = [
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "Done", title: "Done" },
];

const Column: React.FC<ColumnProps> = ({ column, tasks, onDropTask, openTaskForm }) => {

  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string }) => {
      const taskId = item.id;
      const newStatus = column.id;
      console.log("Dropped task:", taskId, "to status:", newStatus);
      onDropTask(taskId, newStatus);
    },
  });

  return (
    <div
      ref={(node: HTMLDivElement | null) => {
        drop(node);
      }}
      className="w-full max-w-sm min-h-[70vh] bg-gray-100 rounded-xl p-4 shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">{column.title}</h2>
      {tasks.map((task) => (
        <TaskCard openTaskForm={openTaskForm} key={task._id} task={task} />
      ))}
    </div>
  );
};

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openTaskForm, setOpenTaskForm] = useState<boolean>(false)

  const handleSyncTasks = useCallback((data: Task[]) => {
    console.log("Syncing tasks:", data);

    setTasks(data);
  }, []);

  useEffect(() => {
    // socket.emit("tasks");

    socket.on("sync:tasks", handleSyncTasks);
    socket.on("task:created", handleSyncTasks);

    // socket.on("task:update", (updated: Task) =>
    //   setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    // );

    socket.on("task:deleted", handleSyncTasks);
    socket.on("task:moved", handleSyncTasks);

    return () => {
      socket.off("sync:tasks");
      socket.off("task:created");
      // socket.off("task:update");
      socket.off("task:deleted");
      socket.off("task:moved");
    };
  }, []);

  const handleDrop = (taskId: string, newStatus: string) => {
    console.log("Dropped task:", taskId, "to status:", newStatus);
    const updatedTask = tasks.find((t) => t._id === taskId);
    if (!updatedTask || updatedTask.status === newStatus) return;

    const movedTask = { ...updatedTask, status: newStatus };
    setTasks((prev) => prev.map((t) => (t._id === taskId ? movedTask : t)));

    console.log("Emitting task:move with:", movedTask);
    socket.emit("task:move", movedTask);
  };

  return (
    <div className="p-4 overflow-auto space-y-5">
      <h1 className="text-3xl font-bold w-full text-center mb-10">
        Kanban Board
      </h1>

      <div className="w-full flex justify-end items-center">
        <button
          onClick={() => setOpenTaskForm((prev) => !prev)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
        >
          {"Create Task"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasks.filter((task) => task.status === column.id)}
            onDropTask={handleDrop}
            openTaskForm={()=>setOpenTaskForm(true)}
          />
        ))}
      </div>

      <div className={`${openTaskForm ? "fixed" : "hidden"} bottom-0 left-0 right-0 p-4 bg-gray-400/50 shadow-lg w-full h-full flex flex-col items-center justify-center`}>
        <TaskForm
          closeForm={() => setOpenTaskForm(false)}
        />
      </div>
    </div>
  );
};

export default KanbanBoard;
