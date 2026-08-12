const jwt = require('jsonwebtoken');

// 🎯 verifyToken (Verifica se o usuário está autenticado)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  // Remove aspas duplas caso venham do localStorage/JSON
  token = token.replace(/^["'](.+)["']$/, '$1');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error(`[AUTH DEBUG] 🚨 FALHA: ${err.message}`);
      return res.status(403).json({ error: "Token inválido." });
    }
    req.user = user;
    next();
  });
};

// 🎯 applyAccessFilter (Filtra para o usuário ver apenas os seus registros ou os públicos)
const applyAccessFilter = (tableName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.userId || !req.user.role) {
      return res.status(403).json({ error: "Acesso negado: Dados de autenticação internos ausentes." });
    }

    const { userId, role } = req.user;

    // Se for admin, libera tudo (vê 1 = 1)
    if (role && role.toLowerCase() === 'admin') {
      req.accessFilter = "1 = 1";
      req.accessFilterValue = null;
      return next();
    }

    // Se for usuário comum, aplica a regra de ver apenas o que é dele ou o que é público
    const filterClause = `(${tableName}.id_usuario = ? OR ${tableName}.tipo_acesso = 'publico')`;

    req.accessFilter = filterClause;
    req.accessFilterValue = userId;

    next();
  };
};

module.exports = {
  verifyToken,
  applyAccessFilter
};