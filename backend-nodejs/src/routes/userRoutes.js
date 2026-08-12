const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  loginHandler,
  createUsuarioHandler,
  saveTokenHandler,
  getUsuariosHandler,
  updatePasswordHandler,
  deleteUsuarioHandler,
  forgotPasswordHandler,
  changePasswordHandler
} = require("../controllers/userController");

// Limiter de login original
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: "Muitas tentativas de login a partir deste IP. Tente novamente em 5 minutos." }
});

router.post("/login", loginLimiter, loginHandler);
router.post("/usuarios", createUsuarioHandler);
router.post("/save-token", saveTokenHandler);
router.get("/usuarios", getUsuariosHandler);
router.put("/usuarios/:id/senha", updatePasswordHandler);
router.delete("/usuarios/:id", deleteUsuarioHandler);
// Novas rotas de senha
router.post("/forgot-password", forgotPasswordHandler);
router.post("/change-password", changePasswordHandler);

module.exports = router;