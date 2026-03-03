import {
  index,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const publicSchema = pgSchema("public");

export const users = publicSchema.table("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projects = publicSchema.table(
  "projects",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("projects_user_id_idx").on(table.userId),
  }),
);

export const contexts = publicSchema.table(
  "contexts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("contexts_user_id_idx").on(table.userId),
  }),
);

export const tasks = publicSchema.table(
  "tasks",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    notes: text("notes"),
    status: text("status").notNull(),
    priority: text("priority"),
    projectId: integer("project_id").references(() => projects.id),
    dueDate: timestamp("due_date", { withTimezone: true }),
    parentTaskId: integer("parent_task_id").references(() => tasks.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("tasks_user_id_idx").on(table.userId),
    projectIdIdx: index("tasks_project_id_idx").on(table.projectId),
    statusIdx: index("tasks_status_idx").on(table.status),
  }),
);

export const taskLogs = publicSchema.table(
  "task_logs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    taskIdIdx: index("task_logs_task_id_idx").on(table.taskId),
  }),
);

export const taskContexts = publicSchema.table(
  "task_contexts",
  {
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id),
    contextId: integer("context_id")
      .notNull()
      .references(() => contexts.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.contextId] }),
    taskIdIdx: index("task_contexts_task_id_idx").on(table.taskId),
  }),
);
