import TaskModel from "./models/TaskModel.js";

export default (io) => {
  io.on("connection", async (socket) => {
    console.log("New client connected", socket.id);

    // Sync all tasks on new connection
    try {
      const tasks = await TaskModel.find();
      socket.emit("sync:tasks", tasks);
    } catch (error) {
      console.error("Error syncing tasks:", error.message);
    }

    // Send All tasks
    socket.on("tasks", async () => {
      try {
        const tasks = await TaskModel.find();
        socket.emit("sync:tasks", tasks);
      } catch (error) {
        console.error("Error creating task:", error.message);
      }
    });

    // Create task
    socket.on("task:create", async (taskData) => {
      try {
        const newTask = new TaskModel(taskData);
        await newTask.save();
        const tasks = await TaskModel.find();
        io.emit("task:created", tasks);
      } catch (error) {
        console.error("Error creating task:", error.message);
      }
    });

    // Update task
    socket.on("task:update", async (updatedTask) => {
      try {
        const task = await TaskModel.findByIdAndUpdate(
          updatedTask._id,
          updatedTask,
          { new: true }
        );
        if (task) {
          io.emit("task:updated", task);
        }
      } catch (error) {
        console.error("Error updating task:", error.message);
      }
    });

    // Move task
    socket.on("task:move", async ( newStatus ) => {
      try {
        const task = await TaskModel.findByIdAndUpdate(
            newStatus._id,
          { status: newStatus.status },
          { new: true }
        );
        if (task) {
            const tasks = await TaskModel.find();
          io.emit("task:moved", tasks);
        }
      } catch (error) {
        console.error("Error moving task:", error.message);
      }
    });

    // Delete task
    socket.on("task:delete", async (taskId) => {
      try {        
        const deleted = await TaskModel.findByIdAndDelete(taskId);
        const tasks = await TaskModel.find();

        if (deleted) {
          io.emit("task:deleted", tasks);
        }
      } catch (error) {
        console.error("Error deleting task:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};