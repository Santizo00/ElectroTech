import { poolPromise } from "../config/ConfigSQLS.js";

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
  try {
    const pool = await poolPromise; // Esperar a que la promesa se resuelva
    const request = pool.request(); // Crear un objeto request desde el pool
    const result = await request.query("SELECT * FROM Proveedores WHERE estado = 1");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ message: "Error al obtener proveedores" });
  }
};

// Crear nuevo proveedor
export const createProveedor = async (req, res) => {
  const { nombreProveedor, telefono, correo, direccion } = req.body;

  if (!nombreProveedor || nombreProveedor.trim() === '') {
    return res.status(400).json({ message: "El nombre del proveedor es requerido" });
  }

  try {
    const pool = await poolPromise; // Esperar a que la promesa se resuelva
    const request = pool.request(); // Crear un objeto request desde el pool
    await request
      .input("nombreProveedor", nombreProveedor)
      .input("telefono", telefono)
      .input("correo", correo)
      .input("direccion", direccion)
      .query("INSERT INTO Proveedores (nombreProveedor, telefono, correo, direccion, estado) VALUES (@nombreProveedor, @telefono, @correo, @direccion, 1)");

    res.status(201).json({ message: "Proveedor creado exitosamente" });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    res.status(500).json({ message: "Error al crear proveedor" });
  }
};

// Editar un proveedor
export const updateProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombreProveedor, telefono, correo, direccion } = req.body;

  if (!nombreProveedor || nombreProveedor.trim() === '') {
    return res.status(400).json({ message: "El nombre del proveedor es requerido" });
  }

  try {
    const pool = await poolPromise; // Esperar a que la promesa se resuelva
    const request = pool.request(); // Crear un objeto request desde el pool
    const result = await request
      .input("id", id)
      .input("nombreProveedor", nombreProveedor)
      .input("telefono", telefono)
      .input("correo", correo)
      .input("direccion", direccion)
      .query("UPDATE Proveedores SET nombreProveedor = @nombreProveedor, telefono = @telefono, correo = @correo, direccion = @direccion WHERE idProveedor = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    res.status(500).json({ message: "Error al actualizar proveedor" });
  }
};

// Eliminar (desactivar) un proveedor
export const deleteProveedor = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise; // Esperar a que la promesa se resuelva
    const request = pool.request(); // Crear un objeto request desde el pool
    const result = await request
      .input("id", id)
      .query("UPDATE Proveedores SET estado = 0 WHERE idProveedor = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    res.status(500).json({ message: "Error al eliminar proveedor" });
  }
};