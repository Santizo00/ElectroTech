import React, { useEffect, useState } from "react";
import { Pencil, Trash, Plus, Search, X } from "lucide-react";
import { showWarning, showSuccess, showConfirm } from "../services/alertService";

// Define la interfaz para la proveedor
interface Proveedor {
  idProveedor: number;
  nombreProveedor: string;
  telefono: string;
  correo: string;
  direccion: string;
}

const API_URL = import.meta.env.VITE_URL_BACKEND;

const Proveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [editando, setEditando] = useState(false);
  const [idProveedorEdit, setIdProveedorEdit] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Obtener proveedores al cargar la página
  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/proveedores`);
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      showWarning("Error", "No se pudieron cargar los proveedores");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTelefono = (value: string) => {
    // Elimina todos los caracteres que no sean números
    const soloNumeros = value.replace(/\D/g, "");
  
    // Aplica la máscara (XXX) XXX-XXXX
    if (soloNumeros.length <= 3) {
      return soloNumeros;
    } else if (soloNumeros.length <= 8) {
      return `(${soloNumeros.slice(0, 3)}) ${soloNumeros.slice(3)}`;
    } else {
      return `(${soloNumeros.slice(0, 3)}) ${soloNumeros.slice(3, 8)}${soloNumeros.slice(8, 11)}`;
    }
  };
  
  // Resetear el formulario
  const resetForm = () => {
    setNombreProveedor("");
    setTelefono("");
    setCorreo("");
    setDireccion("");
    setEditando(false);
    setIdProveedorEdit(null);
  };

  // Crear o actualizar proveedor
  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombreProveedor.trim()) {
      showWarning("Campo vacío", "Ingrese un nombre para el proveedor.");
      return;
    }

    const metodo = editando ? "PUT" : "POST";
    const url = editando 
      ? `${API_URL}/proveedores/${idProveedorEdit}` 
      : `${API_URL}/proveedores`;

    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombreProveedor,
          telefono,
          correo,
          direccion,
        }),
      });

      if (response.ok) {
        showSuccess("Éxito", `Proveedor ${editando ? "actualizado" : "creado"} correctamente.`);
        fetchProveedores();
        resetForm();
      } else {
        const errorData = await response.json();
        showWarning("Error", errorData.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      showWarning("Error", "No se pudo guardar el proveedor");
    } finally {
      setIsLoading(false);
    }
  };

  // Preparar edición
  const handleEditar = (proveedor: Proveedor) => {
    setEditando(true);
    setNombreProveedor(proveedor.nombreProveedor);
    setTelefono(proveedor.telefono);
    setCorreo(proveedor.correo);
    setDireccion(proveedor.direccion);
    setIdProveedorEdit(proveedor.idProveedor);
  };

  // Eliminar proveedor
  const handleEliminar = async (id: number) => {
    showConfirm(
      "Eliminar proveedor",
      "¿Estás seguro de que deseas eliminar este proveedor?",
      async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_URL}/proveedores/${id}`, { 
            method: "DELETE" 
          });

          if (response.ok) {
            showSuccess("Eliminado", "Proveedor eliminado correctamente.");
            fetchProveedores();
          } else {
            const errorData = await response.json();
            showWarning("Error", errorData.message || "Error al eliminar el proveedor");
          }
        } catch (error) {
          console.error("Error al eliminar proveedor:", error);
          showWarning("Error", "No se pudo eliminar el proveedor");
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  // Filtrar proveedores en tiempo real
  const proveedoresFiltrados = proveedores.filter((prov) =>
    prov.nombreProveedor.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Proveedores</h2>

      {/* Formulario para agregar/editar */}
      <form onSubmit={handleGuardar} className="mb-4 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Nombre del proveedor"
          className="border p-2 rounded text-black placeholder-black bg-white border border-black"
          value={nombreProveedor}
          onChange={(e) => setNombreProveedor(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Teléfono"
          className="border p-2 rounded text-black placeholder-black bg-white border border-black"
          value={formatTelefono(telefono)} // Aplica la máscara
          onChange={(e) => {
            const soloNumeros = e.target.value.replace(/\D/g, "");
            setTelefono(soloNumeros); // Almacena solo números en el estado
          }}
          disabled={isLoading}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          className="border p-2 rounded text-black placeholder-black bg-white border border-black"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          disabled={isLoading}
        />
        <textarea
          placeholder="Dirección"
          className="border p-2 rounded text-black placeholder-black bg-white border border-black"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
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
            onClick={resetForm}
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
          placeholder="Buscar proveedor..."
          className="border p-2 rounded ml-2 flex-1 text-black placeholder-black bg-white border border-black"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de proveedores */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Teléfono</th>
              <th className="p-2 text-left">Correo</th>
              <th className="p-2 text-left">Dirección</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-black">Cargando...</td>
              </tr>
            ) : proveedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-black">No hay proveedores disponibles</td>
              </tr>
            ) : (
              proveedoresFiltrados.map((prov: Proveedor) => (
                <tr key={prov.idProveedor} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-black">{prov.nombreProveedor}</td>
                  <td className="p-2 text-black">{prov.telefono}</td>
                  <td className="p-2 text-black">{prov.correo}</td>
                  <td className="p-2 text-black">{prov.direccion}</td>
                  <td className="p-2 flex justify-center gap-2">
                    <button 
                      onClick={() => handleEditar(prov)}
                      className="hover:bg-orange-400 p-1 rounded bg-orange-500"
                      disabled={isLoading}
                    >
                      <Pencil className="w-5 text-white" />
                    </button>
                    <button 
                      onClick={() => handleEliminar(prov.idProveedor)}
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

export default Proveedores;