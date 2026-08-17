const pool = require("../config/database");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const puppeteer = require("puppeteer");
const axios = require("axios");
const os = require("os");
const fsp = require("fs").promises;
const path = require("path");

// --- Instanciação autônoma do S3 para evitar erros de escopo ---
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

// --- FUNÇÃO AUXILIAR PARA APLICAR MÁSCARA DE TELEFONE ---
function formatarTelefone(telefone) {
  if (!telefone) return '';

  const apenasNumeros = telefone.toString().replace(/\D/g, '');

  if (apenasNumeros.length === 11) {
    return `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 7)}-${apenasNumeros.substring(7)}`;
  }
  if (apenasNumeros.length === 10) {
    return `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 6)}-${apenasNumeros.substring(6)}`;
  }

  return telefone;
}

// --- SUA FUNÇÃO DE PREENCHIMENTO ATUALIZADA E CORRIGIDA ---
function preencherTemplateHtml(html, cliente) {
  let resultado = html;

  if (cliente.tipo === "fisica") {
    resultado = resultado.replace(/{{nome_cliente}}/g, cliente.nome || '');
    resultado = resultado.replace(/{{nacionalidade}}/g, cliente.nacionalidade || 'brasileiro(a)');
    resultado = resultado.replace(/{{estado_civil}}/g, cliente.estado_civil || '');
    resultado = resultado.replace(/{{profissao}}/g, cliente.profissao || '');
    resultado = resultado.replace(/{{cpf}}/g, cliente.cpf || '');
    resultado = resultado.replace(/{{rg}}/g, cliente.rg || '');

    resultado = resultado.replace(/{{nome_assinatura}}/g, cliente.nome || '');
    resultado = resultado.replace(/{{cargo_representante}}/g, '');
  }
  else if (cliente.tipo === "juridica") {
    resultado = resultado.replace(/{{nome_cliente}}/g, cliente.razao_social || '');
    resultado = resultado.replace(/{{cpf}}/g, cliente.cnpj || '');

    resultado = resultado.replace(/{{nacionalidade}}/g, cliente.representante_nacionalidade || 'brasileiro(a)');
    resultado = resultado.replace(/{{estado_civil}}/g, cliente.representante_estado_civil || '');
    resultado = resultado.replace(/{{profissao}}/g, cliente.representante_profissao || '');
    resultado = resultado.replace(/{{representante_email}}/g, cliente.representante_email || '');
    resultado = resultado.replace(/{{rg}}/g, cliente.representante_rg || '');

    resultado = resultado.replace(/{{nome_assinatura}}/g, cliente.representante_nome || '');

    if (cliente.representante_cargo) {
      resultado = resultado.replace(/{{cargo_representante}}/g, `<br><span style="font-size: 12px; font-weight: normal; color: #555;">${cliente.representante_cargo}</span>`);
    } else {
      resultado = resultado.replace(/{{cargo_representante}}/g, '');
    }
  }

  resultado = resultado.replace(/{{endereco}}/g, cliente.endereco || '');
  resultado = resultado.replace(/{{numero}}/g, cliente.numero || '');
  resultado = resultado.replace(/{{bairro}}/g, cliente.bairro || '');
  resultado = resultado.replace(/{{cidade}}/g, cliente.cidade || '');
  resultado = resultado.replace(/{{estado}}/g, cliente.estado || '');
  resultado = resultado.replace(/{{email}}/g, cliente.email || '');

  resultado = resultado.replace(/{{telefone}}/g, formatarTelefone(cliente.telefone));

  resultado = resultado.replace(/{{cidade_comarca}}/g, cliente.cidade || 'Curitiba');
  resultado = resultado.replace(/{{data_atual}}/g, new Date().toLocaleDateString('pt-BR'));

  return resultado;
}

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

