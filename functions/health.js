module.exports = async (req, res) => {
  res.json({
    ok: true,
    health: "excellent",
    time: new Date().toISOString()
  });
};