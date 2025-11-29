import express from "express";
import  {chatController}  from "../controllers/chatController.js";
import homeController from "../controllers/serverCheck.js";

const router = express.Router();

// GET/server is runing check
router.get("/",homeController)

// POST/api/chat
router.post("/chat", chatController());

export default router;