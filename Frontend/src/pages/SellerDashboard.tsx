import { Link } from "react-router-dom";

const SellerDashboard = () => {
    return (
        <div>
            <h1>Panel de Vendedor</h1>
            <nav>
                <ul>
                    <li><Link to="/seller/dashboard">Dashboard</Link></li>
                    <li><Link to="/seller/ventas">Registro de Ventas</Link></li>
                    <li><Link to="/seller/productos">Consulta de Productos</Link></li>
                </ul>
            </nav>
            <p>Selecciona una opción para gestionar tus ventas.</p>
        </div>
    );
};

export default SellerDashboard;
