const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const crypto = require("crypto");

// Helper interno para buscar dados do cliente
const fetchClienteData = async (clienteId) => {
  try {
    const query = `
      SELECT * FROM clientes_unificados
      WHERE id = ?;
    `;
    const [rows] = await pool.query(query, [clienteId]);
    if (rows.length > 0) {
      const cliente = {
        ...rows[0],
        tipo: rows[0].cnpj ? "juridica" : "fisica",
      };
      return cliente;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Erro ao buscar cliente:", err.message);
    throw err;
  }
};

// 1. Gerar e enviar o link de acesso
const gerarLink = async (req, res) => {
  const { clienteId } = req.body;

  if (!clienteId) {
    return res.status(400).json({
      error: "ID do cliente é obrigatório."
    });
  }

  try {
    // Busca o cliente para utilizar o nome no link
    const [clientes] = await pool.query(
      `
      SELECT id, nome, razao_social
      FROM clientes_unificados
      WHERE id = ?
      LIMIT 1
      `,
      [clienteId]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        error: "Cliente não encontrado."
      });
    }

    const cliente = clientes[0];

    // Pessoa Física usa nome.
    // Pessoa Jurídica usa razão social.
    const nomeCliente =
      cliente.nome ||
      cliente.razao_social ||
      `cliente-${clienteId}`;

    // Transforma:
    // "Moisés Pimentel" -> "moises-pimentel"
    const slug = nomeCliente
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Pequeno código aleatório para manter o link seguro
    const codigoSeguro = crypto
      .randomBytes(8)
      .toString("base64url");

    // Exemplo:
    // moises-pimentel-H7xK2nPm9Qs
    const token = `${slug}-${codigoSeguro}`;

    // Link válido por 48 horas
    const expiracao = moment()
      .add(48, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    const query = `
      UPDATE clientes_unificados
      SET token_acesso = ?, token_expiracao = ?
      WHERE id = ?
    `;

    await pool.query(query, [
      token,
      expiracao,
      clienteId
    ]);

    const frontendUrl = process.env.FRONTEND_URL;

    const linkDeAcesso =
      `${frontendUrl}/link?token=${encodeURIComponent(token)}`;

    console.log(
      `Link de acesso gerado para o cliente ${clienteId}: ${linkDeAcesso}`
    );

    res.status(200).json({
      message: "Link de acesso gerado com sucesso.",
      link: linkDeAcesso,
    });

  } catch (err) {
    console.error(
      "Erro ao gerar/salvar link de acesso:",
      err
    );

    res.status(500).json({
      error: "Erro interno do servidor ao salvar o token."
    });
  }
};

