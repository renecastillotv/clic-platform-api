const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// AWS/App Runner pone el puerto en process.env.PORT
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directorio para las funciones
const FUNCTIONS_DIR = path.join(__dirname, 'functions');

// Crear directorio de funciones si no existe
if (!fs.existsSync(FUNCTIONS_DIR)) {
  fs.mkdirSync(FUNCTIONS_DIR, { recursive: true });
}

// Endpoint dinámico que carga funciones al vuelo
app.all('/:functionName', async (req, res) => {
  const { functionName } = req.params;
  const functionPath = path.join(FUNCTIONS_DIR, `${functionName}.js`);

  try {
    if (!fs.existsSync(functionPath)) {
      return res.status(404).json({
        error: `Function '${functionName}' not found`,
        hint: `Create ${functionName}.js in the functions directory`,
      });
    }

    // Limpiar cache para recargar cambios sin reiniciar
    delete require.cache[require.resolve(functionPath)];

    const functionModule = require(functionPath);

    if (typeof functionModule !== 'function') {
      return res.status(500).json({
        error: `Function '${functionName}' must export a function`,
      });
    }

    await functionModule(req, res);
  } catch (error) {
    console.error(`Error in function '${functionName}':`, error);
    res.status(500).json({
      error: 'Function execution failed',
      message: error.message,
    });
  }
});

// Endpoint raíz
app.get('/', (req, res) => {
  res.json({
    message: 'CLIC Platform API Running',
    endpoints: {
      functions: 'Create .js files in /functions directory',
      example: '/health, /sync-property, etc.',
    },
  });
});

<<<<<<< HEAD
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API running on ${PORT}`);
=======
// IMPORTANTE: 0.0.0.0 para Docker/App Runner
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CLIC Platform API running on port ${PORT}`);
  console.log(`📁 Functions directory: ${FUNCTIONS_DIR}`);
>>>>>>> c59b567deafa8dac65d628394fecc4b443b5fac4
});
