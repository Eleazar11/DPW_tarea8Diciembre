import mysql2 from "mysql2";
import express from "express";
import bodyParser from "body-parser";

const connection = mysql2.createConnection({
    host: "localhost",
    database: "heladeria",
    user: "root",
    password: "",
});

const app = express();

app.use(bodyParser.json());

const PORT = 5000;

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err.message);
        return;
    }
    console.log("Base de datos conectada!");
});

// Ruta para agregar un nuevo sabor
app.post("/sabores", (req, res) => {
    const { nombre, precio_unitario, cantidad_disponible } = req.body;

    if (!nombre || !precio_unitario || !cantidad_disponible) {
        return res.status(400).send("Debe proporcionar nombre, precio_unitario y cantidad_disponible.");
    }

    const query = "INSERT INTO Sabores (nombre, precio_unitario, cantidad_disponible) VALUES (?, ?, ?)";
    connection.query(query, [nombre, precio_unitario, cantidad_disponible], (err, result) => {
        if (err) {
            console.error("Error al agregar el sabor:", err.message);
            return res.status(500).send("Error al agregar el sabor.");
        }

        res.status(201).send(`Sabor '${nombre}' agregado con éxito.`);
    });
});
//Ruta para ver
app.get("/sabores", (req, res) => {
    const query = "SELECT * FROM Sabores";
    connection.query(query, (err, resultados) => {
        if (err) {
            console.error("Error al obtener los sabores:", err.message);
            return res.status(500).send("Error al obtener los sabores.");
        }
        res.json(resultados);
    });
});
//Ruta para editar
app.put("/sabores/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, precio_unitario, cantidad_disponible } = req.body;

    if (!nombre || !precio_unitario || !cantidad_disponible) {
        return res.status(400).send("Todos los campos (nombre, precio_unitario, cantidad_disponible) son obligatorios.");
    }

    const query = `
        UPDATE Sabores 
        SET nombre = ?, precio_unitario = ?, cantidad_disponible = ?
        WHERE id_sabor = ?
    `;

    connection.query(query, [nombre, precio_unitario, cantidad_disponible, id], (err, result) => {
        if (err) {
            console.error("Error al actualizar el sabor:", err.message);
            return res.status(500).send("Error al actualizar el sabor.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Sabor no encontrado.");
        }

        res.send("Sabor actualizado con éxito.");
    });
});
//ruta para eliminar
app.delete("/sabores/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM Sabores WHERE id_sabor = ?";

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar el sabor:", err.message);
            return res.status(500).send("Error al eliminar el sabor.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Sabor no encontrado.");
        }

        res.send("Sabor eliminado con éxito.");
    });
});




// Ruta de prueba
app.use("/", (req, res) => {
    res.send("Hola mundo de la API de heladería");
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Corriendo en: http://localhost:${PORT}`);
});
