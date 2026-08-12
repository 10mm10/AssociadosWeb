const pool = require("../config/database");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

// Função robusta para formatação de datas compatível com MySQL/AWS
const fixDataForMySQL = (obj) => {
  const cleaned = { ...obj };
  for (const key in cleaned) {
    const val = cleaned[key];
    if (val && (typeof val === 'string' && val.includes('T') && val.endsWith('Z'))) {
      cleaned[key] = val.split('T')[0] + ' ' + val.split('T')[1].split('.')[0];
    } else if (val instanceof Date) {
      cleaned[key] = val.toISOString().slice(0, 19).replace('T', ' ');
    }
  }
  return cleaned;
};

// --- GET: LISTAR LOGS DE AUDITORIA ---
const getLogs = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const sqlQuery = `
      SELECT 
          l.*, 
          l.nome_arquivo, 
          u.nome_usuario AS nome_usuario 
      FROM 
          logs_auditoria l
      JOIN 
          usuarios u ON l.usuario_id = u.id
      ORDER BY 
          l.data_hora DESC 
      LIMIT 100
    `;

    const [logs] = await connection.execute(sqlQuery.trim());
    res.status(200).json(logs);

  } catch (error) {
    console.error("DEBUG: Erro ao buscar logs de auditoria:", error);
    res.status(500).json({
      error: `Erro ao carregar logs: ${error.message}`,
    });
  } finally {
    if (connection) connection.release();
  }
};

// --- POST: RESTAURAR CLIENTE (EM CASCATA COM PDFs) ---
const restaurarCliente = async (req, res) => {
  const logId = req.params.log_id;
  let connection = null;
  let pdfsRestauradosBD = 0;
  const pdfLogsParaLimpeza = [];

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [logRows] = await connection.execute(
      "SELECT * FROM logs_auditoria WHERE id = ? AND tabela_afetada = 'clientes_unificados'",
      [logId]
    );

    if (logRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Log não encontrado." });
    }

    const logEntry = logRows[0];
    const clienteIdOriginal = logEntry.registro_id;
    let dadosClienteRaw = typeof logEntry.dados_antigos === 'string' ? JSON.parse(logEntry.dados_antigos) : logEntry.dados_antigos;
    const dadosCliente = fixDataForMySQL(dadosClienteRaw);

    const colunasCli = Object.keys(dadosCliente).join(', ');
    const valuesCli = Object.values(dadosCliente);
    const placeholdersCli = valuesCli.map(() => '?').join(', ');

    await connection.execute(`INSERT INTO clientes_unificados (${colunasCli}) VALUES (${placeholdersCli})`, valuesCli);

    const [pdfLogs] = await connection.execute(
      "SELECT id, registro_id, dados_antigos FROM logs_auditoria WHERE tabela_afetada = 'pdfs_unificados' AND tipo_acao = 'EXCLUSAO' AND status_restauracao = 'ORIGINAL'"
    );

    for (const pdfLog of pdfLogs) {
      let pdfDataRaw = typeof pdfLog.dados_antigos === 'string' ? JSON.parse(pdfLog.dados_antigos) : pdfLog.dados_antigos;

      if (pdfDataRaw && pdfDataRaw.cliente_id && String(pdfDataRaw.cliente_id) === String(clienteIdOriginal)) {
        try {
          const pdfData = fixDataForMySQL(pdfDataRaw);
          const colunasPdf = Object.keys(pdfData).join(', ');
          const valuesPdf = Object.values(pdfData);
          const placeholdersPdf = valuesPdf.map(() => '?').join(', ');

          await connection.execute(`INSERT INTO pdfs_unificados (${colunasPdf}) VALUES (${placeholdersPdf})`, valuesPdf);
          pdfLogsParaLimpeza.push(pdfLog.id);
          pdfsRestauradosBD++;
        } catch (pdfErr) {
          console.error(`Erro ao restaurar PDF ID ${pdfLog.id}:`, pdfErr.message);
        }
      }
    }

    await connection.execute("DELETE FROM logs_auditoria WHERE id = ?", [logId]);
    if (pdfLogsParaLimpeza.length > 0) {
      const placeholdersClean = pdfLogsParaLimpeza.map(() => '?').join(',');
      await connection.execute(`DELETE FROM logs_auditoria WHERE id IN (${placeholdersClean})`, pdfLogsParaLimpeza);
    }

    await connection.commit();
    res.status(200).json({ message: "Restauração completa realizada com sucesso na AWS." });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("ERRO NA AWS:", error.message);
    res.status(500).json({ error: "Falha na AWS: " + error.message });
  } finally {
    if (connection) connection.release();
  }
};

