import express from "express";

const app = express();
const port = 4000;
const tasks = [
  {
    id: 1,
    taskName: "Develop Login Page",
    assignedTo: "Rahul Sharma",
    status: "Pending",
    priority: "High"
  },
  {
    id: 2,
    taskName: "Build Dashboard",
    assignedTo: "Priya Singh",
    status: "In Progress",
    priority: "Medium"
  },
  {
    id: 3,
    taskName: "Write API Documentation",
    assignedTo: "Amit Kumar",
    status: "Pending",
    priority: "Low"
  }
];

app.use(express.json());

function hasRequiredTaskFields(task) {
  return task !== null
    && typeof task === "object"
    && !Array.isArray(task)
    && task.id !== undefined
    && String(task.id).trim() !== ""
    && ["taskName", "assignedTo", "status"].every(
      (field) => typeof task[field] === "string" && task[field].trim() !== ""
    );
}

app.get("/tasks", (_request, response) => {
  response.json(tasks);
});

app.get("/tasks/:id", (request, response) => {
  const task = tasks.find((item) => String(item.id) === request.params.id);
  if (!task) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  response.json(task);
});

app.post("/tasks", (request, response) => {
  const task = request.body;
  if (!hasRequiredTaskFields(task)) {
    response.status(400).json({ message: "Missing or invalid required task details" });
    return;
  }

  if (tasks.some((item) => String(item.id) === String(task.id))) {
    response.status(409).json({ message: "A task with this ID already exists" });
    return;
  }

  tasks.push(task);
  response.status(201).json({ message: "Task added successfully", task });
});

app.put("/tasks/:id", (request, response) => {
  const task = tasks.find((item) => String(item.id) === request.params.id);
  if (!task) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  const updates = request.body;
  const editableFields = ["taskName", "assignedTo", "status", "priority"];
  if (
    updates === null
    || typeof updates !== "object"
    || Array.isArray(updates)
    || Object.keys(updates).length === 0
    || Object.keys(updates).some((field) => !editableFields.includes(field))
    || Object.entries(updates).some(
      ([field, value]) => !editableFields.includes(field)
        || typeof value !== "string"
        || value.trim() === ""
    )
  ) {
    response.status(400).json({ message: "Provide valid task fields to update" });
    return;
  }

  Object.assign(task, updates);
  response.json({ message: "Task updated successfully", task });
});

app.delete("/tasks/:id", (request, response) => {
  const taskIndex = tasks.findIndex((item) => String(item.id) === request.params.id);
  if (taskIndex === -1) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  response.json({ message: "Task deleted successfully", task: deletedTask });
});

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found" });
});

app.use((error, _request, response, _next) => {
  if (error.type === "entity.parse.failed") {
    response.status(400).json({ message: "Request body must contain valid JSON" });
    return;
  }

  console.error("Express request failed:", error);
  response.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Express Server running at http://localhost:${port}`);
});
