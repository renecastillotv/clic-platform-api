const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Carpeta de funciones dinámicas
const FUNCTIONS_DIR = path.join(__dirname, "functions");

if (!fs.existsSync(FUNCTIONS_DIR)) {
  fs.mkdirSync(FUNCTIONS_DIR, { recursive: true });
}

// Ruta dinámica: /nombre-funcion
app.all("/:functionName", async (req, res) => {
  const file = path.join(FUNCTIONS_DIR, `${req.params.functionName}.js`);

  try {
    if (!fs.existsSync(file)) {
      return res.status(404).json({
        error: `Function '${req.params.functionName}' not found`,
      });
    }

    delete require.cache[require.resolve(file)];
    const fn = require(file);

    if (typeof fn !== "function") {
      return res.status(500).json({
        error: `Function '${req.params.functionName}' must export a function`,
      });
    }

    await fn(req, res);
  } catch (err) {
    console.error("Function error:", err);
    res.status(500).json({ error: "Function error", message: err.message });
  }
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "CLIC Platform API running",
  });
});

// ESCUCHAR EN 0.0.0.0 PARA DOCKER / APP RUNNER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 CLIC Platform API running on port ${PORT}`);
  console.log(`📁 Functions directory: ${FUNCTIONS_DIR}`);
});
