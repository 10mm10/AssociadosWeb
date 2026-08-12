// backend-nodejs/utils/pdfLibHelper.js
const { PDFDocument } = require("pdf-lib");

/**
 * Preenche um PDF com os dados de um cliente
 * @param {Buffer} pdfBytes - PDF vindo do banco em formato Buffer
 * @param {Object} dadosCliente - Dados do cliente para preencher
 * @returns {Promise<Uint8Array>} - PDF preenchido
 */
async function preencherPdf(pdfBytes, dadosCliente) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  try {
    form.getTextField("nome_completo").setText(dadosCliente.nome || "");
  } catch {}
  try {
    form.getTextField("cpf").setText(dadosCliente.cpf || "");
  } catch {}
  try {
    form.getTextField("endereco").setText(dadosCliente.endereco || "");
  } catch {}

  form.flatten(); // trava os campos preenchidos

  const pdfFinal = await pdfDoc.save();
  return pdfFinal;
}

module.exports = { preencherPdf };
