const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const {
  gerarProcuracao,
  gerarDeclaracaoHipossuficiencia,
  listarProcuracoes,
  listarDeclaracoes,
  downloadProcuracao,
  obterUrlZapsign,
  enviarParaZapsign,
  processarWebhookZapsign,
} = require("../controllers/procuracaoController");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  token = token.replace(/^["'](.+)["']$/, "$1");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido." });
    }

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

    if (role.toLowerCase() === "admin") {
      req.accessFilter = "1 = 1";
      req.accessFilterValue = null;
      return next();
    }

    req.accessFilter =
      `(${tableName}.id_usuario = ? OR ${tableName}.tipo_acesso = 'publico')`;
    req.accessFilterValue = userId;
    next();
  };
};

router.post("/gerar-procuracao", gerarProcuracao);

router.post(
  "/gerar-declaracao-hipossuficiencia",
  gerarDeclaracaoHipossuficiencia
);

router.get(
  "/documentos/procuracao",
  verifyToken,
  applyAccessFilter("documentos_corporativos"),
  listarProcuracoes
);

router.get(
  "/documentos/declaracao",
  verifyToken,
  applyAccessFilter("documentos_corporativos"),
  listarDeclaracoes
);

router.get(
  "/download-procuracao/:nomeArquivo",
  verifyToken,
  downloadProcuracao
);

router.get("/procuracao-url/:pdfId", obterUrlZapsign);
router.post("/enviar-para-zapsign", enviarParaZapsign);
router.post("/api/zapsign-webhook", processarWebhookZapsign);

module.exports = router;