// 2. Verificar a validade do token
const verificarToken = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token não fornecido." });
  }

  try {
    const query = "SELECT * FROM clientes_unificados WHERE token_acesso = ? AND token_expiracao > NOW()";

    console.log("DEBUG: Tentando executar a query de verificação...");
    const [rows] = await pool.query(query, [token]);
    console.log("DEBUG: Query executada com sucesso!");

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Token inválido ou expirado. Por favor, solicite um novo link." });
    }

    const cliente = rows[0];

    delete cliente.token_acesso;
    delete cliente.token_expiracao;

    console.log("DEBUG: Dados do cliente recebidos e token validado:", cliente);

    res.status(200).json({
      message: "Token válido. Formulário pronto para preenchimento.",
      cliente: cliente,
    });
  } catch (err) {
    console.error("Erro completo da validação de token:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// 3. Completar cadastro
const completarCadastro = async (req, res) => {
  let connection;

  try {
    console.log("DEBUG: Requisição POST recebida.");
    console.log("DEBUG: Dados recebidos do front-end:", req.body);

    const { token, ...bodyData } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token não fornecido." });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingClientRows] = await connection.execute(
      "SELECT * FROM clientes_unificados WHERE token_acesso = ? AND token_expiracao > NOW()",
      [token]
    );

    if (existingClientRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "Token inválido ou expirado. Por favor, solicite um novo link.",
      });
    }

    const clienteId = existingClientRows[0].id;
    const tipoCliente = existingClientRows[0].tipo;

    const convertEmptyToNull = (value) => {
      if (value === undefined || value === null) return null;
      const trimmedValue = String(value).trim();
      if (trimmedValue === "") return null;
      if (trimmedValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return trimmedValue.split("T")[0];
      }
      return trimmedValue;
    };

    const updateData = {};

    if (tipoCliente === "fisica") {
      updateData.nome = convertEmptyToNull(bodyData.nome);
      updateData.cpf = convertEmptyToNull(bodyData.cpf);
      updateData.rg = convertEmptyToNull(bodyData.rg);
      updateData.nacionalidade = convertEmptyToNull(bodyData.nacionalidade);
      updateData.profissao = convertEmptyToNull(bodyData.profissao);
      updateData.ctps = convertEmptyToNull(bodyData.ctps);
      updateData.data_nascimento = convertEmptyToNull(bodyData.data_nascimento);
      updateData.teleitor = convertEmptyToNull(bodyData.teleitor);
      updateData.estado_civil = convertEmptyToNull(bodyData.estado_civil);
      updateData.conjuge = convertEmptyToNull(bodyData.conjuge);
      updateData.cpf_conjuge = convertEmptyToNull(bodyData.cpf_conjuge);
      updateData.rg_conjuge = convertEmptyToNull(bodyData.rg_conjuge);
    } else if (tipoCliente === "juridica") {
      updateData.razao_social = convertEmptyToNull(bodyData.razao_social);
      updateData.inscricao_estadual = convertEmptyToNull(bodyData.inscricao_estadual);
      updateData.cnpj = convertEmptyToNull(bodyData.cnpj);
      updateData.nome_fantasia = convertEmptyToNull(bodyData.nome_fantasia);
      updateData.representante_nome = convertEmptyToNull(bodyData.representante_nome);
      updateData.representante_cpf = convertEmptyToNull(bodyData.representante_cpf);
      updateData.representante_cargo = convertEmptyToNull(bodyData.representante_cargo);
      updateData.representante_celular = convertEmptyToNull(bodyData.representante_celular);
      updateData.representante_email = convertEmptyToNull(bodyData.representante_email);
      updateData.representante_nacionalidade = convertEmptyToNull(bodyData.representante_nacionalidade);
      updateData.representante_profissao = convertEmptyToNull(bodyData.representante_profissao);
      updateData.representante_rg = convertEmptyToNull(bodyData.representante_rg);
      updateData.representante_estado_civil = convertEmptyToNull(bodyData.representante_estado_civil);
    }

    updateData.cep = convertEmptyToNull(bodyData.cep);
    updateData.endereco = convertEmptyToNull(bodyData.endereco);
    updateData.numero = convertEmptyToNull(bodyData.numero);
    updateData.bairro = convertEmptyToNull(bodyData.bairro);
    updateData.cidade = convertEmptyToNull(bodyData.cidade);
    updateData.estado = convertEmptyToNull(bodyData.estado);
    updateData.telefone = convertEmptyToNull(bodyData.telefone);
    updateData.celular = convertEmptyToNull(bodyData.celular);
    updateData.email = convertEmptyToNull(bodyData.email);
    updateData.aceite_dados = bodyData.aceite ? 1 : 0;
    updateData.data_aceite = new Date();

    const fields = Object.keys(updateData).filter(
      (key) => updateData[key] !== undefined
    );
    const values = fields.map((key) => updateData[key]);
    const setClauses = fields.map((field) => `${field} = ?`).join(", ");

    const sqlCliente = `UPDATE clientes_unificados SET ${setClauses}, token_acesso = NULL, token_expiracao = NULL WHERE id = ?`;
    values.push(clienteId);

    await connection.execute(sqlCliente, values);
    await connection.commit();

    res.status(200).json({ message: "Cadastro finalizado e atualizado com sucesso!" });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`DEBUG: Erro ao finalizar cadastro:`, error);

    if (error.code) {
      switch (error.code) {
        case "ER_TRUNCATED_WRONG_VALUE":
          return res.status(400).json({ error: "Campos com formato incorreto." });
        case "ER_DUP_ENTRY":
          return res.status(409).json({ error: "CPF/CNPJ ou Email já cadastrado." });
        default:
          return res.status(500).json({ error: `Erro de banco de dados: ${error.sqlMessage || error.message}` });
      }
    }
    return res.status(500).json({ error: "Erro inesperado no servidor." });
  } finally {
    if (connection) connection.release();
  }
};

const buscarLinkCadastroAtivo = async (req, res) => {
  const { clienteId } = req.params;

  if (!clienteId) {
    return res.status(400).json({
      error: "ID do cliente é obrigatório."
    });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT token_acesso, token_expiracao
      FROM clientes_unificados
      WHERE id = ?
        AND token_acesso IS NOT NULL
        AND token_expiracao > NOW()
      LIMIT 1
      `,
      [clienteId]
    );
    

    if (rows.length === 0) {
      return res.status(200).json({
        ativo: false,
        link: null
      });
    }

    const frontendUrl = process.env.FRONTEND_URL;

    const linkDeAcesso =
      `${frontendUrl}/link?token=${encodeURIComponent(rows[0].token_acesso)}`;

    return res.status(200).json({
      ativo: true,
      link: linkDeAcesso,
      expiracao: rows[0].token_expiracao
    });

  } catch (err) {
    console.error("Erro ao buscar link ativo:", err);

    return res.status(500).json({
      error: "Erro interno do servidor."
    });
  }
};

module.exports = {
  gerarLink,
  verificarToken,
  completarCadastro,
  fetchClienteData,
  buscarLinkCadastroAtivo
};