import { poolPromise } from "../config/ConfigSQLS.js";

// Obtener todas las categorías
export const getCategorias = async (req, res) => {
  try {
    const pool = await poolPromise; // Esperar a que la promesa se resuelva
    const result = await pool.request().query("SELECT * FROM Categorias WHERE estado = 1");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};

// Crear nueva categoría
export const createCategoria = async (req, res) => {
  const { nombreCategoria } = req.body;

  if (!nombreCategoria || nombreCategoria.trim() === '') {
    return res.status(400).json({ message: "El nombre de la categoría es requerido" });
  }

  try {
    const pool = await poolPromise; // Esperar a que la promesa se resuelva
    await pool.request()
      .input("nombreCategoria", nombreCategoria)
      .query("INSERT INTO Categorias (nombreCategoria, estado) VALUES (@nombreCategoria, 1)");

    res.status(201).json({ message: "Categoría creada exitosamente" });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ message: "Error al crear categoría" });
  }
};

// Editar una categoría
export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombreCategoria } = req.body;

  if (!nombreCategoria || nombreCategoria.trim() === '') {
    return res.status(400).json({ message: "El nombre de la categoría es requerido" });
  }

  try {
    const pool = await poolPromise; // Esperar a que la promesa se resuelva
    const result = await pool.request()
      .input("id", id)
      .input("nombreCategoria", nombreCategoria)
      .query("UPDATE Categorias SET nombreCategoria = @nombreCategoria WHERE idCategoria = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ message: "Error al actualizar categoría" });
  }
};

// Eliminar (desactivar) una categoría
export const deleteCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise; // Esperar a que la promesa se resuelva
    const result = await pool.request()
      .input("id", id)
      .query("UPDATE Categorias SET estado = 0 WHERE idCategoria = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ message: "Error al eliminar categoría" });
  }
};