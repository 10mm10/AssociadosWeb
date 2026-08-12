const pool = require("../config/database");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const fs = require("fs");
const fsp = require("fs").promises;

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const gerarCaminhoS3 = (pastaOriginal, nomeArquivo) => {
  const prefixoAmbiente = process.env.AWS_S3_FOLDER ? `${process.env.AWS_S3_FOLDER}/` : "";
  return `${prefixoAmbiente}${pastaOriginal}/${nomeArquivo}`;
};

// --- POST: UPLOAD DE DOCUMENTO CORPORATIVO ---
const uploadDocumento = async (req, res) => {
  let connection;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const pdfFile = req.file;
    const originalFilename = pdfFile.originalname;

    const bucketName = process.env.AWS_BUCKET_NAME;
    const nomeLimpo = originalFilename.replace(/\s+/g, "_");
    const nomeComTimestamp = `${Date.now()}_${nomeLimpo}`;

    const s3Key = gerarCaminhoS3("corporativo", nomeComTimestamp);

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: pdfFile.buffer,
      ContentType: pdfFile.mimetype || "application/pdf",
    }));

    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const mimeType = pdfFile.mimetype || "application/octet-stream";
    const fileSize = pdfFile.size;
    const descricao = req.body.descricao?.trim() || null;
    const usuarioUpload = req.body.usuario_upload?.trim() || "Sistema";
    const idUsuario = req.body.id_usuario?.trim() || null;
    const tipoAcesso = req.body.tipo_acesso?.trim() || "privado";

    const sql = `
      INSERT INTO documentos_corporativos
      (nome_original, caminho_arquivo, tipo_mime, tamanho_bytes, data_upload, descricao, usuario_upload, id_usuario, tipo_acesso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      originalFilename,
      s3Url,
      mimeType,
      fileSize,
      new Date(),
      descricao,
      usuarioUpload,
      idUsuario,
      tipoAcesso,
    ];

    await connection.execute(sql, values);
    await connection.commit();

    res.status(201).json({
      message: "Documento corporativo adicionado com sucesso!",
      url: s3Url,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("DEBUG: Erro ao adicionar documento corporativo:", error);
    res.status(500).json({ error: "Erro inesperado no servidor: " + error.message });
  } finally {
    if (connection) connection.release();
  }
};

// --- GET: LISTAR DOCUMENTOS CORPORATIVOS ---
const getDocumentos = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const filterClause = req.accessFilter;
    const filterValue = req.accessFilterValue;

    const sqlQuery = `
      SELECT
        id,
        nome_original,
        caminho_arquivo,
        tipo_mime,
        tamanho_bytes,
        DATE_FORMAT(data_upload, '%d/%m/%Y %H:%i:%s') AS data_upload,
        descricao,
        usuario_upload,
        tipo_acesso
      FROM documentos_corporativos
      WHERE ${filterClause}
      ORDER BY data_upload DESC
    `;

    const [rows] = await connection.execute(sqlQuery, [filterValue]);

    const docs = rows.map((row) => {
      let urlFinal = "";
      const caminhoRaw = row.caminho_arquivo || "";

      if (caminhoRaw.startsWith("http")) {
        urlFinal = caminhoRaw;
      } else {
        urlFinal = `${caminhoRaw}`;
      }

      return {
        ...row,
        url: urlFinal,
      };
    });

    res.json(docs);
  } catch (error) {
    console.error("DEBUG: Erro na rota /documentos_corporativos:", error);
    res.status(500).json({
      error: "Erro ao buscar documentos corporativos: " + error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

// --- DELETE: EXCLUIR DOCUMENTOS CORPORATIVOS ---
const deleteDocumentos = async (req, res) => {
  const { document_ids, userId } = req.body;
  let connection;
  const nomeTabela = 'documentos_corporativos';

  if (!Array.isArray(document_ids) || document_ids.length === 0) {
    return res.status(400).json({ error: "IDs ausentes." });
  }

  const idsString = document_ids.map(id => Number(id)).join(',');

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [users] = await connection.execute(
      'SELECT role FROM usuarios WHERE id = ?',
      [userId]
    );
    const userRole = users[0]?.role?.toLowerCase();
    const isAdmin = userRole === 'admin';

    const [rows] = await connection.execute(
      `SELECT * FROM documentos_corporativos WHERE id IN (${idsString})`
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Documentos não encontrados." });
    }

    if (!isAdmin) {
      const unauthorized = rows.filter(doc => String(doc.id_usuario) !== String(userId));
      if (unauthorized.length > 0) {
        await connection.rollback();
        return res.status(403).json({ error: "Acesso negado a um ou mais itens." });
      }
    }

    for (const docData of rows) {
      const caminho = docData.caminho_arquivo || "";

      if (!caminho.startsWith("http")) {
        const newName = `${docData.id}_${caminho}`;
        try {
          if (fs.existsSync(oldPath)) {
            await fsp.rename(oldPath, newName);
          }
        } catch (err) {
          console.warn(`Aviso: Arquivo local ${docData.id} não pôde ser movido:`, err.message);
        }
      }

      await connection.execute(
        'INSERT INTO logs_auditoria (usuario_id, tipo_acao, tabela_afetada, registro_id, dados_antigos, status_restauracao, nome_arquivo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          'EXCLUSAO',
          nomeTabela,
          docData.id,
          JSON.stringify(docData),
          'ORIGINAL',
          docData.nome_original ?? null
        ]
      );
    }

    await connection.execute(`DELETE FROM documentos_corporativos WHERE id IN (${idsString})`);

    await connection.commit();
    res.status(200).json({
      message: "Documentos movidos para auditoria com sucesso. O arquivo físico será removido na limpeza programada."
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("ERRO NO DELETE:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  uploadDocumento,
  getDocumentos,
  deleteDocumentos
};