import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { poolPromise } from "../config/ConfigSQLS.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("ERROR: JWT_SECRET no está definido en .env");
}

export const login = async (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.status(400).json({ success: false, message: "Usuario y contraseña son obligatorios" });
    }

    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("usuario", usuario)
            .query("SELECT idUsuario, nombre, usuario, contrasena, idRol FROM Usuarios WHERE usuario = @usuario");

        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: "Usuario incorrecto" });
        }

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: user.idUsuario, usuario: user.usuario, role: user.idRol },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.status(200).json({
            success: true,
            message: "Inicio de sesión exitoso",
            user: {
                id: user.idUsuario,
                nombre: user.nombre,
                usuario: user.usuario,
                role: user.idRol
            },
            token
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
};
