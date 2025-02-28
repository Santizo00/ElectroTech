import bcrypt from "bcryptjs";
import pool from "../config/ConfigSQLS.js";

const crearUsuarios = async () => {
    try {
        await pool.connect(); // Asegurar que la conexión esté abierta

        // Encriptar la contraseña "1234"
        const hashedPassword = await bcrypt.hash("1234", 10);

        console.log("Contraseña encriptada, insertando usuarios...");

        // Insertar el usuario "admin"
        await pool.request()
            .input("nombre", "Admin 1")
            .input("usuario", "admin")
            .input("contrasena", hashedPassword)
            .input("idRol", 1)  // 1 = Administrador
            .query("INSERT INTO Usuarios (nombre, usuario, contrasena, idRol, estado) VALUES (@nombre, @usuario, @contrasena, @idRol, 1)");

        // Insertar el usuario "vendedor"
        await pool.request()
            .input("nombre", "Vendedor 1")
            .input("usuario", "vendedor")
            .input("contrasena", hashedPassword)
            .input("idRol", 2)  // 2 = Vendedor
            .query("INSERT INTO Usuarios (nombre, usuario, contrasena, idRol, estado) VALUES (@nombre, @usuario, @contrasena, @idRol, 1)");

        console.log("Usuarios creados exitosamente.");

    } catch (error) {
        console.error("Error al crear los usuarios:", error);
    } finally {
        // Cerrar la conexión después de ejecutar las consultas
        await pool.close();
    }
};

// Ejecutar la función
crearUsuarios();
