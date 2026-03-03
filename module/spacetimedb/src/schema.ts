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

const spacetime = schema(users, tasks, taskLogs, projects, contexts, taskContexts);

const insertTaskLog = (ctx: any, taskId: bigint, message: string) => {
  ctx.db.taskLogs.insert({
    taskId,
    message,
    createdAt: ctx.timestamp,
  });
};

const system_log = (
  ctx: any,
  taskId: bigint,
  previousStatus: string,
  nextStatus: string
) => {
  if (previousStatus === nextStatus) {
    return;
  }

  insertTaskLog(ctx, taskId, `Status changed from ${previousStatus} to ${nextStatus}`);
};

spacetime.reducer(
  "append_log",
  {
    taskId: t.u64(),
    message: t.string(),
  },
  (ctx, { taskId, message }) => {
    const task = ctx.db.tasks.id.find(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (!task.userId.equals(ctx.sender)) {
      throw new Error("Unauthorized");
    }

    insertTaskLog(ctx, taskId, message);
  }
);

spacetime.reducer(
  "set_task_status",
  {
    taskId: t.u64(),
    status: t.string(),
  },
  (ctx, { taskId, status }) => {
    const task = ctx.db.tasks.id.find(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (!task.userId.equals(ctx.sender)) {
      throw new Error("Unauthorized");
    }

    ctx.db.tasks.delete(task);
    ctx.db.tasks.insert({
      ...task,
      status,
      updatedAt: ctx.timestamp,
    });

    system_log(ctx, taskId, task.status, status);
  }
);

export default spacetime;
