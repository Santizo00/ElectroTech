import { Link } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <div>
            <h1>Panel de Administrador</h1>
            <nav>
                <ul>
                    <li><Link to="/admin/dashboard">Dashboard</Link></li>
                    <li><Link to="/admin/productos">Gestión de Productos</Link></li>
                    <li><Link to="/admin/categorias">Categorías</Link></li>
                    <li><Link to="/admin/proveedores">Proveedores</Link></li>
                    <li><Link to="/admin/usuarios">Gestión de Usuarios</Link></li>
                    <li><Link to="/admin/ventas">Historial de Ventas</Link></li>
                </ul>
            </nav>
            <p>Selecciona una opción para administrar el sistema.</p>
        </div>
    );
};

export default AdminDashboard;
