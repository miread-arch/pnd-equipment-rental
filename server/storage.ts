import { type User, type InsertUser, type Item, type InsertItem, type Rental, type InsertRental, type Approval, type InsertApproval, type RentalWithDetails } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByDaouId(daouId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Item methods
  getAllItems(): Promise<Item[]>;
  getItemById(itemId: string): Promise<Item | undefined>;
  getItemsByCategory(category: string): Promise<Item[]>;
  getAvailableItems(): Promise<Item[]>;
  createItem(item: InsertItem, createdBy: string): Promise<Item>;
  updateItem(itemId: string, updates: Partial<Item>): Promise<Item | undefined>;
  deleteItem(itemId: string): Promise<boolean>;
  
  // Rental methods
  getAllRentals(): Promise<RentalWithDetails[]>;
  getRentalById(rentalId: string): Promise<RentalWithDetails | undefined>;
  getRentalsByUserId(userId: string): Promise<RentalWithDetails[]>;
  getPendingRentals(): Promise<RentalWithDetails[]>;
  getOverdueRentals(): Promise<RentalWithDetails[]>;
  createRental(rental: InsertRental): Promise<Rental>;
  updateRental(rentalId: string, updates: Partial<Rental>): Promise<Rental | undefined>;
  
  // Approval methods
  getApprovalsByRentalId(rentalId: string): Promise<Approval[]>;
  getPendingApprovals(): Promise<Approval[]>;
  createApproval(approval: InsertApproval): Promise<Approval>;
  updateApproval(approvalId: string, updates: Partial<Approval>): Promise<Approval | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private items: Map<string, Item>;
  private rentals: Map<string, Rental>;
  private approvals: Map<string, Approval>;

  constructor() {
    this.users = new Map();
    this.items = new Map();
    this.rentals = new Map();
    this.approvals = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample items for each category
    const sampleItems: (Item)[] = [
      // Router
      { itemId: "item-1", category: "라우터", name: "HUAWEI AR6120", model: "AR6120", serialNumber: "HW001234", status: "대여가능", note: "고성능 라우터", createdBy: "admin", createdAt: new Date() },
      { itemId: "item-2", category: "라우터", name: "Cisco ISR 4321", model: "ISR4321", serialNumber: "CS001234", status: "대여가능", note: null, createdBy: "admin", createdAt: new Date() },
      
      // Switch
      { itemId: "item-3", category: "스위치", name: "Cisco Catalyst 2960", model: "C2960-24TT-L", serialNumber: "CS002345", status: "대여가능", note: "24포트 스위치", createdBy: "admin", createdAt: new Date() },
      { itemId: "item-4", category: "스위치", name: "HP ProCurve 2910", model: "J9145A", serialNumber: "HP002345", status: "대여불가", note: null, createdBy: "admin", createdAt: new Date() },
      
      // Wireless
      { itemId: "item-5", category: "무선 제품군", name: "Cisco Aironet 2802", model: "AIR-AP2802I", serialNumber: "CS003456", status: "대여가능", note: "실내용 AP", createdBy: "admin", createdAt: new Date() },
      { itemId: "item-6", category: "무선 제품군", name: "Ubiquiti UniFi AP", model: "U6-Lite", serialNumber: "UB003456", status: "대여가능", note: null, createdBy: "admin", createdAt: new Date() },
      
      // 트랜시버
      { itemId: "item-7", category: "트랜시버", name: "SFP+ 10G 모듈", model: "SFP-10G-SR", serialNumber: "SF004567", status: "대여가능", note: "멀티모드 광모듈", createdBy: "admin", createdAt: new Date() },
      { itemId: "item-8", category: "트랜시버", name: "QSFP+ 40G 모듈", model: "QSFP-40G-SR4", serialNumber: "QS004567", status: "대여가능", note: null, createdBy: "admin", createdAt: new Date() },
      
      // 소모품
      { itemId: "item-9", category: "소모품류", name: "LC-LC 광점퍼코드", model: null, serialNumber: null, status: "대여가능", note: "3미터", createdBy: "admin", createdAt: new Date() },
      { itemId: "item-10", category: "소모품류", name: "이더넷 케이블", model: "CAT6", serialNumber: null, status: "대여가능", note: "5미터", createdBy: "admin", createdAt: new Date() },
    ];
    
    sampleItems.forEach(item => {
      this.items.set(item.itemId, item);
    });
  }

  // User methods
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

  // Item methods
  async getAllItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItemById(itemId: string): Promise<Item | undefined> {
    return this.items.get(itemId);
  }

  async getItemsByCategory(category: string): Promise<Item[]> {
    return Array.from(this.items.values()).filter(item => item.category === category);
  }

  async getAvailableItems(): Promise<Item[]> {
    return Array.from(this.items.values()).filter(item => item.status === "대여가능");
  }

  async createItem(insertItem: InsertItem, createdBy: string): Promise<Item> {
    const item: Item = {
      itemId: randomUUID(),
      ...insertItem,
      status: insertItem.status || "대여가능",
      model: insertItem.model || null,
      serialNumber: insertItem.serialNumber || null,
      note: insertItem.note || null,
      createdBy,
      createdAt: new Date()
    };
    this.items.set(item.itemId, item);
    return item;
  }

  async updateItem(itemId: string, updates: Partial<Item>): Promise<Item | undefined> {
    const item = this.items.get(itemId);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.items.set(itemId, updatedItem);
    return updatedItem;
  }

  async deleteItem(itemId: string): Promise<boolean> {
    return this.items.delete(itemId);
  }

  // Rental methods
  async getAllRentals(): Promise<RentalWithDetails[]> {
    const rentals = Array.from(this.rentals.values());
    return Promise.all(rentals.map(async rental => {
      const item = await this.getItemById(rental.itemId);
      const user = await this.getUserByDaouId(rental.userId);
      const approvals = await this.getApprovalsByRentalId(rental.rentalId);
      
      return {
        ...rental,
        item: item!,
        user: user!,
        approvals
      };
    }));
  }

  async getRentalById(rentalId: string): Promise<RentalWithDetails | undefined> {
    const rental = this.rentals.get(rentalId);
    if (!rental) return undefined;
    
    const item = await this.getItemById(rental.itemId);
    const user = await this.getUserByDaouId(rental.userId);
    const approvals = await this.getApprovalsByRentalId(rental.rentalId);
    
    return {
      ...rental,
      item: item!,
      user: user!,
      approvals
    };
  }

  async getRentalsByUserId(userId: string): Promise<RentalWithDetails[]> {
    const userRentals = Array.from(this.rentals.values()).filter(rental => rental.userId === userId);
    return Promise.all(userRentals.map(async rental => {
      const item = await this.getItemById(rental.itemId);
      const user = await this.getUserByDaouId(rental.userId);
      const approvals = await this.getApprovalsByRentalId(rental.rentalId);
      
      return {
        ...rental,
        item: item!,
        user: user!,
        approvals
      };
    }));
  }

  async getPendingRentals(): Promise<RentalWithDetails[]> {
    const pendingRentals = Array.from(this.rentals.values()).filter(rental => rental.status === "신청중");
    return Promise.all(pendingRentals.map(async rental => {
      const item = await this.getItemById(rental.itemId);
      const user = await this.getUserByDaouId(rental.userId);
      const approvals = await this.getApprovalsByRentalId(rental.rentalId);
      
      return {
        ...rental,
        item: item!,
        user: user!,
        approvals
      };
    }));
  }

  async getOverdueRentals(): Promise<RentalWithDetails[]> {
    const today = new Date();
    const overdueRentals = Array.from(this.rentals.values()).filter(rental => 
      rental.status === "대여중" && 
      rental.expectedReturnDate && 
      new Date(rental.expectedReturnDate) < today
    );
    
    return Promise.all(overdueRentals.map(async rental => {
      const item = await this.getItemById(rental.itemId);
      const user = await this.getUserByDaouId(rental.userId);
      const approvals = await this.getApprovalsByRentalId(rental.rentalId);
      
      return {
        ...rental,
        item: item!,
        user: user!,
        approvals
      };
    }));
  }

  async createRental(insertRental: InsertRental): Promise<Rental> {
    const rental: Rental = {
      rentalId: randomUUID(),
      ...insertRental,
      rentalDate: null,
      actualReturnDate: null,
      status: "신청중",
      createdAt: new Date()
    };
    this.rentals.set(rental.rentalId, rental);
    return rental;
  }

  async updateRental(rentalId: string, updates: Partial<Rental>): Promise<Rental | undefined> {
    const rental = this.rentals.get(rentalId);
    if (!rental) return undefined;
    
    const updatedRental = { ...rental, ...updates };
    this.rentals.set(rentalId, updatedRental);
    return updatedRental;
  }

  // Approval methods
  async getApprovalsByRentalId(rentalId: string): Promise<Approval[]> {
    return Array.from(this.approvals.values()).filter(approval => approval.rentalId === rentalId);
  }

  async getPendingApprovals(): Promise<Approval[]> {
    return Array.from(this.approvals.values()).filter(approval => approval.approvalStatus === "대기");
  }

  async createApproval(insertApproval: InsertApproval): Promise<Approval> {
    const approval: Approval = {
      approvalId: randomUUID(),
      ...insertApproval,
      approvalStatus: insertApproval.approvalStatus || "대기",
      note: insertApproval.note || null,
      approvalDate: null
    };
    this.approvals.set(approval.approvalId, approval);
    return approval;
  }

  async updateApproval(approvalId: string, updates: Partial<Approval>): Promise<Approval | undefined> {
    const approval = this.approvals.get(approvalId);
    if (!approval) return undefined;
    
    const updatedApproval = { ...approval, ...updates };
    this.approvals.set(approvalId, updatedApproval);
    return updatedApproval;
  }
}

export const storage = new MemStorage();
