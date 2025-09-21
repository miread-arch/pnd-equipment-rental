import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertItemSchema, insertRentalSchema, insertApprovalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Items API
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.get("/api/items/available", async (req, res) => {
    try {
      const items = await storage.getAvailableItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available items" });
    }
  });

  app.get("/api/items/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const items = await storage.getItemsByCategory(category);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items by category" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const validation = insertItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid item data", details: validation.error });
      }

      // Validate serial number requirements by category
      const isSerialRequired = validation.data.category !== "소모품";
      if (isSerialRequired && !validation.data.serialNumber?.trim()) {
        return res.status(400).json({ 
          error: "시리얼넘버는 필수입니다", 
          details: `${validation.data.category} 카테고리는 시리얼넘버가 필요합니다.` 
        });
      }

      // Mock current user - in real app, get from session
      const currentUser = "admin";
      const item = await storage.createItem(validation.data, currentUser);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  app.put("/api/items/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      
      // Validate serial number requirements if category is being updated
      if (req.body.category) {
        const isSerialRequired = req.body.category !== "소모품";
        if (isSerialRequired && !req.body.serialNumber?.trim()) {
          return res.status(400).json({ 
            error: "시리얼넘버는 필수입니다", 
            details: `${req.body.category} 카테고리는 시리얼넘버가 필요합니다.` 
          });
        }
      }
      
      const updatedItem = await storage.updateItem(itemId, req.body);
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const deleted = await storage.deleteItem(itemId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Rentals API
  app.get("/api/rentals", async (req, res) => {
    try {
      const rentals = await storage.getAllRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rentals" });
    }
  });

  app.get("/api/rentals/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const rentals = await storage.getRentalsByUserId(userId);
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user rentals" });
    }
  });

  app.get("/api/rentals/pending", async (req, res) => {
    try {
      const rentals = await storage.getPendingRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending rentals" });
    }
  });

  app.get("/api/rentals/overdue", async (req, res) => {
    try {
      const rentals = await storage.getOverdueRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch overdue rentals" });
    }
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      const validation = insertRentalSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid rental data", details: validation.error });
      }

      // Validate that item exists and is available
      const item = await storage.getItemById(validation.data.itemId);
      if (!item) {
        return res.status(400).json({ error: "물품을 찾을 수 없습니다" });
      }
      if (item.status !== "대여가능") {
        return res.status(400).json({ error: "대여 불가능한 물품입니다" });
      }

      // Check for existing active rentals for non-consumable items
      if (item.category !== "소모품") {
        const existingRentals = await storage.getAllRentals();
        const activeRental = existingRentals.find(r => 
          r.itemId === item.itemId && 
          (r.status === "신청중" || r.status === "승인" || r.status === "대여중")
        );
        
        if (activeRental) {
          return res.status(400).json({ 
            error: "이미 대여 신청이나 대여 중인 물품입니다",
            details: `현재 상태: ${activeRental.status}` 
          });
        }
      }

      const rental = await storage.createRental(validation.data);
      
      // Create approval record based on item category
      if (item) {
        const requiresApproval = ["Router", "Switch", "Wireless", "트랜시버"].includes(item.category);
        if (requiresApproval || item.category === "소모품") {
          // Determine approver based on category and business rules
          const approverId = item.category === "소모품" ? "product-team-manager" : "tech-manager";
          
          await storage.createApproval({
            rentalId: rental.rentalId,
            approverId,
            approvalStatus: "대기",
            note: null
          });
        }
      }

      res.status(201).json(rental);
    } catch (error) {
      res.status(500).json({ error: "Failed to create rental" });
    }
  });

  app.put("/api/rentals/:rentalId", async (req, res) => {
    try {
      const { rentalId } = req.params;
      
      // Validate request body if provided
      if (Object.keys(req.body).length > 0) {
        const allowedFields = ['expectedReturnDate', 'actualReturnDate', 'status'];
        const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
        if (invalidFields.length > 0) {
          return res.status(400).json({ 
            error: "Invalid fields", 
            details: `Only ${allowedFields.join(', ')} can be updated` 
          });
        }
      }
      
      const updatedRental = await storage.updateRental(rentalId, req.body);
      
      if (!updatedRental) {
        return res.status(404).json({ error: "Rental not found" });
      }
      
      res.json(updatedRental);
    } catch (error) {
      res.status(500).json({ error: "Failed to update rental" });
    }
  });

  // Return rental endpoint
  app.post("/api/rentals/:rentalId/return", async (req, res) => {
    try {
      const { rentalId } = req.params;
      
      const rental = await storage.getRentalById(rentalId);
      if (!rental) {
        return res.status(404).json({ error: "Rental not found" });
      }
      
      if (rental.status !== "대여중") {
        return res.status(400).json({ error: "물품이 대여 중이 아닙니다" });
      }
      
      // Update rental status to returned
      const updatedRental = await storage.updateRental(rentalId, {
        status: "반납완료",
        actualReturnDate: new Date()
      });
      
      // Update item status to available
      await storage.updateItem(rental.itemId, { status: "대여가능" });
      
      res.json(updatedRental);
    } catch (error) {
      res.status(500).json({ error: "Failed to return rental" });
    }
  });

  // Approvals API
  app.get("/api/approvals/pending", async (req, res) => {
    try {
      const approvals = await storage.getPendingApprovals();
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  app.get("/api/approvals/rental/:rentalId", async (req, res) => {
    try {
      const { rentalId } = req.params;
      const approvals = await storage.getApprovalsByRentalId(rentalId);
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rental approvals" });
    }
  });

  app.post("/api/approvals/:approvalId/approve", async (req, res) => {
    try {
      const { approvalId } = req.params;
      const { note } = req.body;

      const updatedApproval = await storage.updateApproval(approvalId, {
        approvalStatus: "승인",
        approvalDate: new Date(),
        note: note || null
      });

      if (!updatedApproval) {
        return res.status(404).json({ error: "Approval not found" });
      }

      // Check if this approval completes the rental approval process
      const approvals = await storage.getApprovalsByRentalId(updatedApproval.rentalId);
      const allApproved = approvals.every(approval => approval.approvalStatus === "승인");

      if (allApproved) {
        // Update rental status to approved and set rental date
        await storage.updateRental(updatedApproval.rentalId, {
          status: "대여중",
          rentalDate: new Date()
        });

        // Update item status to unavailable
        const rental = await storage.getRentalById(updatedApproval.rentalId);
        if (rental) {
          await storage.updateItem(rental.itemId, { status: "대여불가" });
        }
      }

      res.json(updatedApproval);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve rental" });
    }
  });

  app.post("/api/approvals/:approvalId/reject", async (req, res) => {
    try {
      const { approvalId } = req.params;
      const { note } = req.body;

      const updatedApproval = await storage.updateApproval(approvalId, {
        approvalStatus: "거절",
        approvalDate: new Date(),
        note: note || null
      });

      if (!updatedApproval) {
        return res.status(404).json({ error: "Approval not found" });
      }

      // Update rental status to rejected
      await storage.updateRental(updatedApproval.rentalId, {
        status: "거절"
      });

      res.json(updatedApproval);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject rental" });
    }
  });

  // Dashboard stats API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allItems = await storage.getAllItems();
      const availableItems = await storage.getAvailableItems();
      const pendingApprovals = await storage.getPendingApprovals();
      const overdueRentals = await storage.getOverdueRentals();
      
      // Mock user ID - in real app, get from session
      const currentUserId = "user123";
      const myActiveRentals = await storage.getRentalsByUserId(currentUserId);
      const activeRentals = myActiveRentals.filter(r => r.status === "대여중");

      const stats = {
        totalItems: allItems.length,
        availableItems: availableItems.length,
        myActiveRentals: activeRentals.length,
        pendingApprovals: pendingApprovals.length,
        overdueRentals: overdueRentals.length
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Category stats API
  app.get("/api/dashboard/categories", async (req, res) => {
    try {
      const allItems = await storage.getAllItems();
      const availableItems = await storage.getAvailableItems();
      
      const categories = ["라우터", "스위치", "무선 제품군", "트랜시버", "소모품류"];
      const categoryStats = categories.map(category => {
        const totalInCategory = allItems.filter(item => item.category === category).length;
        const availableInCategory = availableItems.filter(item => item.category === category).length;
        
        return {
          category,
          total: totalInCategory,
          available: availableInCategory
        };
      });

      res.json(categoryStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
