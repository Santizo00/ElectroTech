import React, { useEffect, useState } from "react";
import { Pencil, Trash, Plus, Search, X } from "lucide-react";
import { showWarning, showSuccess, showConfirm } from "../services/alertService";

// Interfaces
interface Producto {
  idProducto: number;
  descripcionProducto: string;
  precio: number;
  stock: number;
  idCategoria: number;
  idProveedor: number;
  estado: number;
  nombreCategoria?: string;
  nombreProveedor?: string;
}

interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  estado: number;
}

interface Proveedor {
  idProveedor: number;
  nombreProveedor: string;
  estado: number;
}

const API_URL = import.meta.env.VITE_URL_BACKEND;

const Productos = () => {
  // Estados
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [idProductoEdit, setIdProductoEdit] = useState<number | null>(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    descripcionProducto: "",
    precio: "",
    stock: "",
    idCategoria: "",
    idProveedor: "",
  });

  // Cargar datos al iniciar
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchProveedores();
  }, []);

  // Función para obtener todos los productos
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

  // Función para obtener categorías
  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`);
      
      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }
      
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      showWarning("Error", "No se pudieron cargar las categorías");
    }
  };

  // Función para obtener proveedores
  const fetchProveedores = async () => {
    try {
      const response = await fetch(`${API_URL}/proveedores`);
      
      if (!response.ok) {
        throw new Error('Error al obtener proveedores');
      }
      
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      showWarning("Error", "No se pudieron cargar los proveedores");
    }
  };

  // Manejador de cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Resetear el formulario
  const resetForm = () => {
    setFormData({
      descripcionProducto: "",
      precio: "",
      stock: "",
      idCategoria: "",
      idProveedor: "",
    });
    setEditando(false);
    setIdProductoEdit(null);
  };

  // Preparar producto para edición
  const handleEditar = (producto: Producto) => {
    setEditando(true);
    setIdProductoEdit(producto.idProducto);
    setFormData({
      descripcionProducto: producto.descripcionProducto,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      idCategoria: producto.idCategoria.toString(),
      idProveedor: producto.idProveedor.toString(),
    });
  };

  // Cancelar edición
  const handleCancelar = () => {
    resetForm();
  };

  // Validar formulario
  const validarFormulario = () => {
    const { descripcionProducto, precio, stock, idCategoria, idProveedor } = formData;
    
    if (!descripcionProducto.trim()) {
      showWarning("Campo vacío", "La descripción del producto es obligatoria.");
      return false;
    }
    
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      showWarning("Precio inválido", "El precio debe ser un número mayor que cero.");
      return false;
    }
    
    if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      showWarning("Stock inválido", "El stock debe ser un número positivo.");
      return false;
    }
    
    if (!idCategoria) {
      showWarning("Campo vacío", "Debe seleccionar una categoría.");
      return false;
    }
    
    if (!idProveedor) {
      showWarning("Campo vacío", "Debe seleccionar un proveedor.");
      return false;
    }
    
    return true;
  };

  // Guardar o actualizar producto
  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    const { descripcionProducto, precio, stock, idCategoria, idProveedor } = formData;
    
    const productoData = {
      descripcionProducto,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      idCategoria: parseInt(idCategoria),
      idProveedor: parseInt(idProveedor),
      idProducto: editando ? idProductoEdit : undefined,
    };
    
    const metodo = editando ? "PUT" : "POST";
    const url = editando 
      ? `${API_URL}/productos/${idProductoEdit}` 
      : `${API_URL}/productos`;
    
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
      });
      
      if (response.ok) {
        showSuccess("Éxito", `Producto ${editando ? "actualizado" : "creado"} correctamente.`);
        fetchProductos();
        resetForm();
      } else {
        const errorData = await response.json();
        showWarning("Error", errorData.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      showWarning("Error", "No se pudo guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar producto
  const handleEliminar = async (id: number) => {
    showConfirm(
      "Eliminar producto",
      "¿Estás seguro de que deseas eliminar este producto?",
      async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_URL}/productos/${id}`, { 
            method: "DELETE" 
          });
          
          if (response.ok) {
            showSuccess("Eliminado", "Producto eliminado correctamente.");
            fetchProductos();
          } else {
            const errorData = await response.json();
            showWarning("Error", errorData.message || "Error al eliminar el producto");
          }
        } catch (error) {
          console.error("Error al eliminar producto:", error);
          showWarning("Error", "No se pudo eliminar el producto");
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) =>
    producto.descripcionProducto.toLowerCase().includes(busqueda.toLowerCase())
  );
  
  // Encontrar nombres de categoría y proveedor
  const getNombreCategoria = (idCategoria: number) => {
    const categoria = categorias.find(cat => cat.idCategoria === idCategoria);
    return categoria ? categoria.nombreCategoria : "N/A";
  };
  
  const getNombreProveedor = (idProveedor: number) => {
    const proveedor = proveedores.find(prov => prov.idProveedor === idProveedor);
    return proveedor ? proveedor.nombreProveedor : "N/A";
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg border border-black">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Productos</h2>

      {/* Formulario para agregar/editar */}
      <form onSubmit={handleGuardar} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Descripción:</label>
          <input
            type="text"
            name="descripcionProducto"
            placeholder="Descripción del producto"
            className="border p-2 rounded w-full text-black placeholder-black bg-white border border-black"
            value={formData.descripcionProducto}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-bold mb-2">Precio:</label>
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            step="0.01"
            min="0"
            className="border p-2 rounded w-full text-black placeholder-black bg-white border border-black"
            value={formData.precio}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-bold mb-2">Stock:</label>
          <input
            type="number"
            name="stock"
            placeholder="Stock disponible"
            min="0"
            className="border p-2 rounded w-full text-black placeholder-black bg-white border border-black"
            value={formData.stock}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-bold mb-2">Categoría:</label>
          <select
            name="idCategoria"
            className="border p-2 rounded w-full text-black bg-white border border-black"
            value={formData.idCategoria}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.idCategoria} value={cat.idCategoria}>
                {cat.nombreCategoria}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 font-bold mb-2">Proveedor:</label>
          <select
            name="idProveedor"
            className="border p-2 rounded w-full text-black bg-white border border-black"
            value={formData.idProveedor}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.idProveedor} value={prov.idProveedor}>
                {prov.nombreProveedor}
              </option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2 flex gap-2 mt-4">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
            disabled={isLoading}
          >
            {editando ? "Actualizar" : "Agregar"}
            {!editando && <Plus className="w-4 h-4" />}
          </button>
          
          {editando && (
            <button 
              type="button" 
              className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-1"
              onClick={handleCancelar}
              disabled={isLoading}
            >
              Cancelar
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Barra de búsqueda */}
      <div className="mb-4 flex items-center">
        <Search className="w-5 h-5 text-gray-600" />
        <input
          type="text"
          placeholder="Buscar producto..."
          className="border p-2 rounded ml-2 flex-1 text-black placeholder-black bg-white border border-black"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-left">Precio</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Categoría</th>
              <th className="p-2 text-left">Proveedor</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-black">Cargando...</td>
              </tr>
            ) : productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-black">No hay productos disponibles</td>
              </tr>
            ) : (
              productosFiltrados.map((producto) => (
                <tr key={producto.idProducto} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-black">{producto.descripcionProducto}</td>
                  <td className="p-2 text-black">${producto.precio.toFixed(2)}</td>
                  <td className="p-2 text-black">{producto.stock}</td>
                  <td className="p-2 text-black">{getNombreCategoria(producto.idCategoria)}</td>
                  <td className="p-2 text-black">{getNombreProveedor(producto.idProveedor)}</td>
                  <td className="p-2 text-black flex justify-center gap-2">
                    <button 
                      onClick={() => handleEditar(producto)}
                      className="hover:bg-orange-400 p-1 rounded bg-orange-500"
                      disabled={isLoading}
                    >
                      <Pencil className="w-5 text-white" />
                    </button>
                    <button 
                      onClick={() => handleEliminar(producto.idProducto)}
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
        </table>
      </div>
    </div>
  );
};

export default Productos;