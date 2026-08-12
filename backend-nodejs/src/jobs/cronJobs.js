const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

const pool = require("../config/database");

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const DIAS_RETENCAO = 30;
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "interagir";

// Prefixo utilizado somente pelos testes locais.
// A faxina de produção nunca removerá objetos desse prefixo.
const PREFIXO_TESTES = "interagir-testes/";


// =====================================================
// FUNÇÃO PRINCIPAL DE FAXINA
// =====================================================

async function executarFaxinaLogs(s3Client) {
    console.log(
        `🧹 [SISTEMA] Iniciando faxina definitiva (Tolerância: ${DIAS_RETENCAO} dias)...`
    );

    let connection;

    try {
        connection = await pool.getConnection();

        // =====================================================
        // 1. LOGS DE PDFs EXCLUÍDOS
        // =====================================================

        const [logsPdfs] = await connection.execute(
            `
            SELECT
                id,
                registro_id,
                nome_arquivo,
                dados_antigos,
                data_hora
            FROM logs_auditoria
            WHERE tabela_afetada = 'pdfs_unificados'
              AND tipo_acao = 'EXCLUSAO'
            `
        );

        const agora = Date.now();

        const prazoDefinitivo =
            agora - DIAS_RETENCAO * 24 * 60 * 60 * 1000;

        for (const log of logsPdfs) {
            try {
                // Ainda não completou os 30 dias.
                const dataLog = new Date(log.data_hora).getTime();

                if (
                    Number.isNaN(dataLog) ||
                    dataLog >= prazoDefinitivo
                ) {
                    continue;
                }

                // Converte os dados antigos se necessário.
                let pdfData = {};

                if (log.dados_antigos) {
                    pdfData =
                        typeof log.dados_antigos === "string"
                            ? JSON.parse(log.dados_antigos)
                            : log.dados_antigos;
                }

                /*
                 * IMPORTANTE:
                 *
                 * Não apagamos mais o log simplesmente porque
                 * o cliente continua ativo.
                 *
                 * O log permanece durante os 30 dias de retenção.
                 */

                if (!log.nome_arquivo) {
                    console.log(
                        `⚠️ Log ${log.id} não possui nome/caminho de arquivo.`
                    );

                    /*
                     * Como já passou do prazo, podemos remover
                     * somente o registro de auditoria.
                     */
                    await connection.execute(
                        `DELETE FROM logs_auditoria WHERE id = ?`,
                        [log.id]
                    );

                    continue;
                }


                // =====================================================
                // 2. DESCOBRIR A KEY DO S3
                // =====================================================

                let fullKey = null;

                /*
                 * Caso nome_arquivo seja uma URL completa:
                 *
                 * https://bucket.s3.sa-east-1.amazonaws.com/pasta/arquivo.pdf
                 */
                if (
                    log.nome_arquivo.startsWith("http://") ||
                    log.nome_arquivo.startsWith("https://")
                ) {
                    try {
                        const urlArquivo =
                            new URL(log.nome_arquivo);

                        fullKey = decodeURIComponent(
                            urlArquivo.pathname.replace(/^\/+/, "")
                        );
                    } catch (urlError) {
                        console.error(
                            `🚨 URL inválida no log ${log.id}:`,
                            log.nome_arquivo
                        );
                    }
                } else {
                    /*
                     * Caso o banco já tenha somente a key:
                     *
                     * clientes/123/arquivo.pdf
                     */
                    fullKey = log.nome_arquivo.replace(/^\/+/, "");
                }


                if (!fullKey) {
                    console.log(
                        `⚠️ Não foi possível determinar a key S3 do log ${log.id}.`
                    );

                    continue;
                }


                // =====================================================
                // 3. PROTEÇÃO DO AMBIENTE DE TESTES
                // =====================================================

                if (fullKey.startsWith(PREFIXO_TESTES)) {
                    console.log(
                        `🧪 Ignorado arquivo de testes: ${fullKey}`
                    );

                    continue;
                }


                // =====================================================
                // 4. EXCLUSÃO DEFINITIVA DO S3
                // =====================================================

                await s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: fullKey
                    })
                );

                console.log(
                    `🗑️ S3 REMOVIDO DEFINITIVO: ${fullKey}`
                );


                // Depois da exclusão definitiva, remove o log.
                await connection.execute(
                    `DELETE FROM logs_auditoria WHERE id = ?`,
                    [log.id]
                );

                console.log(
                    `🧹 Log de auditoria ${log.id} removido definitivamente.`
                );

            } catch (errLoop) {
                console.error(
                    `🚨 Erro ao processar log ${log.id}:`,
                    errLoop.message
                );

                continue;
            }
        }


        // =====================================================
        // 5. LOGS DE CLIENTES EXCLUÍDOS
        // =====================================================

        const [resultadoClientes] =
            await connection.execute(
                `
                DELETE FROM logs_auditoria
                WHERE tabela_afetada = 'clientes_unificados'
                  AND data_hora < (
                      NOW() - INTERVAL ${DIAS_RETENCAO} DAY
                  )
                `
            );

        if (resultadoClientes.affectedRows > 0) {
            console.log(
                `🧹 ${resultadoClientes.affectedRows} log(s) antigo(s) de clientes removido(s).`
            );
        }


        // =====================================================
        // 6. ARQUIVOS LOCAIS ANTIGOS
        // =====================================================

        console.log(
            `📂 [SISTEMA] Verificando arquivos locais com mais de ${DIAS_RETENCAO} dias...`
        );

        const pastasParaLimpar = [
            path.join(__dirname, "../../uploads"),
            path.join(__dirname, "../../procuracoes")
        ];

        const trintaDiasEmMs =
            DIAS_RETENCAO * 24 * 60 * 60 * 1000;

        const agoraLocal = Date.now();

        for (const pasta of pastasParaLimpar) {
            try {
                if (!fs.existsSync(pasta)) {
                    continue;
                }

                const arquivos = fs.readdirSync(pasta);

                for (const arquivo of arquivos) {
                    const caminhoCompleto =
                        path.join(pasta, arquivo);

                    try {
                        const stats =
                            fs.statSync(caminhoCompleto);

                        /*
                         * Segurança:
                         * remove somente arquivos.
                         * Não remove subpastas.
                         */
                        if (!stats.isFile()) {
                            continue;
                        }

                        const idadeArquivo =
                            agoraLocal - stats.mtimeMs;

                        if (idadeArquivo > trintaDiasEmMs) {
                            fs.unlinkSync(caminhoCompleto);

                            console.log(
                                `🗑️ ARQUIVO LOCAL REMOVIDO: ${arquivo} (${pasta})`
                            );
                        }

                    } catch (errArquivo) {
                        console.error(
                            `🚨 Erro ao processar arquivo local ${arquivo}:`,
                            errArquivo.message
                        );
                    }
                }

            } catch (errPasta) {
                console.error(
                    `🚨 Erro ao processar pasta ${pasta}:`,
                    errPasta.message
                );
            }
        }


        console.log(
            "✅ Faxina completa (Banco + S3 + Disco Local) concluída."
        );

    } catch (error) {
        console.error(
            "🚨 Erro geral na Cron:",
            error.message
        );

    } finally {
        if (connection) {
            connection.release();
        }
    }
}


// =====================================================
// AGENDAMENTO
// =====================================================

function iniciarCronJobs(s3Client) {
    cron.schedule(
        "0 22 * * *",

        async () => {
            console.log(
                "⏰ [CRON] Horário atingido (22:00 - São Paulo). Iniciando faxina diária..."
            );

            await executarFaxinaLogs(s3Client);
        },

        {
            timezone: "America/Sao_Paulo",

            // Impede uma nova execução caso a anterior
            // ainda não tenha terminado.
            noOverlap: true
        }
    );

    console.log(
        "⏰ Cron de faxina configurada para 22:00 - America/Sao_Paulo."
    );
}


module.exports = {
    iniciarCronJobs
};