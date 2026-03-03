import { schema, table, t } from "spacetimedb/server";

const users = table(
  { name: "users", public: true },
  {
    identity: t.identity().primaryKey(),
    name: t.string(),
    createdAt: t.timestamp(),
  }
);

const tasks = table(
  { name: "tasks", public: true },
  {
    id: t.u64().autoInc().primaryKey(),
    userId: t.identity().index("btree"),
    title: t.string(),
    notes: t.string().optional(),
    status: t.string().index("btree"),
    priority: t.string(),
    projectId: t.u64().optional().index("btree"),
    dueDate: t.timestamp().optional(),
    parentTaskId: t.u64().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

const taskLogs = table(
  { name: "task_logs", public: true },
  {
    id: t.u64().autoInc().primaryKey(),
    taskId: t.u64().index("btree"),
    message: t.string(),
    createdAt: t.timestamp(),
  }
);

const projects = table(
  { name: "projects", public: true },
  {
    id: t.u64().autoInc().primaryKey(),
    userId: t.identity().index("btree"),
    name: t.string(),
    createdAt: t.timestamp(),
  }
);

const contexts = table(
  { name: "contexts", public: true },
  {
    id: t.u64().autoInc().primaryKey(),
    userId: t.identity().index("btree"),
    name: t.string(),
    createdAt: t.timestamp(),
  }
);

const taskContexts = table(
  {
    name: "task_contexts",
    public: true,
    indexes: [
      {
        name: "task_context_idx",
        algorithm: "btree",
        columns: ["taskId", "contextId"] as const,
      },
    ],
  },
  {
    id: t.u64().autoInc().primaryKey(),
    taskId: t.u64().index("btree"),
    contextId: t.u64(),
  }
);

export default schema(users, tasks, taskLogs, projects, contexts, taskContexts);
