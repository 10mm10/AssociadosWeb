const express = require("express");
const router = express.Router();

const {
  marcarLidas,
  listarNotificacoes
} = require("../controllers/notificacaoController");

// Rotas de Notificações do App
router.post("/api/notificacoes/marcar-lidas", marcarLidas);
router.get("/api/notificacoes/lista", listarNotificacoes);

module.exports = router;