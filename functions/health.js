module.exports = async (req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    timestamp: new Date().toISOString()
  });
};