// 1. Gerar Procuração em PDF
const gerarProcuracao = async (req, res) => {
  try {
    const { clienteId, documentoNome } = req.body;
    if (!clienteId || !documentoNome) {
      return res.status(400).json({ error: "ID do cliente e nome do documento são obrigatórios." });
    }

    const clienteData = await fetchClienteData(clienteId);
    if (!clienteData) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const [rows] = await pool.execute(
      "SELECT caminho_arquivo FROM documentos_corporativos WHERE nome_original = ? LIMIT 1",
      [documentoNome]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Modelo não encontrado no banco." });
    }
    const caminhoModelo = rows[0].caminho_arquivo;

    let htmlTemplate;
    if (caminhoModelo.startsWith("http")) {
      const key = caminhoModelo.split('.amazonaws.com/')[1];

      const command = new GetObjectCommand({
        Bucket: "interagir",
        Key: key
      });

      const response = await s3Client.send(command);

      const streamToText = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        });

      htmlTemplate = await streamToText(response.Body);
    } else {
      const htmlPath = path.join(__dirname, "..", "uploads", caminhoModelo);
      htmlTemplate = await fsp.readFile(htmlPath, "utf-8");
    }

    const htmlPreenchido = preencherTemplateHtml(htmlTemplate, clienteData);

    const browser = await puppeteer.launch({
      executablePath: os.platform() === 'linux'
        ? '/usr/bin/chromium'
        : undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    let filledPdfBytes;
    try {
      const page = await browser.newPage();

      await page.setViewport({ width: 1200, height: 800 });
      await page.setContent(htmlPreenchido, { waitUntil: 'domcontentloaded' });
      await new Promise(resolve => setTimeout(resolve, 500));

      filledPdfBytes = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '2.5cm',
          bottom: '2.5cm',
          left: '3cm',
          right: '2cm'
        }
      });
    } finally {
      await browser.close();
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    const nomeDoCliente = (clienteData.nome || clienteData.razao_social || "cliente").trim();

    const nomeLimpoParaUrl = nomeDoCliente
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .replace(/\s+/g, "_");

    const templateLimpoParaUrl = documentoNome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .replace(/\s+/g, "_");

    const agora = new Date();
    const timestampSeguro = agora.getFullYear() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') + '_' +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0') +
      String(agora.getSeconds()).padStart(2, '0');

    const nomeArquivoGerado = `Procuracao_${templateLimpoParaUrl}_${nomeLimpoParaUrl}_${timestampSeguro}.pdf`;
    const fullKey = gerarCaminhoS3("procuracoes_clientes", nomeArquivoGerado);

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fullKey,
      Body: filledPdfBytes,
      ContentType: "application/pdf",
    }));

    const s3UrlGerada = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fullKey}`;

    const dataAtual = new Date();
    await pool.execute(
      "INSERT INTO pdfs_unificados (cliente_id, nome_arquivo, caminho_arquivo, data_upload, zapsign_id) VALUES (?, ?, ?, ?, NULL)",
      [
        clienteId,
        `Procuração - ${clienteData.nome || clienteData.razao_social}`,
        s3UrlGerada,
        dataAtual,
      ]
    );

    res.status(200).json({
      message: "Procuração gerada via HTML/Puppeteer com sucesso!",
      link: s3UrlGerada,
    });

  } catch (error) {
    console.error("Erro ao gerar procuração:", error);
    res.status(500).json({ error: "Erro ao gerar a procuração: " + error.message });
  }
};

// Gerar Declaração de Hipossuficiência em PDF
const gerarDeclaracaoHipossuficiencia = async (req, res) => {
  try {
    const { clienteId, documentoNome } = req.body;

    if (!clienteId || !documentoNome) {
      return res.status(400).json({
        error: "ID do cliente e nome do documento são obrigatórios."
      });
    }

    const clienteData = await fetchClienteData(clienteId);
    if (!clienteData) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    if (clienteData.tipo !== "fisica") {
      return res.status(400).json({
        error: "A declaração de hipossuficiência está disponível apenas para pessoa física."
      });
    }

    const [rows] = await pool.execute(
      "SELECT caminho_arquivo FROM documentos_corporativos WHERE nome_original = ? LIMIT 1",
      [documentoNome]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Modelo de declaração não encontrado no banco." });
    }

    const caminhoModelo = rows[0].caminho_arquivo;
    let htmlTemplate;

    if (caminhoModelo.startsWith("http")) {
      const key = decodeURIComponent(caminhoModelo.split(".amazonaws.com/")[1]);
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      });
      const response = await s3Client.send(command);
      const chunks = [];

      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      htmlTemplate = Buffer.concat(chunks).toString("utf-8");
    } else {
      const htmlPath = path.join(__dirname, "..", "uploads", caminhoModelo);
      htmlTemplate = await fsp.readFile(htmlPath, "utf-8");
    }

    const htmlPreenchido = preencherTemplateHtml(htmlTemplate, clienteData);
    const browser = await puppeteer.launch({
      executablePath: os.platform() === "linux" ? "/usr/bin/chromium" : undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    let pdfBytes;
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      await page.setContent(htmlPreenchido, { waitUntil: "domcontentloaded" });
      await new Promise((resolve) => setTimeout(resolve, 500));
      pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: "2.5cm",
          bottom: "2.5cm",
          left: "3cm",
          right: "2cm",
        },
      });
    } finally {
      await browser.close();
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    const nomeDoCliente = (clienteData.nome || "cliente").trim();
    const nomeLimpoParaUrl = nomeDoCliente
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .replace(/\s+/g, "_");
    const templateLimpoParaUrl = documentoNome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .replace(/\s+/g, "_");
    const agora = new Date();
    const timestampSeguro =
      agora.getFullYear() +
      String(agora.getMonth() + 1).padStart(2, "0") +
      String(agora.getDate()).padStart(2, "0") +
      "_" +
      String(agora.getHours()).padStart(2, "0") +
      String(agora.getMinutes()).padStart(2, "0") +
      String(agora.getSeconds()).padStart(2, "0");
    const nomeArquivoGerado =
      `Declaracao_Hipossuficiencia_${templateLimpoParaUrl}_${nomeLimpoParaUrl}_${timestampSeguro}.pdf`;
    const fullKey = gerarCaminhoS3("declaracoes_clientes", nomeArquivoGerado);

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fullKey,
      Body: pdfBytes,
      ContentType: "application/pdf",
    }));

    const s3UrlGerada =
      `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fullKey}`;

    await pool.execute(
      "INSERT INTO pdfs_unificados (cliente_id, nome_arquivo, caminho_arquivo, data_upload, zapsign_id) VALUES (?, ?, ?, ?, NULL)",
      [
        clienteId,
        `Declaração de Hipossuficiência - ${clienteData.nome}`,
        s3UrlGerada,
        new Date(),
      ]
    );

    return res.status(200).json({
      message: "Declaração de hipossuficiência gerada com sucesso!",
      link: s3UrlGerada,
    });
  } catch (error) {
    console.error("Erro ao gerar declaração de hipossuficiência:", error);
    return res.status(500).json({
      error: "Erro ao gerar a declaração de hipossuficiência: " + error.message,
    });
  }
};

// 2. Listar Procurações Corporativas
const listarProcuracoes = async (req, res) => {
  try {
    const accessFilter = req.accessFilter || "1=1";
    const accessFilterValue = req.accessFilterValue !== undefined ? req.accessFilterValue : null;

    const sql = `
      SELECT id, nome_original, caminho_arquivo
      FROM documentos_corporativos
      WHERE nome_original LIKE '%procuracao%'
      AND (${accessFilter})
    `;

    const params = accessFilterValue !== null ? [accessFilterValue] : [];
    const [rows] = await pool.execute(sql, params);

    console.log(`🔍 Procurações encontradas: ${rows.length} para o usuário ${accessFilterValue}`);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro na busca de procurações:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

// Listar modelos de declaração armazenados em Documentos Corporativos
const listarDeclaracoes = async (req, res) => {
  try {
    const accessFilter = req.accessFilter || "1=1";
    const accessFilterValue = req.accessFilterValue !== undefined
      ? req.accessFilterValue
      : null;
    const sql = `
      SELECT id, nome_original, caminho_arquivo
      FROM documentos_corporativos
      WHERE nome_original LIKE '%declaracao%'
      AND (${accessFilter})
    `;
    const params = accessFilterValue !== null ? [accessFilterValue] : [];
    const [rows] = await pool.execute(sql, params);

    console.log(`Declarações encontradas: ${rows.length} para o usuário ${accessFilterValue}`);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro na busca de declarações:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};

// 3. Download Local da Procuração
const downloadProcuracao = async (req, res) => {
  try {
    const nomeArquivo = req.params.nomeArquivo;
    if (!nomeArquivo) {
      return res.status(400).json({ error: "Nome do arquivo não fornecido." });
    }

    const pathProcuracoes = path.join(__dirname, "..", "procuracoes", nomeArquivo);
    const pathUploads = path.join(__dirname, "..", "uploads", nomeArquivo);

    let filePath;

    try {
      await fsp.access(pathProcuracoes);
      filePath = pathProcuracoes;
    } catch (err) {
      try {
        await fsp.access(pathUploads);
        filePath = pathUploads;
      } catch (err) {
        throw new Error("Arquivo não encontrado em ambos os diretórios.");
      }
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("Erro ao fazer o download da procuração:", error);
    res.status(404).json({ error: "Arquivo não encontrado." });
  }
};

// 4. Obter URL da ZapSign
const obterUrlZapsign = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId || pdfId === 'undefined') {
      return res.status(400).json({ error: "ID do PDF inválido." });
    }

    const [rows] = await pool.execute(
      "SELECT zapsign_url FROM pdfs_unificados WHERE id = ?",
      [pdfId]
    );

    if (rows.length > 0 && rows[0].zapsign_url) {
      res.status(200).json({ zapsignUrl: rows[0].zapsign_url });
    } else {
      res.status(200).json({ zapsignUrl: null });
    }
  } catch (error) {
    console.error("Erro ao buscar URL da Zapsign:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// 5. Enviar para ZapSign
const enviarParaZapsign = async (req, res) => {
  try {
    const { clienteId, documentoNome } = req.body;
    if (!clienteId || !documentoNome) {
      return res.status(400).json({ error: "ID do cliente e nome do documento são obrigatórios." });
    }

    const [pdfRows] = await pool.execute(
      "SELECT caminho_arquivo FROM pdfs_unificados WHERE nome_arquivo = ? AND cliente_id = ?",
      [documentoNome, clienteId]
    );

    if (pdfRows.length === 0) {
      return res.status(404).json({ error: "PDF não encontrado para este cliente." });
    }

    const caminhoArquivo = pdfRows[0].caminho_arquivo;
    let pdfBase64 = "";

    if (caminhoArquivo.startsWith("http")) {
      try {
        const s3Key = decodeURIComponent(caminhoArquivo.split(".amazonaws.com/")[1]);

        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
        });

        const s3Response = await s3Client.send(command);

        const chunks = [];
        for await (const chunk of s3Response.Body) {
          chunks.push(chunk);
        }
        pdfBase64 = Buffer.concat(chunks).toString("base64");
      } catch (s3Error) {
        console.error("Erro ao buscar PDF no S3 para ZapSign:", s3Error);
        return res.status(500).json({ error: "Erro ao acessar o arquivo no S3 para envio." });
      }
    } else {
      const pdfPath = path.join(__dirname, "..", "procuracoes", caminhoArquivo);
      const pdfBytes = await fsp.readFile(pdfPath);
      pdfBase64 = pdfBytes.toString("base64");
    }

    const [clienteRows] = await pool.execute(
      "SELECT email, nome FROM clientes_unificados WHERE id = ?",
      [clienteId]
    );

    const clienteEmail = clienteRows[0]?.email;
    const clienteNome = clienteRows[0]?.nome;

    if (!clienteEmail) {
      return res.status(400).json({ error: "E-mail do cliente não encontrado." });
    }

    const urlZapSign = `${process.env.ZAPSIGN_BASE_URL}/docs`;

    const zapsignResponse = await axios.post(
      urlZapSign,
      {
        name: documentoNome,
        base64_pdf: pdfBase64,
        signers: [
          {
            email: clienteEmail,
            name: clienteNome,
            auths: ["token"],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ZAPSIGN_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const zapsignUrl = zapsignResponse.data.signers?.[0]?.sign_url;
    const zapsignId = zapsignResponse.data.token;

    if (!zapsignUrl) {
      throw new Error("Não foi possível obter o link de assinatura do ZapSign.");
    }

    await pool.execute(
      "UPDATE pdfs_unificados SET zapsign_url = ?, zapsign_id = ? WHERE nome_arquivo = ? AND cliente_id = ?",
      [zapsignUrl, zapsignId, documentoNome, clienteId]
    );

    res.status(200).json({
      message: "Procuração enviada para assinatura com sucesso!",
      zapsignUrl,
    });

  } catch (error) {
    console.error("Erro ao enviar para ZapSign:", error.response?.data || error.message);
    res.status(500).json({
      error: "Erro ao enviar para ZapSign",
      details: error.response?.data || error.message
    });
  }
};

// 6. Webhook da ZapSign
const processarWebhookZapsign = async (req, res) => {
  try {
    const event = req.body;

    if (event.event_type === "doc_signed") {
      const documentId = event.token;
      const signedFileUrl = event.signed_file;

      if (!documentId || !signedFileUrl) {
        console.error("❌ Dados ausentes no webhook.");
        return res.status(400).send("Dados ausentes");
      }

      const [rows] = await pool.execute(
        "SELECT caminho_arquivo, cliente_id, nome_arquivo FROM pdfs_unificados WHERE zapsign_id = ?",
        [documentId]
      );

      if (rows.length === 0) {
        console.log("--- 🔍 DIAGNÓSTICO DE ERRO NO WEBHOOK ---");
        console.log("Token recebido da ZapSign:", documentId);
        return res.status(404).send("Documento não encontrado no banco.");
      }

      const { caminho_arquivo, nome_arquivo } = rows[0];

      const response = await axios.get(signedFileUrl, { responseType: "arraybuffer" });

      let s3Key;
      if (caminho_arquivo.includes(".amazonaws.com/")) {
        s3Key = decodeURIComponent(caminho_arquivo.split(".amazonaws.com/")[1]);
      } else {
        s3Key = caminho_arquivo;
      }

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: Buffer.from(response.data),
        ContentType: "application/pdf",
        CacheControl: "no-cache"
      }));

      await pool.execute(
        "UPDATE pdfs_unificados SET zapsign_assinado = 1, zapsign_url = NULL WHERE zapsign_id = ?",
        [documentId]
      );

      const [allUsersRows] = await pool.execute(`SELECT id, push_token, token_type FROM usuarios`);

      if (allUsersRows.length > 0) {
        const title = "Procuração Assinada!";
        const body = `${nome_arquivo || "Um Documento"} foi assinado!`;

        const insertPromises = allUsersRows.map(user => {
          return pool.execute(
            `INSERT INTO notificacoes (id_usuario, titulo, corpo) VALUES (?, ?, ?)`,
            [user.id, title, body]
          );
        });
        await Promise.all(insertPromises);

        const pushData = {
          tipo_evento: "procuracao_assinada",
          document_id: documentId.toString(),
          titulo: title,
          corpo: body,
        };

        const pushPromises = allUsersRows
          .filter(user => user.push_token)
          .map(user =>
            typeof sendNotification === 'function'
              ? sendNotification(user.push_token, user.token_type, title, body, pool, pushData)
                .catch(e => console.error(`[Notificação] Erro ID ${user.id}: ${e.message}`))
              : Promise.resolve()
          );

        await Promise.all(pushPromises);
      }

      console.log(`✅ Documento ${documentId} assinado, S3 atualizado e notificações enviadas.`);
    }

    res.status(200).send("Webhook processado");

  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error.message);
    res.status(500).send("Erro interno do servidor");
  }
};

module.exports = {
  gerarProcuracao,
  gerarDeclaracaoHipossuficiencia,
  listarProcuracoes,
  listarDeclaracoes,
  downloadProcuracao,
  obterUrlZapsign,
  enviarParaZapsign,
  processarWebhookZapsign
};
