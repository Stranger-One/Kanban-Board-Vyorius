import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Select from "react-select";
import { Attachment, TaskFormData } from "../types/types";
import { socket } from "./KanbanBoard";
import axios from "axios";
import { RiLoader2Line } from "react-icons/ri";
import { FaRegFileAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const TaskForm: React.FC<{
  closeForm: () => void;
  updateTaskId: string | null;
  tasks: any[];
}> = ({ closeForm, updateTaskId, tasks }) => {
  const [uploadedfiles, setUploadedfiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "Medium",
    category: "Feature",
    attachments: [],
  });

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  const categoryOptions = [
    { value: "Bug", label: "Bug" },
    { value: "Feature", label: "Feature" },
    { value: "Enhancement", label: "Enhancement" },
  ];

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
          attachments: [],
          attachmentsPreview: task.attachments || [],
        });
      }
    }
  }, [updateTaskId, tasks]);

  const uploadFiles = async (files: File[]) => {
    setUploadingFiles(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file as unknown as Blob);
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/upload`,
        formData
      );
      console.log("Uploaded files:", response.data);

      setUploadedfiles(response.data);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (selectedOption: any) => {
    setFormData((prev) => ({ ...prev, priority: selectedOption.value }));
  };

  const handleCategoryChange = (selectedOption: any) => {
    setFormData((prev) => ({ ...prev, category: selectedOption.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map((file) => {
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        let previewUrl = "";
        if (isImage || isPdf) {
          previewUrl = URL.createObjectURL(file); // Create a blob URL for preview
        }

        return {
          name: file.name,
          url: previewUrl, // For preview; replace with uploaded URL if needed
          type: file.type,
        };
      });

      setFormData((prev) => ({ ...prev, attachments: newAttachments }));

      // upload file and get url
      console.log(files);
      const filesToUpload = Array.from(files);
      uploadFiles(filesToUpload);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (updateTaskId) {
      const updatedTask = {
        ...formData,
        attachments: formData.attachmentsPreview,
      };
      socket.emit("task:update", updatedTask, updateTaskId);
    } else {
      const newFormData = {
        ...formData,
        attachments: uploadedfiles,
      };
      socket.emit("task:create", newFormData);
    }

    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      category: "Feature",
      attachments: [],
    });
    setUploadedfiles([]);
    closeForm();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 max-w-md bg-white rounded-lg shadow space-y-4"
    >
      <div className=" flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {updateTaskId ? "Update" : "Create"} Task
        </h2>
        <button type="button" onClick={closeForm} className="cursor-pointer">
        <IoMdClose size={28} />
        </button>
      </div>

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

      <div className="space-y-1 flex flex-col md:flex-row gap-2 items-center">
        <label className="text-lg font-semibold">Priority:</label>
        <div className="flex-1 w-full">
          <Select
            options={priorityOptions}
            value={priorityOptions.find(
              (opt) => opt.value === formData.priority
            )}
            onChange={handlePriorityChange}
          />
        </div>
      </div>

      <div className="space-y-1 flex flex-col md:flex-row gap-2 items-center">
        <label className="text-lg font-semibold">Category:</label>
        <div className="flex-1 w-full">
          <Select
            options={categoryOptions}
            value={categoryOptions.find(
              (opt) => opt.value === formData.category
            )}
            onChange={handleCategoryChange}
          />
        </div>
      </div>

      {updateTaskId && formData?.attachmentsPreview ? (
        <div className="flex gap-2 flex-wrap ">
          {formData?.attachmentsPreview?.map((url: string, index: number) =>
            url.includes("image") ? (
              <img
                key={index}
                src={url}
                alt=""
                className="w-10 h-10 object-cover rounded-sm"
              />
            ) : (
              <FaRegFileAlt size={32} />
            )
          )}
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <label className="text-lg font-semibold">Attachments:</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Preview attachments */}
          {formData.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-600 truncate max-w-[100px] relative"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt="preview"
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <p className="text-sm text-gray-700">📄 {file.name}</p>
                  )}

                  {uploadingFiles && (
                    <div className="w-full h-full bg-gray-500/50 absolute top-0 left-0 flex items-center justify-center">
                      <RiLoader2Line
                        size={20}
                        className="text-lg text-white animate-spin"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

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
