import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { TaskFormData } from "../types/types";
import { socket } from "./KanbanBoard";

const TaskForm: React.FC<{
  closeForm: () => void;
  updateTaskId: string | null;
  tasks: any[];
}> = ({ closeForm, updateTaskId, tasks }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "Medium",
    category: "Feature",
    // attachments: [],
  });

  useEffect(() => {
    if (updateTaskId) {
      const task = tasks.find((task) => task._id === updateTaskId);
      if (task) {
        console.log(task);
        setFormData({
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || "Medium",
          category: task.category || "Feature",
          // attachments: task.attachments || [],
        });
      }
    }
  }, [updateTaskId, tasks]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files) {
  //     const newAttachments: Attachment[] = Array.from(files).map((file) => ({
  //       name: file.name,
  //       url: URL.createObjectURL(file), // For preview; replace with uploaded URL if needed
  //     }));
  //     setFormData((prev) => ({ ...prev, attachments: newAttachments }));
  //   }
  // };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if(updateTaskId){
      socket.emit("task:update", formData, updateTaskId);
    } else {
      socket.emit("task:create", formData);
    }

    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      category: "Feature",
    });
    closeForm();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 max-w-md bg-white rounded-lg shadow space-y-4"
    >
      <h2 className="text-xl font-bold">Create Task</h2>

      <input
        type="text"
        name="title"
        placeholder="Title"
        required
        value={formData.title}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />

      <div className="space-y-1 flex flex-col md:flex-row gap-2">
        <label className="text-lg font-semibold">Priority:</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="flex-1 p-2 border rounded"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      <div className="space-y-1 flex flex-col md:flex-row gap-2">
        <label className="text-lg font-semibold">Category:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option>Bug</option>
          <option>Feature</option>
          <option>Enhancement</option>
        </select>
      </div>

      {/* <div className="space-y-1">
        <label className="text-lg font-semibold">Attachments:</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
      </div> */}

      {/* Preview attachments */}
      {/* {formData.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.attachments.map((file, index) => (
            <div
              key={index}
              className="text-sm text-gray-600 truncate max-w-[100px]"
            >
              📎 {file.name}
            </div>
          ))}
        </div>
      )} */}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {updateTaskId ? "Update" : "Create"} Task
      </button>
    </form>
  );
};

export default TaskForm;
