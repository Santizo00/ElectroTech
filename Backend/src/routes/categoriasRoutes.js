import express from "express";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../controllers/categoriasController.js";

const router = express.Router();

// Obtener todas las categorías
router.get("/", getCategorias);

// Crear nueva categoría
router.post("/", createCategoria);

// Editar una categoría
router.put("/:id", updateCategoria);

// Eliminar (desactivar) una categoría
router.delete("/:id", deleteCategoria);

export default router;