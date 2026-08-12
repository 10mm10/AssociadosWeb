const pool = require("../config/database");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client } = require("@aws-sdk/client-s3");
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

// --- ROTA POST: CADASTRAR CLIENTE (INTEGRADA E CORRIGIDA) ---
const postCliente = async (req, res) => {
  let connection = null;
  try {
    const parsedIdUsuario = req.user.userId;
    const { tipoCliente, id_usuario, ...restOfBody } = req.body;
    const clienteBody = { ...restOfBody };

    console.log(`[CLIENTE POST S3] Iniciando transação para novo cliente por User ID (JWT): ${parsedIdUsuario}`);

    // Validações Iniciais
    if (isNaN(parsedIdUsuario) || parsedIdUsuario <= 0) {
      return res.status(401).json({ error: "ID do usuário logado é obrigatório." });
    }

    if (!tipoCliente || (tipoCliente !== "fisica" && tipoCliente !== "juridica")) {
      return res.status(400).json({ error: "Tipo de cliente inválido ou ausente." });
    }

    // 1. Mapeamento de campos (Garante que valores vazios virem NULL e não undefined)
    let clienteData = {
      tipo: tipoCliente,
      tipo_acesso: clienteBody.tipo_acesso?.trim() || 'publico',
      id_usuario: parsedIdUsuario,
      endereco: clienteBody.endereco?.trim() || null,
      numero: clienteBody.numero?.trim() || null,
      cep: clienteBody.cep?.trim() || null,
      bairro: clienteBody.bairro?.trim() || null,
      cidade: clienteBody.cidade?.trim() || null,
      estado: clienteBody.estado?.trim() || null,
      telefone: clienteBody.telefone?.trim() || null,
      celular: clienteBody.celular?.trim() || null,
      email: clienteBody.email?.trim() || null,
      status: clienteBody.status?.trim() || 'Ativo',
      // Campos Pessoa Física
      nome: tipoCliente === "fisica" ? (clienteBody.nome?.trim() || null) : null,
      cpf: tipoCliente === "fisica" ? (clienteBody.cpf?.trim() || null) : null,
      rg: tipoCliente === "fisica" ? (clienteBody.rg?.trim() || null) : null,
      data_nascimento: tipoCliente === "fisica" ? (clienteBody.data_nascimento || null) : null,
      nacionalidade: tipoCliente === "fisica" ? (clienteBody.nacionalidade?.trim() || null) : null,
      profissao: tipoCliente === "fisica" ? (clienteBody.profissao?.trim() || null) : null,
      ctps: tipoCliente === "fisica" ? (clienteBody.ctps?.trim() || null) : null,
      teleitor: tipoCliente === "fisica" ? (clienteBody.teleitor?.trim() || null) : null,
      estado_civil: tipoCliente === "fisica" ? (clienteBody.estado_civil?.trim() || null) : null,
      // Campos Pessoa Jurídica
      razao_social: tipoCliente === "juridica" ? (clienteBody.razao_social || clienteBody.razaoSocial || null)?.trim() : null,
      cnpj: tipoCliente === "juridica" ? (clienteBody.cnpj?.trim() || null) : null,
      inscricao_estadual: tipoCliente === "juridica" ? (clienteBody.inscricao_estadual?.trim() || null) : null,
      nome_fantasia: tipoCliente === "juridica" ? (clienteBody.nome_fantasia?.trim() || null) : null,
      representante_nome: tipoCliente === "juridica" ? (clienteBody.representante_nome?.trim() || null) : null,
      representante_cpf: tipoCliente === "juridica" ? (clienteBody.representante_cpf?.trim() || null) : null,
      representante_cargo: tipoCliente === "juridica" ? (clienteBody.representante_cargo?.trim() || null) : null,
      representante_celular: tipoCliente === "juridica" ? (clienteBody.representante_celular?.trim() || null) : null,
      representante_email: tipoCliente === "juridica" ? (clienteBody.representante_email?.trim() || null) : null,
      representante_nacionalidade: tipoCliente === "juridica" ? (clienteBody.representante_nacionalidade?.trim() || null) : null,
      representante_estado_civil: tipoCliente === "juridica" ? (clienteBody.representante_estado_civil?.trim() || null) : null,
      representante_profissao: tipoCliente === "juridica" ? (clienteBody.representante_profissao?.trim() || null) : null,
      representante_rg: tipoCliente === "juridica" ? (clienteBody.representante_rg?.trim() || null) : null,
      // Financeiro
      valor_contrato: clienteBody.valor_contrato ? parseFloat(clienteBody.valor_contrato) : 0,
      total_pago: clienteBody.total_pago ? parseFloat(clienteBody.total_pago) : 0
    };

    // Validação de Estado (UF)
    if (clienteData.estado && (clienteData.estado.length !== 2 || !/^[A-Z]+$/.test(clienteData.estado.toUpperCase()))) {
      return res.status(400).json({ error: "O campo 'Estado' deve conter exatamente 2 letras (Ex: PR)." });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 2. ⚡ LÓGICA INTELIGENTE: Remove qualquer campo que seja undefined
    const finalData = {};
    Object.keys(clienteData).forEach(key => {
      if (clienteData[key] !== undefined) {
        finalData[key] = clienteData[key];
      }
    });

    const colunas = Object.keys(finalData).join(",");
    const placeholders = Object.keys(finalData).map(() => "?").join(",");
    const valores = Object.values(finalData);

    // Inserção no MySQL
    const sqlCliente = `INSERT INTO clientes_unificados (${colunas}) VALUES (${placeholders})`;
    const [resultCliente] = await connection.execute(sqlCliente, valores);
    const clienteId = resultCliente.insertId;

    // --- Lógica do PDF (S3) ---
    const pdfFile = req.file;
    if (pdfFile) {
      const bucketName = process.env.AWS_BUCKET_NAME;
      const uniqueFilename = gerarCaminhoS3("clientes", `${clienteId}_${Date.now()}_${pdfFile.originalname}`);

      const uploadParams = {
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: pdfFile.buffer,
        ContentType: pdfFile.mimetype || "application/pdf",
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'sa-east-1'}.amazonaws.com/${uniqueFilename}`;

      const sqlPdf = `INSERT INTO pdfs_unificados (cliente_id, nome_arquivo, caminho_arquivo, tipo_mime, tamanho_bytes, data_upload, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const valuesPdf = [clienteId, pdfFile.originalname, s3Url, pdfFile.mimetype || "application/pdf", pdfFile.size, new Date(), `Upload S3 - Mobile/Desktop` ];

      await connection.execute(sqlPdf, valuesPdf);
    }

    await connection.commit();
    res.status(201).json({ message: "Cliente adicionado com sucesso!", id: clienteId });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("DEBUG Erro:", error);
    res.status(500).json({ error: "Erro interno no servidor: " + error.message });
  } finally {
    if (connection) connection.release();
  }
};

// --- GET: BUSCAR CLIENTES (Com filtro de acesso) ---
const getClientes = async (req, res) => {
  console.log("Filtro aplicado:", req.accessFilter, req.accessFilterValue);

  try {
    const { tipo } = req.query;
    const filter = req.accessFilter;
    const filterValue = req.accessFilterValue;

    const queryValues = [tipo];

    if (filterValue !== null) {
      queryValues.push(filterValue);
    }

    let selectColumns;

    if (tipo === "juridica") {
      selectColumns = `
        id, razao_social AS nome, inscricao_estadual, nome_fantasia, cnpj,
        celular, telefone, email, endereco, numero, cep, bairro, cidade, estado,
        status, representante_nome, representante_cpf, representante_cargo,
        representante_celular, representante_email, tipo_acesso, id_usuario,
         representante_nacionalidade, representante_profissao, representante_rg, 
         representante_estado_civil, valor_contrato, total_pago
      `;
    } else {
      selectColumns = `
        id, nome, celular, cpf, rg, data_nascimento, nacionalidade,
        profissao, ctps, teleitor, endereco, numero, cep, bairro, cidade, estado,
        telefone, email, estado_civil, conjuge, cpf_conjuge, rg_conjuge,
        status, tipo_acesso, id_usuario, valor_contrato, total_pago
      `;
    }

    const [rows] = await pool.query(
      `
      SELECT ${selectColumns}
      FROM clientes_unificados
      WHERE tipo = ? AND (${filter})
      ORDER BY nome ASC
      `,
      queryValues
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ error: "Erro ao buscar clientes." });
  }
};

// --- GET: BUSCAR PDFS DO CLIENTE ---
const getClientePdfs = async (req, res) => {
  const clienteId = req.params.cliente_id;

  try {
    const [rows] = await pool.query(
      `
      SELECT id, nome_arquivo, data_upload, caminho_arquivo
      FROM pdfs_unificados
      WHERE cliente_id = ?
      `,
      [clienteId]
    );

    const BASE_URL = process.env.BACKEND_URL;

    const pdfs = rows.map((row) => {
      const dataUpload = new Date(row.data_upload);
      const dataFormatada = `${dataUpload
        .getDate()
        .toString()
        .padStart(2, "0")}/${(dataUpload.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${dataUpload.getFullYear()}`;

      let urlCompleta;

      if (row.caminho_arquivo?.startsWith("http")) {
        urlCompleta = row.caminho_arquivo;
      } else {
        urlCompleta = `${BASE_URL}/download-procuracao/${row.caminho_arquivo}`;
      }

      return {
        id: row.id,
        nome_arquivo: row.nome_arquivo,
        data: row.data_upload,
        data_upload_formatted: dataFormatada,
        url: urlCompleta,
        caminho_arquivo: row.caminho_arquivo,
        cliente_id: clienteId,
      };
    });

    res.status(200).json(pdfs);
  } catch (error) {
    console.error("Erro ao buscar PDFs do cliente:", error);
    res.status(500).json({ error: "Erro ao buscar PDFs." });
  }
};

// --- PUT: ATUALIZAR CLIENTE ---
const updateCliente = async (req, res) => {
  const clienteId = req.params.cliente_id;
  let connection;

  try {
    const id_usuario = req.body.id_usuario;
    const parsedIdUsuario = parseInt(id_usuario);

    if (isNaN(parsedIdUsuario) || parsedIdUsuario <= 0) {
      return res.status(400).json({ error: "ID do usuário logado é obrigatório." });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingClientRows] = await connection.execute(
      "SELECT * FROM clientes_unificados WHERE id = ?",
      [clienteId]
    );

    if (existingClientRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const existingData = existingClientRows[0];
    const tipoCliente = existingData.tipo;
    const updateData = {};
    let dadoAlterado = false;

    const compareAndAdd = (key, rawNewValue) => {
      if (rawNewValue === undefined) return;

      const novoValor = rawNewValue;
      const valorAntigo = existingData[key];

      if (key === "valor_contrato" || key === "total_pago") {
        const v1 = parseFloat(novoValor || 0).toFixed(2);
        const v2 = parseFloat(valorAntigo || 0).toFixed(2);

        if (v1 !== v2) {
          
          updateData[key] = parseFloat(v1);
          dadoAlterado = true;
        }
        return;
      }

      const valNovoStr = String(novoValor ?? "").trim();
      const valAntigoStr = String(valorAntigo ?? "").trim();

      if (valNovoStr !== valAntigoStr) {
       
        updateData[key] = valNovoStr === "" ? null : novoValor;
        dadoAlterado = true;
      }
    };

    const camposComuns = [
      "tipo_acesso", "endereco", "numero", "cep", "bairro", "cidade", "estado",
      "telefone", "celular", "email", "status", "valor_contrato", "total_pago"
    ];

    let camposEspecificos = [];
    if (tipoCliente === "fisica") {
      camposEspecificos = [
        "nome", "cpf", "rg", "data_nascimento", "nacionalidade",
        "profissao", "ctps", "teleitor", "estado_civil", "conjuge",
        "cpf_conjuge", "rg_conjuge"
      ];
    } else {
      camposEspecificos = [
        "razao_social", "nome_fantasia", "cnpj", "inscricao_estadual",
        "representante_nome", "representante_cpf", "representante_rg",
        "representante_cargo", "representante_celular", "representante_email",
        "representante_nacionalidade", "representante_estado_civil", "representante_profissao"
      ];
    }

    [...camposComuns, ...camposEspecificos].forEach(campo => {
      let valorInput = req.body[campo];
      if (campo === "razao_social" && valorInput === undefined) {
        valorInput = req.body.nome;
      }
      compareAndAdd(campo, valorInput);
    });

    const pdfFile = req.file;

    if (!dadoAlterado && !pdfFile) {
      await connection.rollback();
      
      return res.status(400).json({
        error: "Nenhuma alteração detectada nos campos."
      });
    }

    if (dadoAlterado) {
      const fields = Object.keys(updateData);
      const values = fields.map(key => updateData[key]);
      const setClauses = fields.map(field => `${field} = ?`).join(", ");

      const sqlUpdate = `UPDATE clientes_unificados SET ${setClauses} WHERE id = ?`;
      values.push(clienteId);

      await connection.execute(sqlUpdate, values);
    }

    if (pdfFile) {
      const bucketName = process.env.AWS_BUCKET_NAME;
      const uniqueFilename = gerarCaminhoS3("clientes", `${clienteId}_${Date.now()}_${pdfFile.originalname}`);

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: pdfFile.buffer,
        ContentType: pdfFile.mimetype || "application/pdf",
      }));

      const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;

      const sqlPdf = `
        INSERT INTO pdfs_unificados 
        (cliente_id, nome_arquivo, caminho_arquivo, tipo_mime, tamanho_bytes, data_upload, descricao, tipo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const valuesPdf = [
        clienteId,
        pdfFile.originalname,
        s3Url,
        pdfFile.mimetype || "application/pdf",
        pdfFile.size,
        new Date(),
        `Atualização S3 - ${pdfFile.originalname}`,
        tipoCliente
      ];

      await connection.execute(sqlPdf, valuesPdf);
    }

    await connection.commit();
    console.log(`✅ Cliente ${clienteId} atualizado com sucesso!`);
    res.status(200).json({ message: "Cliente atualizado com sucesso!" });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`❌ ERRO NO UPDATE CLIENTE ${clienteId}:`, error);
    res.status(500).json({ error: "Erro interno: " + error.message });
  } finally {
    if (connection) connection.release();
  }
};

// --- DELETE: EXCLUIR CLIENTE ---
const deleteCliente = async (req, res) => {
  const clienteId = Number(req.params.clienteId);
  const { userId } = req.user;
  const usuarioId = userId || 1;

  let connection = null;
  const nomeTabelaClientes = 'clientes_unificados';
  const nomeTabelaPdfs = 'pdfs_unificados';

  let pdfsExcluidosBD = 0;
  let pdfsMovidosLixeira = 0;
  let negociacoesExcluidas = 0;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [clienteRows] = await connection.execute(
      `SELECT * FROM ${nomeTabelaClientes} WHERE id = ?`,
      [clienteId]
    );

    if (clienteRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Cliente não encontrado." });
    }
    const clienteData = clienteRows[0];

    const [pdfs] = await connection.execute(
      `SELECT * FROM ${nomeTabelaPdfs} WHERE cliente_id = ?`,
      [clienteId]
    );

    for (const pdf of pdfs) {
      await connection.execute(`
        INSERT INTO logs_auditoria (usuario_id, tipo_acao, tabela_afetada, registro_id, dados_antigos, status_restauracao, nome_arquivo)
        VALUES (?, 'EXCLUSAO', ?, ?, ?, 'ORIGINAL', ?)`,
        [usuarioId, nomeTabelaPdfs, pdf.id, JSON.stringify(pdf), pdf.caminho_arquivo]
      );

      await connection.execute(`DELETE FROM ${nomeTabelaPdfs} WHERE id = ?`, [pdf.id]);
      pdfsExcluidosBD++;
    }

    const queryLogCliente = `
      INSERT INTO logs_auditoria (
        usuario_id, tipo_acao, tabela_afetada, registro_id, dados_antigos, status_restauracao
      ) VALUES (?, ?, ?, ?, ?, ?)`;

    const valoresLogCliente = [
      usuarioId,
      'EXCLUSAO',
      nomeTabelaClientes,
      clienteId,
      JSON.stringify(clienteData),
      'ORIGINAL'
    ];

    await connection.execute(queryLogCliente, valoresLogCliente);
    await connection.execute(`DELETE FROM ${nomeTabelaClientes} WHERE id = ?`, [clienteId]);

    await connection.commit();

    res.status(200).json({
      message: `Cliente "${clienteData.NOME || clienteData.RAZAO_SOCIAL}" excluído com sucesso.`,
      detalhes: {
        negociacoes: negociacoesExcluidas,
        pdfs_bd: pdfsExcluidosBD,
        pdfs_arquivos: pdfsMovidosLixeira
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erro fatal na exclusão:", error);
    res.status(500).json({ error: "Erro ao excluir cliente: " + error.message });
  } finally {
    if (connection) connection.release();
  }
};

// --- GET: ABRIR OU REDIRECIONAR PDF ---
const abrirPdf = async (req, res) => {
  const pdfId = req.params.id;
  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute(
      "SELECT caminho_arquivo FROM pdfs_unificados WHERE id = ?",
      [pdfId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Arquivo não encontrado no banco de dados." });
    }

    const caminho = rows[0].caminho_arquivo;

    // Se o caminho for uma URL completa (S3), redireciona
    if (caminho.startsWith("http")) {
      console.log(`[VIEW] Redirecionando para S3: ${caminho}`);
      return res.redirect(caminho);
    }

    // Compatibilidade com arquivos locais (se houver)
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, '../../uploads', caminho); // Ajuste o caminho se necessário

    if (fs.existsSync(filePath)) {
      console.log(`[VIEW] Servindo arquivo local: ${filePath}`);
      return res.sendFile(filePath);
    }

    res.status(404).json({ error: "Arquivo físico não encontrado no servidor ou S3." });

  } catch (error) {
    console.error("Erro ao visualizar PDF:", error);
    res.status(500).json({ error: "Erro interno ao tentar abrir o arquivo." });
  } finally {
    if (connection) connection.release();
  }
};

// --- DELETE: EXCLUIR PDF ---
const deletePdf = async (req, res) => {
  const pdfId = req.params.pdf_id;
  let connection;

  const { userId } = req.user;
  const usuarioId = userId;
  const nomeTabela = 'pdfs_unificados';

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT * FROM pdfs_unificados WHERE id = ?",
      [pdfId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "PDF não encontrado ou acesso negado." });
    }

    const pdf = rows[0];
    const nomeArquivoParaLog = pdf.caminho_arquivo;

    const sqlLog = `
      INSERT INTO logs_auditoria 
      (usuario_id, tipo_acao, tabela_afetada, registro_id, dados_antigos, status_restauracao, nome_arquivo) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(sqlLog, [
      usuarioId,
      'EXCLUSAO',
      nomeTabela,
      pdfId,
      JSON.stringify(pdf),
      'ORIGINAL',
      nomeArquivoParaLog
    ]);

    await connection.execute("DELETE FROM pdfs_unificados WHERE id = ?", [pdfId]);

    // Opcional: Lógica de arquivo físico / lixeira local se aplicável
    try {
      const fsp = require('fs').promises;
      const path = require('path');
      // Se tiver lógica de renomear para lixeira local, mantenha aqui
    } catch (err) {
      console.warn("Aviso na manipulação do arquivo físico:", err.message);
    }

    await connection.commit();
    res.status(200).json({ message: "PDF excluído (movido para lixeira) e logado com sucesso." });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erro fatal ao deletar PDF:", error);
    res.status(500).json({ error: "Erro interno ao deletar PDF.", details: error.message });
  } finally {
    if (connection) connection.release();
  }
};
// --- PUT: RENOMEAR PDF ---
// --- PUT: RENOMEAR PDF ---
const renomearPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { novoNome } = req.body;

    if (!novoNome || novoNome.trim() === "") {
      return res.status(400).json({ error: "O novo nome é obrigatório." });
    }

    let nomeFinal = novoNome.trim();
    if (!nomeFinal.toLowerCase().endsWith(".pdf")) {
      nomeFinal += ".pdf";
    }

    const [result] = await pool.execute(
      "UPDATE pdfs_unificados SET nome_arquivo = ? WHERE id = ?",
      [nomeFinal, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Arquivo não encontrado." });
    }

    return res.status(200).json({
      message: "Arquivo renomeado com sucesso!",
      novoNome: nomeFinal,
    });
  } catch (error) {
    console.error("Erro ao renomear arquivo:", error);
    return res.status(500).json({ error: "Erro interno ao renomear arquivo." });
  }
};

module.exports = {
  postCliente,
  getClientes,
  getClientePdfs,
  updateCliente,
  deleteCliente,
  abrirPdf, 
  deletePdf,  
  renomearPdf
};