const cors = require("cors");

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://assessoria-interagir.com.br",
    "https://www.assessoria-interagir.com.br",
    "https://api.assessoria-interagir.com.br"
];

const corsOptions = {
    origin: function (origin, callback) {

        // Permite requisições sem Origin
        if (!origin) {
            return callback(null, true);
        }

        // Permite domínios cadastrados e previews da Vercel
        if (
            allowedOrigins.includes(origin) ||
            (origin.startsWith("https://") && origin.endsWith(".vercel.app"))
        ) {
            return callback(null, true);
        }

        console.log("🚫 CORS bloqueado:", origin);

        return callback(
            new Error("Origem não permitida pelo CORS")
        );
    },

    credentials: true,

    methods: [
        "GET",
        "HEAD",
        "PUT",
        "PATCH",
        "POST",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]
};

module.exports = cors(corsOptions);