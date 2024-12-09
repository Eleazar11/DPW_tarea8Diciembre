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
//Ruta para ver sabor
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
//Ruta para editar sabor
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
//ruta para eliminar sabor
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

//rutas para table clientes
app.post("/clientes", (req, res) => {
    const { username, nombre } = req.body;

    if (!username || !nombre) {
        return res.status(400).send("Debe proporcionar el username y nombre del cliente.");
    }

    const query = "INSERT INTO Clientes (username, nombre) VALUES (?, ?)";
    connection.query(query, [username, nombre], (err, result) => {
        if (err) {
            console.error("Error al agregar el cliente:", err.message);
            return res.status(500).send("Error al agregar el cliente.");
        }
        res.status(201).send("Cliente agregado con éxito.");
    });
});

//ver
app.get("/clientes", (req, res) => {
    const query = "SELECT * FROM Clientes";
    connection.query(query, (err, result) => {
        if (err) {
            console.error("Error al obtener los clientes:", err.message);
            return res.status(500).send("Error al obtener los clientes.");
        }
        res.json(result); // Devuelve todos los clientes en formato JSON
    });
});

//modificar 
app.put("/clientes/:id", (req, res) => {
    const { id } = req.params;
    const { username, nombre } = req.body;

    if (!username || !nombre) {
        return res.status(400).send("Debe proporcionar el username y nombre del cliente.");
    }

    const query = "UPDATE Clientes SET username = ?, nombre = ? WHERE id_cliente = ?";
    connection.query(query, [username, nombre, id], (err, result) => {
        if (err) {
            console.error("Error al actualizar el cliente:", err.message);
            return res.status(500).send("Error al actualizar el cliente.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Cliente no encontrado.");
        }

        res.send("Cliente actualizado con éxito.");
    });
});


//eliminar
app.delete("/clientes/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM Clientes WHERE id_cliente = ?";

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar el cliente:", err.message);
            return res.status(500).send("Error al eliminar el cliente.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Cliente no encontrado.");
        }

        res.send("Cliente eliminado con éxito.");
    });
});


//rutas para pedidos:
app.post("/pedidos", (req, res) => {
    const { id_cliente, id_sabor, cantidad } = req.body;

    if (!id_cliente || !id_sabor || !cantidad) {
        return res.status(400).send("Debe proporcionar el id_cliente, id_sabor y cantidad.");
    }

    // Obtener el precio del sabor
    const query = "SELECT precio_unitario FROM Sabores WHERE id_sabor = ?";
    connection.query(query, [id_sabor], (err, result) => {
        if (err) {
            console.error("Error al obtener el precio del sabor:", err.message);
            return res.status(500).send("Error al obtener el precio del sabor.");
        }

        if (result.length === 0) {
            return res.status(404).send("Sabor no encontrado.");
        }

        const precio_unitario = result[0].precio_unitario;
        const total = precio_unitario * cantidad;

        // Insertar el pedido
        const insertQuery = "INSERT INTO Pedidos (id_cliente, id_sabor, cantidad, total) VALUES (?, ?, ?, ?)";
        connection.query(insertQuery, [id_cliente, id_sabor, cantidad, total], (err, result) => {
            if (err) {
                console.error("Error al agregar el pedido:", err.message);
                return res.status(500).send("Error al agregar el pedido.");
            }
            res.status(201).send("Pedido agregado con éxito.");
        });
    });
});
//ver
app.get("/pedidos", (req, res) => {
    const query = "SELECT * FROM Pedidos";
    connection.query(query, (err, result) => {
        if (err) {
            console.error("Error al obtener los pedidos:", err.message);
            return res.status(500).send("Error al obtener los pedidos.");
        }
        res.json(result); // Devuelve todos los pedidos en formato JSON
    });
});
//modificar
app.put("/pedidos/:id", (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (!cantidad) {
        return res.status(400).send("Debe proporcionar la cantidad.");
    }

    // Obtener el precio del sabor
    const query = "SELECT p.id_sabor, s.precio_unitario FROM Pedidos p JOIN Sabores s ON p.id_sabor = s.id_sabor WHERE p.id_pedido = ?";
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error al obtener el precio del sabor:", err.message);
            return res.status(500).send("Error al obtener el precio del sabor.");
        }

        if (result.length === 0) {
            return res.status(404).send("Pedido no encontrado.");
        }

        const precio_unitario = result[0].precio_unitario;
        const total = precio_unitario * cantidad;

        // Actualizar el pedido
        const updateQuery = "UPDATE Pedidos SET cantidad = ?, total = ? WHERE id_pedido = ?";
        connection.query(updateQuery, [cantidad, total, id], (err, result) => {
            if (err) {
                console.error("Error al actualizar el pedido:", err.message);
                return res.status(500).send("Error al actualizar el pedido.");
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("Pedido no encontrado.");
            }

            res.send("Pedido actualizado con éxito.");
        });
    });
});
//eliminar
app.delete("/pedidos/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM Pedidos WHERE id_pedido = ?";

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar el pedido:", err.message);
            return res.status(500).send("Error al eliminar el pedido.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Pedido no encontrado.");
        }

        res.send("Pedido eliminado con éxito.");
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
