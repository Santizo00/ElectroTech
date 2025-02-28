import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Proveedores from "./pages/Proveedores";
import Ventas from "./pages/Ventas";
import Menu from "./pages/Menu";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute"; // Asumiendo que lo extraerás a su propio archivo

// Definir interfaz para el tipo de usuario
interface UserData {
  id?: number;
  nombre?: string;
  role?: number;
  [key: string]: any; // Para cualquier otra propiedad que pueda tener
}

// Función para obtener datos del usuario con tipo correcto
const getUserData = (): UserData | null => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error("Error parsing user data:", e);
    return null;
  }
};

function App() {
  const [user, setUser] = useState<UserData | null>(getUserData());
  
  useEffect(() => {
    // Actualizar el estado cuando cambia localStorage
    const handleStorageChange = () => {
      setUser(getUserData());
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // También verificamos periódicamente (para cambios en la misma ventana)
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas dentro del Layout */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={[1, 2]}>
            <Layout />
          </ProtectedRoute>
          
        }>
          {/* Redirección según el rol del usuario */}
          <Route index element={
            user?.role === 1 
              ? <Navigate to="/menu" replace /> 
              : <Navigate to="/menu" replace />
          } />
          
          {/* Rutas para Administrador */}
          <Route 
            path="menu" 
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <Menu />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="productos" 
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <Productos />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="categorias" 
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <Categorias />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="proveedores" 
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <Proveedores />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas para Administrador y Vendedor */}
          <Route 
            path="menu" 
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <Menu />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="ventas" 
            element={
              <ProtectedRoute allowedRoles={[1, 2]}>
                <Ventas />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Captura todas las demás rutas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;