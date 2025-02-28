import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Home from "./pages/Menu";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Proveedores from "./pages/Proveedores";
import Ventas from "./pages/Ventas";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";

// Definir interfaz para el tipo de usuario
interface UserData {
  id?: number;
  nombre?: string;
  role?: number;
  [key: string]: any;
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
    
    // También verificamos periódicamente para cambios en la misma ventana
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
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />

        {/* Rutas protegidas dentro del Layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={[1, 2]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Página Home como ruta principal para ambos tipos de usuarios */}
          <Route index element={<Home />} />
          
          {/* Rutas para Administrador */}
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