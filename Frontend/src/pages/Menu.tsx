import React, { useState, useEffect } from 'react';

// Definir interfaz para el tipo de usuario
interface UserData {
  id?: number;
  nombre?: string;
  role?: number;
  [key: string]: any;
}

const Menu: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [user, setUser] = useState<UserData | null>(null);
  
  useEffect(() => {
    // Cargar datos de usuario
    const loadUserData = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData: UserData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    };
    
    loadUserData();
    
    // Actualizar la fecha cada minuto
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    // Escuchar cambios en el almacenamiento
    window.addEventListener("storage", loadUserData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadUserData);
    };
  }, []);
  
  // Determinar el saludo según la hora
  const getGreeting = () => {
    const hour = currentDate.getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Buenos Días";
    } else if (hour >= 12 && hour < 19) {
      return "Buenas Tardes";
    } else {
      return "Buenas Noches";
    }
  };
  
  // Formatear la fecha en español
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return currentDate.toLocaleDateString('es-ES', options);
  };
  
  // Formatear la hora en formato 12 horas con am/pm
  const formatTime = () => {
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  
  // Obtener el rol como texto
  const getRoleText = () => {
    if (!user || user.role === undefined) return "";
    
    switch (user.role) {
      case 1:
        return "Administrador";
      case 2:
        return "Vendedor";
      default:
        return "Usuario";
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-12 px-8 rounded-xl shadow-xl w-full mx-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">
            {getGreeting()}
          </h1>
          <h2 className="text-3xl font-semibold mb-5">
            {user.nombre || "Usuario"}
          </h2>
          <p className="text-xl opacity-90 mb-4">
            {formatDate().charAt(0).toUpperCase() + formatDate().slice(1)} - {formatTime()}
          </p>
          <div className="mt-3 inline-block bg-blue-800 px-6 py-2 rounded-full text-lg font-medium">
            {getRoleText()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;