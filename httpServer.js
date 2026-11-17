import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = 3000;
const directory = path.dirname(fileURLToPath(import.meta.url));
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

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function sendText(response, statusCode, text, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(text);
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

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

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
  const { pathname } = requestUrl;

  if (request.method === "GET" && pathname === "/") {
    sendText(response, 200, "<h1>Welcome to Employee Task Management</h1>", "text/html; charset=utf-8");
    return;
  }

  if (request.method === "GET" && pathname === "/tasks") {
    sendJson(response, 200, tasks);
    return;
  }

  if (request.method === "POST" && pathname === "/add-task") {
    const task = await readJsonBody(request);
    if (!hasRequiredTaskFields(task)) {
      sendJson(response, 400, { message: "Invalid JSON or missing required task details" });
      return;
    }

    if (tasks.some((existingTask) => String(existingTask.id) === String(task.id))) {
      sendJson(response, 409, { message: "A task with this ID already exists" });
      return;
    }

    tasks.push(task);
    sendJson(response, 201, { message: "Task added successfully", task });
    return;
  }

  if (request.method === "GET" && pathname === "/about") {
    sendText(response, 200, "Employee Task Management application built with Node.js HTTP and FS modules.");
    return;
  }

  if (request.method === "GET" && pathname === "/home") {
    try {
      const html = await readFile(path.join(directory, "public", "index.html"), "utf8");
      sendText(response, 200, html, "text/html; charset=utf-8");
    } catch (error) {
      console.error("Unable to read public/index.html:", error);
      sendText(response, 500, "Unable to load the home page.");
    }
    return;
  }

  sendJson(response, 404, { message: "Route not found" });
});

server.listen(port, () => {
  console.log(`HTTP Server running at http://localhost:${port}`);
});
