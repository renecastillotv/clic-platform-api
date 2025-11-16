require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Directorio donde viven las funciones
const FUNCTIONS_DIR = path.join(__dirname, "functions");

// Asegurar carpeta
if (!fs.existsSync(FUNCTIONS_DIR)) {
  fs.mkdirSync(FUNCTIONS_DIR, { recursive: true });
}

app.all("/:fn", async (req, res) => {
  const file = path.join(FUNCTIONS_DIR, `${req.params.fn}.js`);

  if (!fs.existsSync(file)) {
    return res.status(404).json({
      error: `Function '${req.params.fn}' not found`,
    });
  }

  try {
    delete require.cache[require.resolve(file)];
    const fn = require(file);

    if (typeof fn !== "function") {
      return res.status(500).json({ error: "File must export a function(req,res)" });
    }

    await fn(req, res);
  } catch (err) {
    console.error("Function error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "OK – CLIC Platform API",
    functions: "Place JS files in /functions and call /your-function",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CLIC API running on port ${PORT}`);
});
