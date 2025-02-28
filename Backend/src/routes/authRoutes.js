import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// Ruta para iniciar sesión
router.post("/", login);

export default router;
