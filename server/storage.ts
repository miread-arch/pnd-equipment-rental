import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByDaouId(daouId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(daouId: string): Promise<User | undefined> {
    return this.users.get(daouId);
  }

  async getUserByDaouId(daouId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.daouId === daouId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      role: insertUser.role || "user",
      createdAt: new Date() 
    };
    this.users.set(user.daouId, user);
    return user;
  }
}

export const storage = new MemStorage();
