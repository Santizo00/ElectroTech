import React, { useEffect, useState } from "react";
import { Pencil, Trash, Plus, Search, X } from "lucide-react";
import { showWarning, showSuccess, showConfirm } from "../services/alertService";

// Define la interfaz para la categoría
interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  estado: number;
}

const API_URL = import.meta.env.VITE_URL_BACKEND;

const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [editando, setEditando] = useState(false);
  const [idCategoriaEdit, setIdCategoriaEdit] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Obtener categorías al cargar la página
  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/categorias`);
      
      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }
      
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      showWarning("Error", "No se pudieron cargar las categorías");
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setNombreCategoria("");
    setEditando(false);
    setIdCategoriaEdit(null);
  };

  // Crear o actualizar categoría
  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombreCategoria.trim()) {
      showWarning("Campo vacío", "Ingrese un nombre para la categoría.");
      return;
    }
  
    const metodo = editando ? "PUT" : "POST";
    const url = editando 
      ? `${API_URL}/categorias/${idCategoriaEdit}` 
      : `${API_URL}/categorias`;
  
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombreCategoria,
          idCategoria: editando ? idCategoriaEdit : undefined, // Enviar el ID solo si es edición
        }),
      });
  
      if (response.ok) {
        showSuccess("Éxito", `Categoría ${editando ? "actualizada" : "creada"} correctamente.`);
        fetchCategorias();
        resetForm();
      } else {
        const errorData = await response.json();
        showWarning("Error", errorData.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      showWarning("Error", "No se pudo guardar la categoría");
    } finally {
      setIsLoading(false);
    }
  };

  // Preparar edición
  const handleEditar = (categoria: Categoria) => {
    setEditando(true);
    setNombreCategoria(categoria.nombreCategoria);
    setIdCategoriaEdit(categoria.idCategoria);
  };

  // Cancelar edición
  const handleCancelar = () => {
    resetForm();
  };

  // Eliminar categoría
  const handleEliminar = async (id: number) => {
    showConfirm(
      "Eliminar categoría",
      "¿Estás seguro de que deseas eliminar esta categoría?",
      async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_URL}/categorias/${id}`, { 
            method: "DELETE" 
          });
  
          if (response.ok) {
            showSuccess("Eliminado", "Categoría eliminada correctamente.");
            fetchCategorias();
          } else {
            const errorData = await response.json();
            showWarning("Error", errorData.message || "Error al eliminar la categoría");
          }
        } catch (error) {
          console.error("Error al eliminar categoría:", error);
          showWarning("Error", "No se pudo eliminar la categoría");
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  // Filtrar categorías en tiempo real
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombreCategoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-lg border border-black">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Categorías</h2>

      {/* Formulario para agregar/editar */}
      <form onSubmit={handleGuardar} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Nombre de la categoría a crear"
          className="border p-2 rounded flex-1 text-black placeholder-black bg-white border border-black"
          value={nombreCategoria}
          onChange={(e) => setNombreCategoria(e.target.value)}
          disabled={isLoading}
        />
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
      </form>

      {/* Barra de búsqueda */}
      <div className="mb-4 flex items-center">
        <Search className="w-5 h-5 text-gray-600" />
        <input
          type="text"
          placeholder="Buscar categoría..."
          className="border p-2 rounded ml-2 flex-1 text-black placeholder-black bg-white border border-black"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de categorías */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={2} className="p-4 text-center text-black">Cargando...</td>
              </tr>
            ) : categoriasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-4 text-center text-black">No hay categorías disponibles</td>
              </tr>
            ) : (
              categoriasFiltradas.map((cat: Categoria) => (
                <tr key={cat.idCategoria} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-black">{cat.nombreCategoria}</td>
                  <td className="p-2  text-black flex justify-center gap-2">
                    <button 
                      onClick={() => handleEditar(cat)}
                      className="hover:bg-orange-400 p-1 rounded bg-orange-500"
                      disabled={isLoading}
                    >
                      <Pencil className="w-5 text-white" />
                    </button>
                    <button 
                      onClick={() => handleEliminar(cat.idCategoria)}
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

export default Categorias;