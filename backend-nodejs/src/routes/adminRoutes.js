const express = require("express");
const router = express.Router();

const {
  getLogs,
  restaurarCliente,
  restaurarPdf,
  restaurarDocumentoCorporativo
} = require("../controllers/adminController");

// 1. Importa o verifyToken centralizado da pasta middlewares
const { verifyToken } = require("../middlewares/authMiddleware");

// 2. Mantém apenas o verifyAdmin aqui (porque é exclusivo das rotas de admin)
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: "Acesso restrito a administradores." });
  }
  next();
};

// Mapeamento das Rotas de Auditoria e Restauração
router.get("/admin/logs", verifyToken, verifyAdmin, getLogs);
router.post("/admin/restaurar/cliente/:log_id", verifyToken, verifyAdmin, restaurarCliente);
router.post("/admin/restaurar/pdf/:log_id", verifyToken, verifyAdmin, restaurarPdf);
router.post("/admin/restaurar/documento_corporativo/:log_id", verifyToken, verifyAdmin, restaurarDocumentoCorporativo);

module.exports = router;