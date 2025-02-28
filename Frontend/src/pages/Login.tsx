import React, { useEffect, useState } from "react";
import { Pencil, Trash, Plus, Search, ShoppingCart, List, Save, ArrowLeft } from "lucide-react";
import { showWarning, showSuccess, showConfirm } from "../services/alertService";

// Interfaces
interface Usuario {
  idUsuario: number;
  nombre: string;
}

interface Producto {
  idProducto: number;
  descripcionProducto: string;
  precio: number;
  stock: number;
  idCategoria: number;
  idProveedor: number;
  nombreCategoria?: string;
  nombreProveedor?: string;
}

interface DetalleVenta {
  idProducto: number;
  descripcionProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Venta {
  idVenta: number;
  idUsuario: number;
  fechaVenta: string;
  total: number;
  nombreUsuario?: string;
  detalles?: DetalleVenta[];
}

const API_URL = import.meta.env.VITE_URL_BACKEND;

const Ventas = () => {
  // Estados para gestionar ventas
  const [historialVentas, setHistorialVentas] = useState<Venta[]>([]);
  const [ventaActual, setVentaActual] = useState<DetalleVenta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaVenta, setBusquedaVenta] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalVenta, setTotalVenta] = useState(0);
  const [vistaActual, setVistaActual] = useState<"nueva" | "historial">("nueva");
  const [detallesVentaSeleccionada, setDetallesVentaSeleccionada] = useState<DetalleVenta[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  // Estado para la selección de producto actual
  const [productoSeleccionado, setProductoSeleccionado] = useState<number | string>("");
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(1);

  // Cargar datos iniciales y obtener usuario actual
  useEffect(() => {
    fetchProductos();
    fetchUsuarios();
    fetchVentas();
    obtenerUsuarioActual();
  }, []);

  // Calcular total de venta cuando cambia el detalle
  useEffect(() => {
    const total = ventaActual.reduce((sum, detalle) => sum + detalle.subtotal, 0);
    setTotalVenta(total);
  }, [ventaActual]);

  // Función para obtener todos los productos disponibles
  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/productos`);
      
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      showWarning("Error", "No se pudieron cargar los productos");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener usuarios
  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/usuarios`);
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      showWarning("Error", "No se pudieron cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener historial de ventas
  const fetchVentas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/ventas`);
      
      if (!response.ok) {
        throw new Error('Error al obtener ventas');
      }
      
      const data = await response.json();
      setHistorialVentas(data);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      showWarning("Error", "No se pudieron cargar las ventas");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener detalles de una venta específica
  const fetchDetallesVenta = async (idVenta: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/ventas/${idVenta}/detalles`);
      
      if (!response.ok) {
        throw new Error('Error al obtener detalles de la venta');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener detalles de venta:", error);
      showWarning("Error", "No se pudieron cargar los detalles de la venta");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Función para ver detalles de una venta
  const verDetallesVenta = async (venta: Venta) => {
    const detalles = await fetchDetallesVenta(venta.idVenta);
    setDetallesVentaSeleccionada(detalles);
    setVentaSeleccionada(venta);
  };

  // Función para agregar producto a la venta actual
  const agregarProducto = () => {
    if (!productoSeleccionado) {
      showWarning("Selección requerida", "Seleccione un producto");
      return;
    }

    if (cantidadSeleccionada <= 0) {
      showWarning("Cantidad inválida", "La cantidad debe ser mayor a 0");
      return;
    }

    const producto = productos.find(p => p.idProducto === Number(productoSeleccionado));
    
    if (!producto) {
      showWarning("Error", "Producto no encontrado");
      return;
    }

    if (cantidadSeleccionada > producto.stock) {
      showWarning("Stock insuficiente", `Solo hay ${producto.stock} unidades disponibles`);
      return;
    }

    // Verificar si el producto ya está en la venta
    const productoExistente = ventaActual.find(item => item.idProducto === producto.idProducto);
    
    if (productoExistente) {
      // Actualizar cantidad si ya existe
      const nuevaCantidad = productoExistente.cantidad + cantidadSeleccionada;
      
      if (nuevaCantidad > producto.stock) {
        showWarning("Stock insuficiente", `Solo hay ${producto.stock} unidades disponibles`);
        return;
      }
      
      const nuevosDetalles = ventaActual.map(detalle => {
        if (detalle.idProducto === producto.idProducto) {
          return {
            ...detalle,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * detalle.precioUnitario
          };
        }
        return detalle;
      });
      
      setVentaActual(nuevosDetalles);
    } else {
      // Agregar nuevo detalle
      const nuevoDetalle: DetalleVenta = {
        idProducto: producto.idProducto,
        descripcionProducto: producto.descripcionProducto,
        cantidad: cantidadSeleccionada,
        precioUnitario: producto.precio,
        subtotal: cantidadSeleccionada * producto.precio
      };
      
      setVentaActual([...ventaActual, nuevoDetalle]);
    }
    
    // Resetear selección
    setProductoSeleccionado("");
    setCantidadSeleccionada(1);
  };

  // Función para eliminar producto de la venta actual
  const eliminarProducto = (idProducto: number) => {
    const nuevosDetalles = ventaActual.filter(detalle => detalle.idProducto !== idProducto);
    setVentaActual(nuevosDetalles);
  };

  // Función para editar cantidad de un producto en la venta actual
  const editarCantidadProducto = (idProducto: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      showWarning("Cantidad inválida", "La cantidad debe ser mayor a 0");
      return;
    }
    
    const producto = productos.find(p => p.idProducto === idProducto);
    
    if (!producto) {
      showWarning("Error", "Producto no encontrado");
      return;
    }
    
    if (nuevaCantidad > producto.stock) {
      showWarning("Stock insuficiente", `Solo hay ${producto.stock} unidades disponibles`);
      return;
    }
    
    const nuevosDetalles = ventaActual.map(detalle => {
      if (detalle.idProducto === idProducto) {
        return {
          ...detalle,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * detalle.precioUnitario
        };
      }
      return detalle;
    });
    
    setVentaActual(nuevosDetalles);
  };

  // Función para obtener el usuario actual desde el localStorage
  const obtenerUsuarioActual = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsuarioActual(user);
      }
    } catch (error) {
      console.error("Error al obtener usuario del localStorage:", error);
    }
  };

  // Función para guardar la venta
  const guardarVenta = async () => {
    if (!usuarioActual) {
      showWarning("Error de autenticación", "No se ha detectado un usuario logueado");
      return;
    }
    
    if (ventaActual.length === 0) {
      showWarning("Venta vacía", "Debe agregar al menos un producto a la venta");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Crear objeto de venta
      const venta = {
        idUsuario: usuarioActual.idUsuario,
        total: totalVenta,
        detalles: ventaActual.map(detalle => ({
          idProducto: detalle.idProducto,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario
        }))
      };
      
      // Enviar venta al servidor
      const response = await fetch(`${API_URL}/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la venta');
      }
      
      showSuccess("Éxito", "Venta registrada correctamente");
      
      // Actualizar datos
      fetchVentas();
      fetchProductos(); // Actualizar stock
      
      // Resetear formulario
      setVentaActual([]);
      setTotalVenta(0);
      
    } catch (error) {
      console.error("Error al guardar venta:", error);
      showWarning("Error", error instanceof Error ? error.message : "No se pudo guardar la venta");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cambiar entre vistas
  const cambiarVista = (vista: "nueva" | "historial") => {
    setVistaActual(vista);
    // Resetear detalles de venta seleccionada
    if (vista === "nueva") {
      setDetallesVentaSeleccionada([]);
      setVentaSeleccionada(null);
    }
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter(producto => 
    producto.descripcionProducto.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  // Filtrar ventas por búsqueda
  const ventasFiltradas = historialVentas.filter(venta => {
    const fechaStr = new Date(venta.fechaVenta).toLocaleDateString();
    const usuario = usuarios.find(u => u.idUsuario === venta.idUsuario);
    const usuarioNombre = usuario ? usuario.nombre : '';
    
    return (
      fechaStr.includes(busquedaVenta) || 
      usuarioNombre.toLowerCase().includes(busquedaVenta.toLowerCase()) ||
      venta.idVenta.toString().includes(busquedaVenta)
    );
  });

  // Obtener nombre de usuario
  const getNombreUsuario = (idUsuario: number) => {
    const usuario = usuarios.find(u => u.idUsuario === idUsuario);
    return usuario ? usuario.nombre : "Desconocido";
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg border border-black">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Ventas</h2>
      
      {/* Selector de vistas */}
      <div className="flex mb-6 bg-gray-200 p-1 rounded-lg w-fit">
        <button 
          className={`px-4 py-2 mr-2 rounded ${vistaActual === "nueva" ? "bg-blue-600 text-white" : "hover:bg-gray-300"}`}
          onClick={() => cambiarVista("nueva")}
        >
          <ShoppingCart className="inline-block w-5 h-5 mr-1" />
          Nueva Venta
        </button>
        <button 
          className={`px-4 py-2 rounded ${vistaActual === "historial" ? "bg-blue-600 text-white" : "hover:bg-gray-300"}`}
          onClick={() => cambiarVista("historial")}
        >
          <List className="inline-block w-5 h-5 mr-1" />
          Historial
        </button>
      </div>
      
      {/* Vista de nueva venta */}
      {vistaActual === "nueva" && (
        <div>
          {/* Mostrar usuario actual */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Usuario:</label>
            <div className="p-2 bg-gray-100 rounded w-full md:w-64 text-black border border-gray-300">
              {usuarioActual ? usuarioActual.nombre : "Cargando usuario..."}
            </div>
          </div>
          
          {/* Agregador de productos */}
          <div className="mb-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Agregar producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-1">Producto:</label>
                <select
                  className="border p-2 rounded w-full text-black bg-white border border-black"
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Seleccione un producto</option>
                  {productosFiltrados.map((producto) => (
                    <option key={producto.idProducto} value={producto.idProducto}>
                      {producto.descripcionProducto} - ${producto.precio.toFixed(2)} - Stock: {producto.stock}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  className="border p-2 rounded w-full text-black bg-white border border-black"
                  value={cantidadSeleccionada}
                  onChange={(e) => setCantidadSeleccionada(parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center w-full"
                  onClick={agregarProducto}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </button>
              </div>
            </div>
            
            {/* Búsqueda de productos */}
            <div className="mt-4">
              <label className="block text-gray-700 mb-1">Buscar producto:</label>
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-600 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  className="border p-2 rounded flex-1 text-black placeholder-black bg-white border border-black"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Tabla de productos en la venta actual */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Detalle de venta</h3>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200 text-black">
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-center">Precio</th>
                    <th className="p-2 text-center">Cantidad</th>
                    <th className="p-2 text-center">Subtotal</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventaActual.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-black">
                        No hay productos agregados a la venta
                      </td>
                    </tr>
                  ) : (
                    ventaActual.map((detalle) => (
                      <tr key={detalle.idProducto} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-black">{detalle.descripcionProducto}</td>
                        <td className="p-2 text-black text-center">${detalle.precioUnitario.toFixed(2)}</td>
                        <td className="p-2 text-black text-center">
                          <input
                            type="number"
                            min="1"
                            className="border p-1 rounded w-16 text-center text-black bg-white border border-black"
                            value={detalle.cantidad}
                            onChange={(e) => 
                              editarCantidadProducto(detalle.idProducto, parseInt(e.target.value) || 0)
                            }
                            disabled={isLoading}
                          />
                        </td>
                        <td className="p-2 text-black text-center">${detalle.subtotal.toFixed(2)}</td>
                        <td className="p-2 text-black flex justify-center">
                          <button
                            onClick={() => eliminarProducto(detalle.idProducto)}
                            className="hover:bg-red-400 p-1 rounded bg-red-500"
                            disabled={isLoading}
                          >
                            <Trash className="w-5 text-white" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={3} className="p-2 text-right font-bold text-black">
                      Total:
                    </td>
                    <td className="p-2 text-center font-bold text-black">
                      ${totalVenta.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Botón guardar venta */}
          <div className="flex justify-end">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded flex items-center"
              onClick={guardarVenta}
              disabled={isLoading || ventaActual.length === 0}
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar Venta
            </button>
          </div>
        </div>
      )}
      
      {/* Vista de historial de ventas */}
      {vistaActual === "historial" && (
        <div>
          {/* Búsqueda de ventas */}
          <div className="mb-4 flex items-center">
            <Search className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Buscar venta por ID, fecha o usuario..."
              className="border p-2 rounded ml-2 flex-1 text-black placeholder-black bg-white border border-black"
              value={busquedaVenta}
              onChange={(e) => setBusquedaVenta(e.target.value)}
            />
          </div>
          
          {/* Tabla de historial de ventas */}
          <div className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200 text-black">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Usuario</th>
                    <th className="p-2 text-center">Total</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-black">Cargando...</td>
                    </tr>
                  ) : ventasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-black">No hay ventas disponibles</td>
                    </tr>
                  ) : (
                    ventasFiltradas.map((venta) => (
                      <tr key={venta.idVenta} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-black">{venta.idVenta}</td>
                        <td className="p-2 text-black">
                          {new Date(venta.fechaVenta).toLocaleString()}
                        </td>
                        <td className="p-2 text-black">{getNombreUsuario(venta.idUsuario)}</td>
                        <td className="p-2 text-black text-center">${venta.total.toFixed(2)}</td>
                        <td className="p-2 text-black text-center">
                          <button
                            onClick={() => verDetallesVenta(venta)}
                            className="hover:bg-blue-400 p-1 rounded bg-blue-500"
                          >
                            <Search className="w-5 text-white" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Detalles de venta seleccionada */}
          {ventaSeleccionada && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  Detalles de Venta #{ventaSeleccionada.idVenta}
                </h3>
                <button
                  className="hover:bg-gray-300 p-1 rounded"
                  onClick={() => {
                    setVentaSeleccionada(null);
                    setDetallesVentaSeleccionada([]);
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="font-semibold">Fecha:</span>{" "}
                  {new Date(ventaSeleccionada.fechaVenta).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Usuario:</span>{" "}
                  {getNombreUsuario(ventaSeleccionada.idUsuario)}
                </div>
                <div>
                  <span className="font-semibold">Total:</span>{" "}
                  ${ventaSeleccionada.total.toFixed(2)}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-200 text-black">
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-center">Precio</th>
                      <th className="p-2 text-center">Cantidad</th>
                      <th className="p-2 text-center">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallesVentaSeleccionada.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-black">
                          {isLoading ? "Cargando detalles..." : "No hay detalles disponibles"}
                        </td>
                      </tr>
                    ) : (
                      detallesVentaSeleccionada.map((detalle, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 text-black">{detalle.descripcionProducto}</td>
                          <td className="p-2 text-black text-center">${detalle.precioUnitario.toFixed(2)}</td>
                          <td className="p-2 text-black text-center">{detalle.cantidad}</td>
                          <td className="p-2 text-black text-center">${detalle.subtotal.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Ventas;