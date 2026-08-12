const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const {
  uploadDocumento,
  getDocumentos,
  deleteDocumentos
} = require("../controllers/documentoController");

// Middlewares de segurança repetidos para autonomia do módulo (ou centralizados)
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

router.post("/documentos_corporativos/upload", verifyToken, upload.single("documento"), uploadDocumento);
router.get("/documentos_corporativos", verifyToken, applyAccessFilter("documentos_corporativos"), getDocumentos);
router.delete("/documentos_corporativos/delete", verifyToken, deleteDocumentos);

module.exports = router;