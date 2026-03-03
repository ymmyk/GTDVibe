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

const db = schema(users, tasks, taskLogs, projects, contexts, taskContexts);

const CLARIFY_STATUSES = new Set(["next", "waiting", "someday"]);

function assertTaskOwner(ctx: any, taskId: bigint) {
  const task = ctx.db.tasks.id.find(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  if (!task.userId.equals(ctx.sender)) {
    throw new Error("Not authorized");
  }

  return task;
}

function logStatusChange(
  ctx: any,
  taskId: bigint,
  previousStatus: string,
  nextStatus: string
) {
  if (previousStatus === nextStatus) {
    return;
  }

  ctx.db.taskLogs.insert({
    taskId,
    message: `Status changed from ${previousStatus} to ${nextStatus}`,
    createdAt: ctx.timestamp,
  });
}

db.reducer(
  "create_task",
  {
    title: t.string(),
    notes: t.string().optional(),
    priority: t.string(),
    dueDate: t.timestamp().optional(),
    projectId: t.u64().optional(),
    parentTaskId: t.u64().optional(),
  },
  (ctx, payload) => {
    if (payload.projectId !== undefined) {
      const project = ctx.db.projects.id.find(payload.projectId);
      if (!project || !project.userId.equals(ctx.sender)) {
        throw new Error("Project not found");
      }
    }

    ctx.db.tasks.insert({
      userId: ctx.sender,
      title: payload.title,
      notes: payload.notes,
      status: "inbox",
      priority: payload.priority,
      projectId: payload.projectId,
      dueDate: payload.dueDate,
      parentTaskId: payload.parentTaskId,
      createdAt: ctx.timestamp,
      updatedAt: ctx.timestamp,
    });
  }
);

db.reducer(
  "update_task",
  {
    taskId: t.u64(),
    title: t.string().optional(),
    notes: t.string().optional(),
    priority: t.string().optional(),
    dueDate: t.timestamp().optional(),
  },
  (ctx, { taskId, title, notes, priority, dueDate }) => {
    const task = assertTaskOwner(ctx, taskId);

    ctx.db.tasks.id.update({
      ...task,
      title: title ?? task.title,
      notes: notes ?? task.notes,
      priority: priority ?? task.priority,
      dueDate: dueDate ?? task.dueDate,
      updatedAt: ctx.timestamp,
    });
  }
);

db.reducer("delete_task", { taskId: t.u64() }, (ctx, { taskId }) => {
  assertTaskOwner(ctx, taskId);

  ctx.db.taskContexts.taskId.delete(taskId);
  ctx.db.taskLogs.taskId.delete(taskId);
  ctx.db.tasks.id.delete(taskId);
});

db.reducer("complete_task", { taskId: t.u64() }, (ctx, { taskId }) => {
  const task = assertTaskOwner(ctx, taskId);
  const nextStatus = "done";

  ctx.db.tasks.id.update({
    ...task,
    status: nextStatus,
    updatedAt: ctx.timestamp,
  });

  logStatusChange(ctx, taskId, task.status, nextStatus);
});

db.reducer("move_to_inbox", { taskId: t.u64() }, (ctx, { taskId }) => {
  const task = assertTaskOwner(ctx, taskId);
  const nextStatus = "inbox";

  ctx.db.tasks.id.update({
    ...task,
    status: nextStatus,
    updatedAt: ctx.timestamp,
  });

  logStatusChange(ctx, taskId, task.status, nextStatus);
});

db.reducer(
  "clarify_task",
  {
    taskId: t.u64(),
    status: t.string(),
    projectId: t.u64().optional(),
    contextIds: t.array(t.u64()),
    priority: t.string(),
  },
  (ctx, { taskId, status, projectId, contextIds, priority }) => {
    const task = assertTaskOwner(ctx, taskId);

    if (!CLARIFY_STATUSES.has(status)) {
      throw new Error("Invalid clarify status");
    }

    if (projectId !== undefined) {
      const project = ctx.db.projects.id.find(projectId);
      if (!project || !project.userId.equals(ctx.sender)) {
        throw new Error("Project not found");
      }
    }

    const uniqueContextIds = [...new Set(contextIds)];
    for (const contextId of uniqueContextIds) {
      const context = ctx.db.contexts.id.find(contextId);
      if (!context || !context.userId.equals(ctx.sender)) {
        throw new Error("Context not found");
      }
    }

    ctx.db.taskContexts.taskId.delete(taskId);
    for (const contextId of uniqueContextIds) {
      ctx.db.taskContexts.insert({ taskId, contextId });
    }

    ctx.db.tasks.id.update({
      ...task,
      status,
      projectId,
      priority,
      updatedAt: ctx.timestamp,
    });

    logStatusChange(ctx, taskId, task.status, status);
  }
);

db.reducer("trash_task", { taskId: t.u64() }, (ctx, { taskId }) => {
  const task = assertTaskOwner(ctx, taskId);
  const nextStatus = "trash";

  ctx.db.tasks.id.update({
    ...task,
    status: nextStatus,
    updatedAt: ctx.timestamp,
  });

  logStatusChange(ctx, taskId, task.status, nextStatus);
});

export default db;
