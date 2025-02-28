import express from "express";
import { 
  getProductos, 
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} from "../controllers/productosController.js";

const router = express.Router();

// Obtener todos los productos
router.get("/", getProductos);

// Obtener un producto por ID
router.get("/:id", getProductoById);

// Crear nuevo producto
router.post("/", createProducto);

// Actualizar un producto
router.put("/:id", updateProducto);

// Eliminar (desactivar) un producto
router.delete("/:id", deleteProducto);

export default router;