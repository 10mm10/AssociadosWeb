const admin = require("firebase-admin");

async function sendNotification(pushToken, tokenType, title, body, dbPool, data = {}) {
  if (!pushToken) {
    console.warn(
      `Não é possível enviar notificação: Token não fornecido. Tipo: ${tokenType}`
    );
    return { success: false, reason: "Token não fornecido." };
  }

  try {
    if (tokenType === "fcm") {
      // --- Lógica de Envio FCM (Prioritária) ---
      const message = {
        notification: {
          title: title,
          body: body,
        },
        data: data, // Dados personalizados (ex: ID do documento)
        token: pushToken,
      };

      const response = await admin.messaging().send(message);
      console.log("✅ FCM - Mensagem enviada com sucesso:", response.name);
      return { success: true, api: "FCM", response: response };

    } else if (tokenType === "expo") {
      // --- Lógica de Envio Expo (Fallback) ---
      if (!global.expo) {
        const { Expo } = require("expo-server-sdk");
        global.expo = new Expo();
      }

      if (!global.expo.isExpoPushToken(pushToken)) {
        console.error(`Token Expo inválido: ${pushToken}. Não é necessário exclusão do BD aqui.`);
        return { success: false, reason: "Token Expo inválido." };
      }

      const messages = [
        {
          to: pushToken,
          sound: "default",
          title: title,
          body: body,
          data: data,
        },
      ];

      const chunks = global.expo.chunkPushNotifications(messages);
      let tickets = [];

      for (let chunk of chunks) {
        const ticketChunk = await global.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      console.log("✅ EXPO - Mensagem enviada com sucesso:", tickets);
      return { success: true, api: "Expo", response: tickets };

    } else {
      console.warn(`Tipo de token desconhecido: ${tokenType}`);
      return { success: false, reason: "Tipo de token desconhecido." };
    }

  } catch (error) {

    // ***************************************************************
    // LÓGICA DE LIMPEZA DO TOKEN (APENAS PARA ERROS FCM)
    // ***************************************************************
    if (tokenType === "fcm" && error.code === 'messaging/registration-token-not-registered') {

      console.warn(`❌ Token FCM Inválido Detectado. Tentando deletar o token do BD: ${pushToken}`);

      // Agora usamos 'dbPool' para executar o DELETE
      if (dbPool && typeof dbPool.execute === 'function') {
        try {
          // Executa o DELETE diretamente no Pool (mysql2)
          const [deleteResult] = await dbPool.execute(
            "DELETE FROM tokens_fcm WHERE token = ?",
            [pushToken]
          );

          if (deleteResult.affectedRows > 0) {
            console.log(`✅ Token ${pushToken} removido com sucesso.`);
          } else {
            console.log(`⚠️ Token ${pushToken} não foi encontrado no BD para remoção.`);
          }

          // Retorna sucesso na operação, pois o token inválido foi tratado (limpo).
          return { success: true, api: "FCM", deleted: true };

        } catch (dbError) {
          // Isso é um erro no DELETE, não no envio do FCM
          console.error(`❌ ERRO CRÍTICO ao deletar token do BD:`, dbError);
          return { success: false, api: "FCM", reason: `Falha ao deletar token: ${dbError.message}` };
        }
      } else {
        console.error(`❌ ERRO: Pool de BD não fornecido ou não possui método execute(). Token inválido não foi removido.`);
        return { success: false, api: "FCM", reason: error.message };
      }
    }

    // Tratamento para todos os outros erros
    console.error("❌ ERRO ao enviar notificação:", error);
    return { success: false, reason: error.message };
  }
}

const marcarLidas = async (req, res) => {
  let connection;
  try {
    // 1. Obtém o ID do usuário
    // ASSUMINDO que o Front-end envia o ID do usuário no corpo da requisição POST
    const userId = req.body.id_usuario;

    if (!userId) {
      return res.status(400).json({ error: "ID do usuário é obrigatório." });
    }

    connection = await pool.getConnection();

    // 2. Comando SQL: Atualiza o status 'lida' para 1 para todas as notificações não lidas
    const [result] = await connection.execute(
      `UPDATE notificacoes 
             SET lida = 1 
             WHERE id_usuario = ? AND lida = 0`,
      [userId]
    );

    // 3. Retorna sucesso e o número de linhas afetadas
    res.status(200).json({
      success: true,
      message: `${result.affectedRows} notificações marcadas como lidas.`
    });

  } catch (error) {
    console.error("Erro ao marcar notificações como lidas:", error.message);
    res.status(500).json({ error: "Erro interno do servidor ao atualizar notificações." });
  } finally {
    if (connection) connection.release();
  }
};

const listarNotificacoes = async (req, res) => {
  let connection;
  try {
    // 1. Obtém o ID do usuário
    // ASSUMINDO que o Front-end envia o ID do usuário via Query Parameter.
    const userId = req.query.id_usuario;

    if (!userId) {
      return res.status(400).json({ error: "ID do usuário é obrigatório." });
    }

    connection = await pool.getConnection();

    // 2. Consulta SQL: Retorna todas as notificações, ordenadas da mais nova para a mais antiga.
    const [notifications] = await connection.execute(
      `SELECT 
                id, 
                titulo, 
                corpo, 
                lida, 
                data_criacao 
             FROM notificacoes 
             WHERE id_usuario = ? 
             ORDER BY data_criacao DESC`,
      [userId]
    );

    // 3. Retorna a lista de notificações
    res.status(200).json(notifications);

  } catch (error) {
    console.error("Erro ao listar notificações:", error.message);
    res.status(500).json({ error: "Erro interno do servidor ao buscar notificações." });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  sendNotification,
  marcarLidas,
  listarNotificacoes
};