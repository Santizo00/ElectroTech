import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="w-screen h-screen flex bg-white">
      {/* Sidebar con opciones */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 h-full w-full flex flex-col">
        <div className="flex-1 w-full p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
