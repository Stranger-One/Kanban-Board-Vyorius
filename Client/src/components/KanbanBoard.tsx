import React, { useCallback, useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import TaskCard from "./TaskCard";

import io from "socket.io-client";
import TaskForm from "./CreateTaskForm";
import { ColumnProps, Task } from "../types/types";
import toast from "react-hot-toast";
import TaskProgressChart from "./TaskProgressChart";
export const socket = io("http://localhost:5000");

const columns = [
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "Done", title: "Done" },
];

const Column: React.FC<ColumnProps> = ({ column, tasks, onDropTask, openTaskForm, setUpdateTaskId }) => {

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
      className="w-full min-h-[70vh] bg-gray-100 rounded-xl p-4 shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">{column.title}</h2>
      {tasks.map((task) => (
        <TaskCard setUpdateTaskId={setUpdateTaskId} openTaskForm={openTaskForm} key={task._id} task={task} />
      ))}
    </div>
  );
};

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openTaskForm, setOpenTaskForm] = useState<boolean>(false)
  const [updateTaskId, setUpdateTaskId] = useState<string | null>(null)

  const handleSyncTasks = useCallback((data: Task[], message: string) => {
    console.log(message, data);
    toast.success(`Tasks ${message} Successfully :)`);
    setTasks(data);
  }, []);

  useEffect(() => {
    socket.on("sync:tasks", (data)=>handleSyncTasks(data, "synced"));
    socket.on("task:created", (data)=>handleSyncTasks(data, "created"));
    socket.on("task:updated", (data)=>handleSyncTasks(data, "updated"));
    socket.on("task:deleted", (data)=>handleSyncTasks(data, "deleted"));
    socket.on("task:moved", (data)=>handleSyncTasks(data, "moved"));

    return () => {
      socket.off("sync:tasks");
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
      socket.off("task:moved");
    };
  }, []);

  const handleDrop = (taskId: string, newStatus: string) => {
    const updatedTask = tasks.find((t) => t._id === taskId);
    if (!updatedTask || updatedTask.status === newStatus) return;

    const movedTask = { ...updatedTask, status: newStatus };
    setTasks((prev) => prev.map((t) => (t._id === taskId ? movedTask : t)));

    socket.emit("task:move", movedTask);
  };

  return (
    <div className="p-10 md:py-10 md:px-30 overflow-auto space-y-5">
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
            setUpdateTaskId={setUpdateTaskId}
          />
        ))}
      </div>

      <div className="">
        <TaskProgressChart tasks={tasks} />
      </div>

      <div className={`${openTaskForm ? "fixed" : "hidden"} bottom-0 left-0 right-0 p-4 bg-gray-400/50 shadow-lg w-full h-full flex flex-col items-center justify-center`}>
        <TaskForm
          closeForm={() => setOpenTaskForm(false)}
          updateTaskId={updateTaskId}
          tasks={tasks}
        />
      </div>
    </div>
  );
};

export default KanbanBoard;
