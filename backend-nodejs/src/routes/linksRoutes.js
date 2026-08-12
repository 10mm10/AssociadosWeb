const express = require("express");
const router = express.Router();

const {
  gerarLink,
  verificarToken,
  completarCadastro,
  buscarLinkCadastroAtivo
} = require("../controllers/linksController");

router.post("/gerar-link", gerarLink);
router.get("/verificar-token", verificarToken);
router.post("/completar-cadastro", completarCadastro);
router.get("/link-ativo/:clienteId", buscarLinkCadastroAtivo);

module.exports = router;