if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const path = require("path");
const express = require("express");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 5000;

const pool = require("./src/config/database");
const s3Client = require("./src/config/s3Client");
const corsMiddleware = require("./src/config/corsConfig");
const { iniciarCronJobs } = require("./src/jobs/cronJobs");

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Usar o CORS configurado
app.use(corsMiddleware);

// Logs das requisições
app.use((req, res, next) => {
    console.log("🔥 ORIGIN:", req.headers.origin);
    console.log("🔥 ROTA:", req.method, req.url);
    next();
});

// Middlewares Padrão do Express
app.use(express.json({ limit: "50mb" }));

app.use(
    express.urlencoded({
        limit: "100mb",
        extended: true
    })
);

// Liberação das Imagens (Disco Local)
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// Iniciar os Cron Jobs
iniciarCronJobs(s3Client);

// =========================
// ROTAS DA APLICAÇÃO
// =========================

const userRoutes = require("./src/routes/userRoutes");
app.use("/", userRoutes);

const clientRoutes = require("./src/routes/clientRoutes");
app.use("/", clientRoutes);

const documentoRoutes = require("./src/routes/documentoRoutes");
app.use("/", documentoRoutes);

const blogRoutes = require("./src/routes/blogRoutes");
app.use("/", blogRoutes);

const adminRoutes = require("./src/routes/adminRoutes");
app.use("/", adminRoutes);

const linksRoutes = require("./src/routes/linksRoutes");
app.use("/", linksRoutes);

const procuracaoRoutes = require("./src/routes/procuracaoRoutes");
app.use("/", procuracaoRoutes);

// =========================
// TRATAMENTO GLOBAL DE ERROS
// =========================

app.use((err, req, res, next) => {
    // Erro específico de CORS
    if (err.message === "Origem não permitida pelo CORS") {
        console.log(
            "🚫 Requisição bloqueada pelo CORS:",
            req.headers.origin
        );

        return res.status(403).json({
            error: "Origem não permitida."
        });
    }

    // Outros erros
    console.error("❌ Erro interno:", err);

    return res.status(500).json({
        error: "Erro interno do servidor."
    });
});

// =========================
// INÍCIO DO SERVIDOR
// =========================

app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Servidor rodando na porta ${PORT}`);

    try {
        await pool.query("SELECT 1");

        console.log("✅ Conexão com MySQL OK");
    } catch (error) {
        console.error(
            "❌ Falha na conexão inicial com o banco de dados:",
            error.message
        );
    }
});