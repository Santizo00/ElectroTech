import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

// Definir la interfaz para las props
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: number[];
}

// Definir interfaz para el tipo de usuario
interface UserData {
  id?: number;
  nombre?: string;
  role?: number;
  [key: string]: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    // Función para verificar autenticación y permisos
    const checkAccess = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setHasAccess(false);
          setIsChecking(false);
          return;
        }
        
        const user = JSON.parse(userStr) as UserData;
        
        // Verificar si el usuario tiene el rol permitido
        const userHasAccess = user && 
                             user.role !== undefined && 
                             allowedRoles.includes(user.role);
        
        console.log("User role:", user.role);
        console.log("Allowed roles:", allowedRoles);
        console.log("Has access:", userHasAccess);
        
        setHasAccess(userHasAccess);
        setIsChecking(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setHasAccess(false);
        setIsChecking(false);
      }
    };

    checkAccess();
    
    // Configurar listener para cambios en localStorage
    const handleStorageChange = () => {
      checkAccess();
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [allowedRoles, navigate]);
  
  // Mientras verifica, mostrar algo (opcional) o null
  if (isChecking) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-blue-600 text-xl">Verificando acceso...</p>
      </div>
    );
  }
  
  // Si no tiene acceso, redirigir al login
  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }
  
  // Si tiene acceso, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;