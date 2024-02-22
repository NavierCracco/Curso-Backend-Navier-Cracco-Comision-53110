// Importamos express y nuestro productManager
const express = require("express");
const productManager = require("./products-manager.js");

const pm = new productManager("./products.json"); // instanciamos el gestor
const app = express(); // creamos la app de express

// Ruta para obtener todos los productos con opciones de paginación
app.get("/products", async (req, res) => {
  const products = await pm.getProducts();

  let { limit, skip } = req.query; // extraemos los paramentros de consulta
  let result = products;

  // Aplicamos la paginación si se proporcionaron "limit" y "skip"
  if (skip && skip > 0) {
    result = result.slice(skip);
  }
  if (limit && limit > 0) {
    result = result.slice(0, limit);
  }

  res.json(result); // Enviamos la lista de productos resultante como respuesta
});

// Ruta para obtener un producto por su id
app.get("/products/:pid", async (req, res) => {
  const id = req.params.pid; // extraemos el id del parámetro de la ruta
  let valorId = parseInt(id); // convertimos el id a número entero (si es necesario)
  const productId = await pm.getProductById(valorId); // intentamos obtener el producto por su id

  // Si el producto no existe, enviamos un mensaje de error con código  404
  if (!productId) {
    res.status(404).send("Product not found - 404");
  } else {
    res.json(productId); // si el producto existe, lo enviamos como respuesta
  }
});

// Iniciamos el servidor en el puerto 8080 o el puerto asignado por el entorno (si existe)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
