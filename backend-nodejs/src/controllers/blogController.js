const pool = require("../config/database");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fsp = require("fs").promises;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "sa-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const gerarCaminhoS3 = (pastaOriginal, nomeArquivo) => {
  const prefixoAmbiente = process.env.AWS_S3_FOLDER ? `${process.env.AWS_S3_FOLDER}/` : "";
  return `${prefixoAmbiente}${pastaOriginal}/${nomeArquivo}`;
};

// 1. Buscar todos os posts
const getPosts = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM posts ORDER BY data_publicacao DESC"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar os posts:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// 2. Buscar um post individual pelo slug
const getPostBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const [rows] = await pool.execute("SELECT * FROM posts WHERE slug = ?", [slug]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post não encontrado." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar o post:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// 3. Registrar um novo like
const likePost = async (req, res) => {
  const postId = req.params.id;

  try {
    const [result] = await pool.execute(
      "UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?",
      [postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Post não encontrado para curtir." });
    }

    res.status(200).json({ message: "Like registrado com sucesso!" });
  } catch (error) {
    console.error(`Erro ao registrar like para o post ${postId}:`, error);
    res.status(500).json({ error: "Erro interno ao registrar like." });
  }
};

// 4. Criar um novo post
const createPost = async (req, res) => {
  const file = req.files && req.files["imagem"] ? req.files["imagem"][0] : null;
  const { titulo, conteudo, autor } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ error: "Título e conteúdo são obrigatórios." });
  }

  let baseSlug = titulo.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  let slug = baseSlug;
  let counter = 1;

  try {
    let [existingSlugs] = await pool.execute("SELECT slug FROM posts WHERE slug = ?", [slug]);
    while (existingSlugs.length > 0) {
      slug = `${baseSlug}-${counter}`;
      [existingSlugs] = await pool.execute("SELECT slug FROM posts WHERE slug = ?", [slug]);
      counter++;
    }
  } catch (error) {
    console.error("Erro ao verificar o slug:", error);
  }

  let imagem_url = null;
  const bucketName = process.env.AWS_BUCKET_NAME || "interagir";

  if (file) {
    try {
      const fileName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
      const fullKey = gerarCaminhoS3("blog", fileName);

      let fileBody;
      if (file.buffer) {
        fileBody = file.buffer;
      } else if (file.path) {
        fileBody = await fsp.readFile(file.path);
      } else {
        throw new Error("Arquivo não possui buffer nem path válidos.");
      }

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fullKey,
        Body: fileBody,
        ContentType: file.mimetype
      }));

      imagem_url = `https://${bucketName}.s3.${process.env.AWS_REGION || "sa-east-1"}.amazonaws.com/${fullKey}`;

      if (file.path) {
        await fsp.unlink(file.path).catch(err => console.log("Erro ao deletar temporário:", err));
      }
    } catch (s3Err) {
      console.error("Erro detalhado no S3:", s3Err);
      return res.status(500).json({ error: "Falha ao processar imagem para o S3." });
    }
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO posts (titulo, conteudo, imagem_url, autor, data_publicacao, slug) VALUES (?, ?, ?, ?, ?, ?)",
      [titulo, conteudo, imagem_url, autor || "Anônimo", new Date(), slug]
    );

    res.status(201).json({
      message: "Post criado com sucesso!",
      postId: result.insertId,
      url: imagem_url
    });
  } catch (error) {
    console.error("Erro ao criar o post:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// 5. Atualizar um post existente
const updatePost = async (req, res) => {
  const file = req.files && req.files["imagem"] ? req.files["imagem"][0] : null;
  const { titulo, conteudo, autor, slug: newSlug, removeImage } = req.body;
  const { slug } = req.params;
  const bucketName = process.env.AWS_BUCKET_NAME || "interagir";

  if (!titulo || !conteudo || !newSlug) {
    return res.status(400).json({ error: "Título, conteúdo e slug são obrigatórios." });
  }

  try {
    const [oldPost] = await pool.execute("SELECT imagem_url FROM posts WHERE slug = ?", [slug]);
    if (oldPost.length === 0) return res.status(404).json({ error: "Post não encontrado." });

    const oldImageUrl = oldPost[0].imagem_url;
    let query = "UPDATE posts SET titulo = ?, conteudo = ?, autor = ?, slug = ?";
    let params = [titulo, conteudo, autor || "Anônimo", newSlug];
    let newImageUrl = oldImageUrl;

    if (file) {
      const fileName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
      const fullKey = gerarCaminhoS3("blog", fileName);
      const fileContent = file.buffer || await fsp.readFile(file.path);

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fullKey,
        Body: fileContent,
        ContentType: file.mimetype
      }));

      newImageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "sa-east-1"}.amazonaws.com/${fullKey}`;

      if (!query.includes("imagem_url = ?")) {
        query = query.replace("SET ", "SET imagem_url = ?, ");
        params.unshift(newImageUrl);
      }

      if (oldImageUrl && oldImageUrl.includes("amazonaws.com")) {
        const oldKey = oldImageUrl.split(".com/")[1];
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey }))
          .catch(e => console.log("Aviso: Arquivo antigo não encontrado no S3 para deletar."));
      }

      if (file.path) await fsp.unlink(file.path).catch(() => {});

    } else if (removeImage === "true") {
      query = query.replace("SET ", "SET imagem_url = NULL, ");

      if (oldImageUrl && oldImageUrl.includes("amazonaws.com")) {
        const oldKey = oldImageUrl.split(".com/")[1];
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey }))
          .catch(e => console.log("Erro ao deletar imagem removida:", e));
      }
      newImageUrl = null;
    }

    query += " WHERE slug = ?";
    params.push(slug);

    await pool.execute(query, params);
    res.json({ message: "Post atualizado com sucesso!", url: newImageUrl });

  } catch (error) {
    console.error("Erro ao atualizar o post:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// 6. Deletar um post
const deletePost = async (req, res) => {
  const postId = req.params.id;
  const bucketName = process.env.AWS_BUCKET_NAME || "interagir";

  try {
    const [rows] = await pool.execute("SELECT imagem_url FROM posts WHERE id = ?", [postId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post não encontrado." });
    }

    const imageUrl = rows[0].imagem_url;

    if (imageUrl) {
      try {
        const fileKey = imageUrl.split('.com/')[1];
        if (fileKey) {
          const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
          });
          await s3Client.send(command);
        }
      } catch (s3Error) {
        console.error("❌ Erro ao falar com o S3:", s3Error.message);
      }
    }

    await pool.execute("DELETE FROM posts WHERE id = ?", [postId]);
    res.status(200).json({ message: "Post e imagem removidos!" });

  } catch (error) {
    console.error("Erro geral na rota:", error);
    res.status(500).json({ error: "Erro interno." });
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
  likePost,
  createPost,
  updatePost,
  deletePost
};