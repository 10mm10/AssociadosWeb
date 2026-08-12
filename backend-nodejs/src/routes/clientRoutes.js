const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const {
  postCliente,
  getClientes,
  getClientePdfs,
  updateCliente,
  deleteCliente,
  abrirPdf,
  deletePdf,
  renomearPdf
} = require("../controllers/clientController");

// Middleware de verificação de token e filtros
const verifyToken = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token não fornecido." });
  token = token.replace(/^["'](.+)["']$/, '$1');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.user = user;
    next();
  });
};

const applyAccessFilter = (tableName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.userId || !req.user.role) {
      return res.status(403).json({ error: "Acesso negado." });
    }
    const { userId, role } = req.user;
    if (role.toLowerCase() === 'admin') {
      req.accessFilter = "1 = 1";
      req.accessFilterValue = null;
      return next();
    }
    req.accessFilter = `(${tableName}.id_usuario = ? OR ${tableName}.tipo_acesso = 'publico')`;
    req.accessFilterValue = userId;
    next();
  };
};

// --- TODAS AS ROTAS DE CLIENTES E PDFS ---
router.post("/clientes", verifyToken, upload.single("pdf_file"), postCliente);
router.get("/clientes", verifyToken, applyAccessFilter("clientes_unificados"), getClientes);
router.get("/clientes/:cliente_id/pdfs", verifyToken, applyAccessFilter("pdfs_unificados"), getClientePdfs);
router.put("/clientes/:cliente_id", upload.single("pdf_file"), updateCliente);
router.delete("/clientes/:clienteId", verifyToken, applyAccessFilter('clientes_unificados'), deleteCliente);

// Rotas de PDFs integradas
router.get("/abrir-pdf/:id", verifyToken, abrirPdf);
router.delete("/pdfs/:pdf_id", verifyToken, applyAccessFilter('pdfs_unificados'), deletePdf);
router.put("/renomear-pdf/:id", renomearPdf);

module.exports = router;