// --- POST: RESTAURAR PDF ---
const restaurarPdf = async (req, res) => {
  const logId = req.params.log_id;
  let connection;
  const nomeTabela = 'pdfs_unificados';
  let pdfIdOriginal = null;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [logs] = await connection.execute(
      "SELECT dados_antigos, tabela_afetada, registro_id FROM logs_auditoria WHERE id = ?",
      [logId]
    );

    if (logs.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Registro de log não encontrado." });
    }

    const logEntry = logs[0];
    pdfIdOriginal = logEntry.registro_id;

    let dadosAntigos = logEntry.dados_antigos;
    if (typeof dadosAntigos === 'string') {
      dadosAntigos = JSON.parse(dadosAntigos);
    }

    if (!dadosAntigos || typeof dadosAntigos !== 'object') {
      await connection.rollback();
      return res.status(400).json({ error: "Dados do log corrompidos." });
    }

    delete dadosAntigos.id;
    dadosAntigos.id = pdfIdOriginal;

    if (dadosAntigos.data_upload) {
      dadosAntigos.data_upload = new Date(dadosAntigos.data_upload).toISOString().slice(0, 19).replace('T', ' ');
    }

    const colunas = Object.keys(dadosAntigos).join(', ');
    const placeholders = Object.keys(dadosAntigos).map(() => '?').join(', ');
    const valores = Object.values(dadosAntigos);

    const sqlInsert = `INSERT INTO ${nomeTabela} (${colunas}) VALUES (${placeholders})`;
    await connection.execute(sqlInsert, valores);
    await connection.execute("DELETE FROM logs_auditoria WHERE id = ?", [logId]);
    await connection.commit();

    res.status(200).json({ message: "PDF restaurado no banco de dados com sucesso!" });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erro Crítico no Restore:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// --- POST: RESTAURAR DOCUMENTO CORPORATIVO ---
const restaurarDocumentoCorporativo = async (req, res) => {
  const logId = req.params.log_id;
  let connection;
  const nomeTabela = 'documentos_corporativos';

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [logRows] = await connection.execute(
      "SELECT * FROM logs_auditoria WHERE id = ? AND tabela_afetada = ? AND status_restauracao = 'ORIGINAL'",
      [logId, nomeTabela]
    );

    if (logRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Log não encontrado ou já restaurado." });
    }

    const logEntry = logRows[0];
    const documentoIdOriginal = logEntry.registro_id;
    let dadosRaw = typeof logEntry.dados_antigos === 'string' ? JSON.parse(logEntry.dados_antigos) : logEntry.dados_antigos;

    const [checkRows] = await connection.execute(`SELECT id FROM ${nomeTabela} WHERE id = ?`, [documentoIdOriginal]);
    if (checkRows.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: `Documento ID ${documentoIdOriginal} já existe.` });
    }

    const dadosRestaurarDoc = fixDataForMySQL(dadosRaw);

    const colunas = Object.keys(dadosRestaurarDoc).join(', ');
    const placeholders = Object.keys(dadosRestaurarDoc).map(() => '?').join(', ');
    const valores = Object.values(dadosRestaurarDoc);

    await connection.execute(`INSERT INTO ${nomeTabela} (${colunas}) VALUES (${placeholders})`, valores);
    await connection.execute("UPDATE logs_auditoria SET status_restauracao = 'RESTAURADO' WHERE id = ?", [logId]);

    await connection.commit();

    res.status(200).json({
      message: `Documento Corporativo ID ${documentoIdOriginal} restaurado com sucesso.`,
      restoredId: documentoIdOriginal
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erro na restauração AWS:", error.message);
    res.status(500).json({ error: "Falha na restauração AWS: " + error.message });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getLogs,
  restaurarCliente,
  restaurarPdf,
  restaurarDocumentoCorporativo
};