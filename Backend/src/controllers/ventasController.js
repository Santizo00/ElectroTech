import { poolPromise } from "../config/ConfigSQLS.js";
import sql from "mssql";

// Obtener todas las ventas
export const getVentas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT v.*, u.nombre as nombreUsuario 
      FROM Ventas v
      INNER JOIN Usuarios u ON v.idUsuario = u.idUsuario
      ORDER BY v.fechaVenta DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ message: "Error al obtener ventas" });
  }
};

// Obtener una venta por ID
export const getVentaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", id)
      .query(`
        SELECT v.*, u.nombre as nombreUsuario 
        FROM Ventas v
        INNER JOIN Usuarios u ON v.idUsuario = u.idUsuario
        WHERE v.idVenta = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({ message: "Error al obtener venta" });
  }
};

// Obtener los detalles de una venta
export const getDetallesVenta = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", id)
      .query(`
        SELECT d.*, p.descripcionProducto
        FROM DetallesVentas d
        INNER JOIN Productos p ON d.idProducto = p.idProducto
        WHERE d.idVenta = @id
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener detalles de venta:", error);
    res.status(500).json({ message: "Error al obtener detalles de venta" });
  }
};

// Crear nueva venta con sus detalles
export const createVenta = async (req, res) => {
  const { idUsuario, total, detalles } = req.body;
  
  // Validaciones
  if (!idUsuario) {
    return res.status(400).json({ message: "El usuario es requerido" });
  }
  
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ message: "Se requiere al menos un producto en la venta" });
  }
  
  // Iniciar transacción
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // 1. Verificar que el usuario exista
    const usuarioResult = await new sql.Request(transaction)
      .input("idUsuario", idUsuario)
      .query("SELECT * FROM Usuarios WHERE idUsuario = @idUsuario");
    
    if (usuarioResult.recordset.length === 0) {
      throw new Error("El usuario no existe");
    }
    
    // 2. Verificar stock y productos
    for (const detalle of detalles) {
      const { idProducto, cantidad } = detalle;
      
      if (!idProducto || !cantidad || cantidad <= 0) {
        throw new Error("Datos de producto inválidos");
      }
      
      const productoResult = await new sql.Request(transaction)
        .input("idProducto", idProducto)
        .query("SELECT * FROM Productos WHERE idProducto = @idProducto AND estado = 1");
      
      if (productoResult.recordset.length === 0) {
        throw new Error(`El producto con ID ${idProducto} no existe o está inactivo`);
      }
      
      const producto = productoResult.recordset[0];
      
      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente para el producto: ${producto.descripcionProducto}`);
      }
    }
    
    // 3. Insertar venta
    const insertVentaResult = await new sql.Request(transaction)
      .input("idUsuario", idUsuario)
      .input("total", total)
      .query(`
        INSERT INTO Ventas (idUsuario, total)
        OUTPUT INSERTED.idVenta
        VALUES (@idUsuario, @total)
      `);
    
    const idVenta = insertVentaResult.recordset[0].idVenta;
    
    // 4. Insertar detalles y actualizar stock
    for (const detalle of detalles) {
      const { idProducto, cantidad, precioUnitario } = detalle;
      
      // Insertar detalle
      await new sql.Request(transaction)
        .input("idVenta", idVenta)
        .input("idProducto", idProducto)
        .input("cantidad", cantidad)
        .input("precioUnitario", precioUnitario)
        .query(`
          INSERT INTO DetallesVentas (idVenta, idProducto, cantidad, precioUnitario)
          VALUES (@idVenta, @idProducto, @cantidad, @precioUnitario)
        `);
      
      // Actualizar stock
      await new sql.Request(transaction)
        .input("idProducto", idProducto)
        .input("cantidad", cantidad)
        .query(`
          UPDATE Productos
          SET stock = stock - @cantidad
          WHERE idProducto = @idProducto
        `);
    }
    
    // Finalizar transacción
    await transaction.commit();
    
    res.status(201).json({ 
      message: "Venta registrada exitosamente", 
      idVenta 
    });
    
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    console.error("Error al crear venta:", error);
    res.status(400).json({ message: error.message || "Error al crear venta" });
  }
};

// Eliminar una venta (solo para administradores o casos especiales)
export const deleteVenta = async (req, res) => {
  const { id } = req.params;
  
  // Iniciar transacción
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // 1. Verificar que la venta exista
    const ventaResult = await new sql.Request(transaction)
      .input("id", id)
      .query("SELECT * FROM Ventas WHERE idVenta = @id");
    
    if (ventaResult.recordset.length === 0) {
      throw new Error("Venta no encontrada");
    }
    
    // 2. Obtener detalles para devolver stock
    const detallesResult = await new sql.Request(transaction)
      .input("id", id)
      .query("SELECT * FROM DetallesVentas WHERE idVenta = @id");
    
    // 3. Devolver stock de productos
    for (const detalle of detallesResult.recordset) {
      await new sql.Request(transaction)
        .input("idProducto", detalle.idProducto)
        .input("cantidad", detalle.cantidad)
        .query(`
          UPDATE Productos
          SET stock = stock + @cantidad
          WHERE idProducto = @idProducto
        `);
    }
    
    // 4. Eliminar detalles
    await new sql.Request(transaction)
      .input("id", id)
      .query("DELETE FROM DetallesVentas WHERE idVenta = @id");
    
    // 5. Eliminar venta
    await new sql.Request(transaction)
      .input("id", id)
      .query("DELETE FROM Ventas WHERE idVenta = @id");
    
    // Finalizar transacción
    await transaction.commit();
    
    res.json({ message: "Venta eliminada exitosamente" });
    
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    console.error("Error al eliminar venta:", error);
    res.status(400).json({ message: error.message || "Error al eliminar venta" });
  }
};