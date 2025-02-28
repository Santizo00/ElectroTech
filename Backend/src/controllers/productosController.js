import { poolPromise } from "../config/ConfigSQLS.js";

// Obtener todos los productos (activos)
export const getProductos = async (req, res) => {
  try {
    const pool = await poolPromise;
    // Consulta con JOINs para obtener nombres de categoría y proveedor
    const result = await pool.request().query(`
      SELECT p.*, c.nombreCategoria, pr.nombreProveedor 
      FROM Productos p
      INNER JOIN Categorias c ON p.idCategoria = c.idCategoria
      INNER JOIN Proveedores pr ON p.idProveedor = pr.idProveedor
      WHERE p.estado = 1
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

// Obtener un producto por ID
export const getProductoById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", id)
      .query(`
        SELECT p.*, c.nombreCategoria, pr.nombreProveedor 
        FROM Productos p
        INNER JOIN Categorias c ON p.idCategoria = c.idCategoria
        INNER JOIN Proveedores pr ON p.idProveedor = pr.idProveedor
        WHERE p.idProducto = @id AND p.estado = 1
      `);
      
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};

// Crear nuevo producto
export const createProducto = async (req, res) => {
  const { descripcionProducto, precio, stock, idCategoria, idProveedor } = req.body;
  
  // Validación de datos
  if (!descripcionProducto || descripcionProducto.trim() === '') {
    return res.status(400).json({ message: "La descripción del producto es requerida" });
  }
  
  if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
    return res.status(400).json({ message: "El precio debe ser un número mayor que cero" });
  }
  
  if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
    return res.status(400).json({ message: "El stock debe ser un número positivo" });
  }
  
  if (!idCategoria) {
    return res.status(400).json({ message: "La categoría es requerida" });
  }
  
  if (!idProveedor) {
    return res.status(400).json({ message: "El proveedor es requerido" });
  }
  
  try {
    const pool = await poolPromise;
    
    // Verificar que la categoría exista y esté activa
    const categoriaResult = await pool.request()
      .input("idCategoria", idCategoria)
      .query("SELECT * FROM Categorias WHERE idCategoria = @idCategoria AND estado = 1");
      
    if (categoriaResult.recordset.length === 0) {
      return res.status(400).json({ message: "La categoría seleccionada no existe o está inactiva" });
    }
    
    // Verificar que el proveedor exista y esté activo
    const proveedorResult = await pool.request()
      .input("idProveedor", idProveedor)
      .query("SELECT * FROM Proveedores WHERE idProveedor = @idProveedor AND estado = 1");
      
    if (proveedorResult.recordset.length === 0) {
      return res.status(400).json({ message: "El proveedor seleccionado no existe o está inactivo" });
    }
    
    // Insertar el producto
    await pool.request()
      .input("descripcionProducto", descripcionProducto)
      .input("precio", precio)
      .input("stock", stock)
      .input("idCategoria", idCategoria)
      .input("idProveedor", idProveedor)
      .query(`
        INSERT INTO Productos 
        (descripcionProducto, precio, stock, idCategoria, idProveedor, estado) 
        VALUES 
        (@descripcionProducto, @precio, @stock, @idCategoria, @idProveedor, 1)
      `);
      
    res.status(201).json({ message: "Producto creado exitosamente" });
  } catch (error) {
    console.error("Error al crear producto:", error);
    
    // Si hay un error de duplicado (esto varía según el motor de BD)
    if (error.number === 2627 || error.number === 2601) {
      return res.status(400).json({ message: "Ya existe un producto con esa descripción" });
    }
    
    res.status(500).json({ message: "Error al crear producto" });
  }
};

// Actualizar un producto
export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { descripcionProducto, precio, stock, idCategoria, idProveedor } = req.body;
  
  // Validación de datos similar a createProducto
  if (!descripcionProducto || descripcionProducto.trim() === '') {
    return res.status(400).json({ message: "La descripción del producto es requerida" });
  }
  
  if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
    return res.status(400).json({ message: "El precio debe ser un número mayor que cero" });
  }
  
  if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
    return res.status(400).json({ message: "El stock debe ser un número positivo" });
  }
  
  if (!idCategoria) {
    return res.status(400).json({ message: "La categoría es requerida" });
  }
  
  if (!idProveedor) {
    return res.status(400).json({ message: "El proveedor es requerido" });
  }
  
  try {
    const pool = await poolPromise;
    
    // Verificar que la categoría exista y esté activa
    const categoriaResult = await pool.request()
      .input("idCategoria", idCategoria)
      .query("SELECT * FROM Categorias WHERE idCategoria = @idCategoria AND estado = 1");
      
    if (categoriaResult.recordset.length === 0) {
      return res.status(400).json({ message: "La categoría seleccionada no existe o está inactiva" });
    }
    
    // Verificar que el proveedor exista y esté activo
    const proveedorResult = await pool.request()
      .input("idProveedor", idProveedor)
      .query("SELECT * FROM Proveedores WHERE idProveedor = @idProveedor AND estado = 1");
      
    if (proveedorResult.recordset.length === 0) {
      return res.status(400).json({ message: "El proveedor seleccionado no existe o está inactivo" });
    }
    
    // Actualizar el producto
    const result = await pool.request()
      .input("id", id)
      .input("descripcionProducto", descripcionProducto)
      .input("precio", precio)
      .input("stock", stock)
      .input("idCategoria", idCategoria)
      .input("idProveedor", idProveedor)
      .query(`
        UPDATE Productos 
        SET 
          descripcionProducto = @descripcionProducto, 
          precio = @precio, 
          stock = @stock, 
          idCategoria = @idCategoria, 
          idProveedor = @idProveedor 
        WHERE idProducto = @id
      `);
      
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    res.json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    
    // Si hay un error de duplicado
    if (error.number === 2627 || error.number === 2601) {
      return res.status(400).json({ message: "Ya existe un producto con esa descripción" });
    }
    
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

// Eliminar (desactivar) un producto
export const deleteProducto = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", id)
      .query("UPDATE Productos SET estado = 0 WHERE idProducto = @id");
      
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};