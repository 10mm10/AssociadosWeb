import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import PdfTable from './PdfTable'; 
import clienteDetalhesStyles from '../assets/styles/clienteDetalhesStyles';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';


export default function ClienteDetalhes({ cliente, onVoltar }) {
  const [pdfSelecionado, setPdfSelecionado] = useState(null);
  const [linkGerado, setLinkGerado] = useState(null);
  const [linkLoading, setLinkLoading] = useState(false);

  const handleSendToZapsign = async () => {
    if (!pdfSelecionado || !cliente) return;
    setLinkLoading(true);

    const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;
    try {
      const response = await fetch(`${backendUrl}/enviar-para-zapsign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          clienteId: cliente.id, 
          documentoNome: pdfSelecionado.nome_arquivo 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar para o Zapsign.');
      }

      setLinkGerado(result.zapsignUrl);
      alert('Documento enviado para o Zapsign com sucesso!');
      setPdfSelecionado(null);
    } catch (error) {
      alert(`Erro ao enviar para o Zapsign: ${error.message}`);
    } finally {
      setLinkLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (linkGerado) {
      await Clipboard.setStringAsync(linkGerado);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <View style={clienteDetalhesStyles.container}>
      <TouchableOpacity onPress={onVoltar} style={clienteDetalhesStyles.voltarButton}>
        <Ionicons name="arrow-back" size={24} color="#0A789B" />
        <Text style={clienteDetalhesStyles.voltarText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={clienteDetalhesStyles.headerTitle}>Detalhes do Cliente: {cliente.nome}</Text>
      
      {/* Botões de Ação */}
      <View style={clienteDetalhesStyles.actionButtonContainer}>
        {pdfSelecionado && (
          <TouchableOpacity
            style={clienteDetalhesStyles.zapsignButton}
            onPress={handleSendToZapsign}
            disabled={linkLoading}
          >
            {linkLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={clienteDetalhesStyles.buttonText}>Enviar para Zapsign</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {linkGerado ? (
        <View style={clienteDetalhesStyles.linkContainer}>
          <Text style={clienteDetalhesStyles.linkTitle}>Link de Assinatura:</Text>
          <Text style={clienteDetalhesStyles.linkUrl}>{linkGerado}</Text>
          <TouchableOpacity onPress={copyToClipboard} style={clienteDetalhesStyles.copyButton}>
            <Ionicons name="copy" size={20} color="#0A789B" />
            <Text style={clienteDetalhesStyles.copyButtonText}>Copiar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <PdfTable 
          cliente={cliente} 
          setPdfSelecionado={setPdfSelecionado} 
          pdfSelecionado={pdfSelecionado} 
        />
      )}
    </View>
  );
}