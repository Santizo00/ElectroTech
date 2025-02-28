import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Home, User, LogOut, Layers, Package, Truck, ShoppingCart } from "lucide-react";

// Definir interfaz para el tipo de usuario
interface UserData {
  id?: number;
  nombre?: string;
  role?: number;
  [key: string]: any; // Para cualquier otra propiedad que pueda tener
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  // Carga los datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData: UserData = JSON.parse(userStr);
          setUser(userData);
        } else {
          // Si no hay datos de usuario, redirigir al login
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Error al cargar los datos de usuario:", error);
        navigate("/login", { replace: true });
      }
    };

    // Cargar datos iniciales
    loadUserData();
    
    // Configurar listener para cambios de autenticación
    const handleAuthChange = () => {
      loadUserData();
    };
    
    // Escuchar eventos de storage para detectar cambios
    window.addEventListener("storage", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [navigate]);

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Navegar al login
    navigate("/login", { replace: true });
  };

  // Si no hay usuario, no renderizar el sidebar
  if (!user) return null;

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-15"
      } bg-gradient-to-b from-blue-800 to-blue-700 text-white min-h-screen flex flex-col transition-all duration-300 shadow-xl`}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-white-600/30">
        <span className={`${isOpen ? "block" : "hidden"} text-xl font-semibold`}>
          ElectroTech
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-blue-600/20 rounded-full transition-colors duration-200"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Opciones Comunes */}
      <nav className="flex-1">
        <Link
          to="/menu"
          className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} p-4 hover:bg-blue-600/20 transition-all duration-200`}
        >
          <Home className="w-6 h-6 text-white" />
          {isOpen && <span className="text-sm font-medium text-white">Menu</span>}
        </Link>

      {/* Opciones SOLO para Administradores */}
        {user.role === 1 && (
          <>
            <Link
              to="/productos"
              className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} p-4 hover:bg-blue-600/20 transition-all duration-200`}
            >
              <Package className="w-6 h-6 text-white" />
              {isOpen && <span className="text-sm font-medium text-white">Productos</span>}
            </Link>

            <Link
              to="/categorias"
              className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} p-4 hover:bg-blue-600/20 transition-all duration-200`}
            >
              <Layers className="w-6 h-6 text-white" />
              {isOpen && <span className="text-sm font-medium text-white">Categorias</span>}
            </Link>

            <Link
            to="/proveedores"
            className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} p-4 hover:bg-blue-600/20 transition-all duration-200`}
            >
            <Truck className="w-6 h-6 text-white" />
            {isOpen && <span className="text-sm font-medium text-white">Proveedores</span>}
            </Link>
            
            <Link
            to="/ventas"
            className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} p-4 hover:bg-blue-600/20 transition-all duration-200`}
            >
            <ShoppingCart className="w-6 h-6 text-white" />
            {isOpen && <span className="text-sm font-medium text-white">Ventas</span>}
            </Link>
          </>
        )}

      {/* Opciones SOLO para Vendedores */}
        {user.role === 2 && (
        <>
            <Link
            to="/ventas"
            className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} p-4 hover:bg-blue-600/20 transition-all duration-200`}
            >
            <ShoppingCart className="w-6 h-6 text-white" />
            {isOpen && <span className="text-sm font-medium text-white">Ventas</span>}
            </Link>
        </>
        )}
      </nav>

      {/* Sección del Usuario y Logout */}
      <div className="p-4 border-t border-white-600/30">
        <div className="flex items-center justify-between space-x-2">
          {isOpen && (
            <div className="flex items-center space-x-2 min-w-0">
              <User className="w-6 h-6 text-white flex-shrink-0" />
              <span className="text-sm font-medium text-white break-words line-clamp-2">
                {user.nombre || "Usuario"}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center p-2 hover:bg-blue-600/20 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            <LogOut className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </aside>
  );
}