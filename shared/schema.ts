import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const categoryEnum = pgEnum("category", ["Router", "Switch", "Wireless", "트랜시버", "소모품"]);
export const statusEnum = pgEnum("status", ["대여가능", "대여불가"]);
export const rentalStatusEnum = pgEnum("rental_status", ["신청중", "승인", "대여중", "반납완료", "거절"]);
export const approvalStatusEnum = pgEnum("approval_status", ["승인", "거절", "대기"]);
export const roleEnum = pgEnum("role", ["admin", "user"]);
export const departmentEnum = pgEnum("department", ["상품운용팀", "기술본부"]);

// Users table
export const users = pgTable("users", {
  daouId: varchar("daou_id", { length: 100 }).primaryKey(),
  name: text("name").notNull(),
  department: departmentEnum("department").notNull(),
  role: roleEnum("role").notNull().default("user"),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Items table
export const items = pgTable("items", {
  itemId: varchar("item_id").primaryKey().default(sql`gen_random_uuid()`),
  category: categoryEnum("category").notNull(),
  name: text("name").notNull(),
  model: text("model"),
  serialNumber: text("serial_number"),
  status: statusEnum("status").notNull().default("대여가능"),
  note: text("note"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  createdBy: varchar("created_by").references(() => users.daouId).notNull(),
});

// Rentals table
export const rentals = pgTable("rentals", {
  rentalId: varchar("rental_id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").references(() => items.itemId).notNull(),
  userId: varchar("user_id").references(() => users.daouId).notNull(),
  rentalDate: timestamp("rental_date"),
  expectedReturnDate: timestamp("expected_return_date").notNull(),
  actualReturnDate: timestamp("actual_return_date"),
  status: rentalStatusEnum("status").notNull().default("신청중"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Approvals table
export const approvals = pgTable("approvals", {
  approvalId: varchar("approval_id").primaryKey().default(sql`gen_random_uuid()`),
  rentalId: varchar("rental_id").references(() => rentals.rentalId).notNull(),
  approverId: varchar("approver_id").references(() => users.daouId).notNull(),
  approvalDate: timestamp("approval_date"),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default("대기"),
  note: text("note"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  itemId: true,
  createdAt: true,
  createdBy: true,
});

export const insertRentalSchema = createInsertSchema(rentals).omit({
  rentalId: true,
  rentalDate: true,
  actualReturnDate: true,
  status: true,
  createdAt: true,
});

export const insertApprovalSchema = createInsertSchema(approvals).omit({
  approvalId: true,
  approvalDate: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Rental = typeof rentals.$inferSelect;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvals.$inferSelect;

// Extended types for joined queries
export type RentalWithDetails = Rental & {
  item: Item;
  user: User;
  approvals?: Approval[];
};

export type ItemWithRentals = Item & {
  rentals?: RentalWithDetails[];
};