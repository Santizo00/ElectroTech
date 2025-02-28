import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// 🔍 Verificar configuración de conexión
console.log("🔍 Configuración de SQL Server:");
console.log("DB_HOST:", process.env.DB_HOST_SQLServer);
console.log("DB_USER:", process.env.DB_USER_SQLServer);
console.log("DB_PASS:", process.env.DB_PASS_SQLServer);
console.log("DB_NAME:", process.env.DB_NAME_SQLServer);
console.log("DB_PORT:", process.env.DB_PORT_SQLServer);

const configSQLServer = {
    user: process.env.DB_USER_SQLServer,
    password: process.env.DB_PASS_SQLServer,
    server: process.env.DB_HOST_SQLServer, 
    database: process.env.DB_NAME_SQLServer,
    port: parseInt(process.env.DB_PORT_SQLServer) || 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false, 
        trustServerCertificate: true,
        enableArithAbort: true,
        connectionTimeout: 15000,
        requestTimeout: 15000,
    }
};

// 🔹 Mantener conexión activa usando un pool de conexiones
const poolPromise = new sql.ConnectionPool(configSQLServer)
    .connect()
    .then(pool => {
        console.log("Conexión a SQL Server establecida.");
        return pool;
    })
    .catch(error => {
        console.error("Error al conectar con SQL Server:", error);
    });

export { poolPromise };
