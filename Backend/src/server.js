import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import categoriasRoutes from "./routes/categoriasRoutes.js"; 
import proveedoresRoutes from "./routes/proveedoresRoutes.js";
import productosRoutes from "./routes/productosRoute.js";
import ventasRoutes from "./routes/ventasRoute.js";


dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Rutas de autenticación
app.use("/login", authRoutes);

// Rutas de categorías
app.use("/categorias", categoriasRoutes);

// Rutas de proveedores
app.use("/proveedores", proveedoresRoutes);

// Rutas de productos
app.use("/productos", productosRoutes);

// Rutas de ventas
app.use("/ventas", ventasRoutes);

// Configuración del puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
