const LOG_RETENTION_DAYS = 30;

/**
 * Executa a query de exclusão no MySQL para remover logs de auditoria
 * mais antigos que o limite definido.
 * @param {object} pool - A pool de conexão do mysql2.
 */
async function cleanAuditLogs(pool) {
    if (!pool) {
        console.error("[Cleaner] Erro: Pool de conexão não fornecida.");
        return;
    }

    try {
        console.log(`[Cleaner] Iniciando limpeza de logs mais antigos que ${LOG_RETENTION_DAYS} dias...`);

        // A função DATE_SUB do MySQL calcula uma data subtraindo um intervalo de tempo.
        const query = `
            DELETE FROM logs_auditoria
            WHERE data_hora < DATE_SUB(NOW(), INTERVAL ? DAY);
        `;

        // Executa a query usando a pool. O '?' é preenchido com a variável LOG_RETENTION_DAYS.
        // O método .execute() é recomendado pelo mysql2 para queries preparadas.
        const [result] = await pool.execute(query, [LOG_RETENTION_DAYS]);

        // Verifica quantos registros foram afetados (excluídos)
        console.log(`[Cleaner] Sucesso! ${result.affectedRows} registro(s) excluído(s).`);
        
    } catch (error) {
        console.error("[Cleaner] 🔴 Erro ao limpar logs de auditoria:", error);
    }
}

module.exports = { cleanAuditLogs };