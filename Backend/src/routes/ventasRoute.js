import express from "express";
import { 
  getVentas, 
  getVentaById, 
  getDetallesVenta,
  createVenta, 
  deleteVenta
} from "../controllers/ventasController.js";

const router = express.Router();

// Obtener todas las ventas
router.get("/", getVentas);

// Obtener una venta por ID
router.get("/:id", getVentaById);

// Obtener los detalles de una venta
router.get("/:id/detalles", getDetallesVenta);

// Crear nueva venta (con sus detalles)
router.post("/", createVenta);

// Eliminar una venta (generalmente solo para administradores)
router.delete("/:id", deleteVenta);

export default router;