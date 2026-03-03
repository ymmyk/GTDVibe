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

const err = (value: string) => ({ tag: "err" as const, value });

spacetime.reducer("create_project", { name: t.string() }, (ctx, { name }) => {
  ctx.db.projects.insert({
    userId: ctx.sender,
    name,
    createdAt: ctx.timestamp,
  });
});

spacetime.reducer(
  "update_project",
  { id: t.u64(), name: t.string() },
  (ctx, { id, name }) => {
    const project = ctx.db.projects.id.find(id);
    if (!project || project.userId !== ctx.sender) {
      return err("project not found");
    }

    ctx.db.projects.delete(project);
    ctx.db.projects.insert({ ...project, name });
  }
);

spacetime.reducer("delete_project", { id: t.u64() }, (ctx, { id }) => {
  const project = ctx.db.projects.id.find(id);
  if (!project || project.userId !== ctx.sender) {
    return err("project not found");
  }

  ctx.db.projects.delete(project);
});

spacetime.reducer("create_context", { name: t.string() }, (ctx, { name }) => {
  ctx.db.contexts.insert({
    userId: ctx.sender,
    name,
    createdAt: ctx.timestamp,
  });
});

spacetime.reducer(
  "update_context",
  { id: t.u64(), name: t.string() },
  (ctx, { id, name }) => {
    const context = ctx.db.contexts.id.find(id);
    if (!context || context.userId !== ctx.sender) {
      return err("context not found");
    }

    ctx.db.contexts.delete(context);
    ctx.db.contexts.insert({ ...context, name });
  }
);

spacetime.reducer("delete_context", { id: t.u64() }, (ctx, { id }) => {
  const context = ctx.db.contexts.id.find(id);
  if (!context || context.userId !== ctx.sender) {
    return err("context not found");
  }

  for (const link of ctx.db.taskContexts.iter()) {
    if (link.contextId === id) {
      ctx.db.taskContexts.delete(link);
    }
  }

  ctx.db.contexts.delete(context);
});

spacetime.reducer(
  "assign_context_to_task",
  { taskId: t.u64(), contextId: t.u64() },
  (ctx, { taskId, contextId }) => {
    const task = ctx.db.tasks.id.find(taskId);
    if (!task || task.userId !== ctx.sender) {
      return err("task not found");
    }

    const context = ctx.db.contexts.id.find(contextId);
    if (!context || context.userId !== ctx.sender) {
      return err("context not found");
    }

    for (const link of ctx.db.taskContexts.iter()) {
      if (link.taskId === taskId && link.contextId === contextId) {
        return;
      }
    }

    ctx.db.taskContexts.insert({ taskId, contextId });
  }
);

spacetime.reducer(
  "remove_context_from_task",
  { taskId: t.u64(), contextId: t.u64() },
  (ctx, { taskId, contextId }) => {
    const task = ctx.db.tasks.id.find(taskId);
    if (!task || task.userId !== ctx.sender) {
      return err("task not found");
    }

    const context = ctx.db.contexts.id.find(contextId);
    if (!context || context.userId !== ctx.sender) {
      return err("context not found");
    }

    for (const link of ctx.db.taskContexts.iter()) {
      if (link.taskId === taskId && link.contextId === contextId) {
        ctx.db.taskContexts.delete(link);
        return;
      }
    }
  }
);

export default spacetime;
