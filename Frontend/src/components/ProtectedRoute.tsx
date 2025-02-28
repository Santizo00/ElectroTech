import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  [key: string]: any; // Para cualquier otra propiedad que pueda tener
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Verificar autenticación
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        navigate("/login", { replace: true });
        return;
      }
      
      const user = JSON.parse(userStr) as UserData;
      const hasAccess = user && user.role !== undefined && allowedRoles.includes(user.role);
      
      if (!hasAccess) {
        navigate("/login", { replace: true });
      }
      
      setIsChecking(false);
    } catch (error) {
      console.error("Error checking authentication:", error);
      navigate("/login", { replace: true });
      setIsChecking(false);
    }
  }, [navigate, allowedRoles]);
  
  // Mientras verifica, no renderiza nada
  if (isChecking) {
    return null;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;