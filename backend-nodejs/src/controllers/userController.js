const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require("../config/database");

// Configuração do transporter do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou o serviço/host SMTP que você utiliza
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

// 1. Rota de login
const loginHandler = async (req, res) => {
  const { nome_usuario, senha } = req.body;

  if (!nome_usuario || !senha) {
    return res
      .status(400)
      .json({ error: "Nome de usuário e senha são obrigatórios." });
  }

  const INVALID_CREDENTIALS = { error: "Nome de usuário ou senha incorretos." };

  try {
    const [rows] = await pool.execute(
      "SELECT id, role, nome_usuario, senha_hash, senha_temporaria FROM usuarios WHERE nome_usuario = ?",
      [nome_usuario]
    );

    const usuario = rows[0];

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.status(401).json(INVALID_CREDENTIALS);
    }

    const needsPasswordChange = usuario.senha_temporaria === 1;

    const token = jwt.sign(
      { userId: usuario.id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const responseData = {
      message: needsPasswordChange ? "Login bem-sucedido. Troca de senha necessária." : "Login bem-sucedido!",
      userId: usuario.id,
      role: usuario.role,
      nome: usuario.nome_usuario,
      token: token
    };

    if (needsPasswordChange) {
      responseData.needsPasswordChange = true;
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Erro na autenticação:", error);
    res.status(500).json({ error: "Erro interno do servidor durante o login." });
  }
};

// 2. Rota de adicionar usuário
const createUsuarioHandler = async (req, res) => {
  const { nome, email, senha } = req.body;
  const rolePadrao = 'user';

  try {
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const [result] = await pool.execute(
      `INSERT INTO usuarios (nome_usuario, email, senha_hash, role) VALUES (?, ?, ?, ?)`,
      [nome, email, senhaCriptografada, rolePadrao]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Usuário adicionado com sucesso.",
    });

  } catch (error) {
    console.error("DEBUG: Erro ao adicionar usuário:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao cadastrar usuário." });
  }
};

// 3. Rota de salvar token
const saveTokenHandler = async (req, res) => {
  const { id, token, token_type } = req.body;

  if (!id || !token || !token_type) {
    return res
      .status(400)
      .json({ error: "id, token e token_type são obrigatórios." });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE usuarios
       SET push_token = ?, token_type = ?
       WHERE id = ?`,
      [token, token_type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    console.log(`✅ Push token atualizado para o usuário ID: ${id}`);
    res.json({ message: "Token salvo com sucesso!", userId: id });

  } catch (error) {
    console.error("❌ Erro ao salvar token no banco de dados:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// 4. Rota de listar usuários
const getUsuariosHandler = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, nome_usuario, email, role FROM usuarios"
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno ao listar usuários." });
  }
};

// 5. Rota de atualizar senha (administrativa / forçar troca)
const updatePasswordHandler = async (req, res) => {
  const { id } = req.params;
  const { senha } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const [result] = await pool.execute(
      "UPDATE usuarios SET senha_hash = ?, senha_temporaria = 1 WHERE id = ?",
      [senhaCriptografada, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json({ message: "Senha alterada. O usuário deverá trocá-la no próximo acesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar senha." });
  }
};

// 6. Rota de excluir usuário
const deleteUsuarioHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("DEBUG: Erro ao excluir usuário:", error);
    res.status(500).json({ error: "Erro interno ao excluir usuário." });
  }
};

// 7. NOVO: Solicitar recuperação de senha (envio de senha temporária por e-mail)
const forgotPasswordHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "O email é obrigatório." });
  }

  const SUCCESS_MESSAGE = "Se o e-mail estiver cadastrado, uma nova senha será enviada.";

  try {
    const [users] = await pool.execute(
      "SELECT id, email, nome_usuario FROM usuarios WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(200).json({ message: SUCCESS_MESSAGE });
    }

    const user = users[0];
    const tempPassword = Math.random().toString(36).slice(-10);
    const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

    await pool.execute(
      "UPDATE usuarios SET senha_hash = ?, senha_temporaria = 1 WHERE id = ?",
      [tempPasswordHash, user.id]
    );

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: "Recuperação de Senha - AssociadosWeb",
      text: `Olá ${user.nome_usuario},\n\nSua nova senha provisória é: ${tempPassword}\n\nPor favor, use-a para fazer login e, em seguida, você será obrigado a criar uma nova senha.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: SUCCESS_MESSAGE });

  } catch (error) {
    console.error("🚨 Erro Crítico na recuperação de senha (DB/Nodemailer):", error);
    res.status(500).json({ error: "Erro interno do servidor. Por favor, tente novamente mais tarde." });
  }
};

// 8. NOVO: Troca de senha efetiva pelo usuário
const changePasswordHandler = async (req, res) => {
  const { username, senha } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const [result] = await pool.execute(
      "UPDATE usuarios SET senha_hash = ?, senha_temporaria = 0 WHERE nome_usuario = ?",
      [senhaHash, username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno ao trocar senha." });
  }
};

module.exports = {
  loginHandler,
  createUsuarioHandler,
  saveTokenHandler,
  getUsuariosHandler,
  updatePasswordHandler,
  deleteUsuarioHandler,
  forgotPasswordHandler,
  changePasswordHandler
};