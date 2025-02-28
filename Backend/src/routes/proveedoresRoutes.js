import express from "express";
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from "../controllers/proveedoresController.js";

const router = express.Router();

// Obtener todos los proveedores
router.get("/", getProveedores);

// Crear nuevo proveedor
router.post("/", createProveedor);

// Editar un proveedor
router.put("/:id", updateProveedor);

// Eliminar (desactivar) un proveedor
router.delete("/:id", deleteProveedor);

export default router;