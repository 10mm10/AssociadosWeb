import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import tableStyles from "../assets/styles/tableStyles";
import pdfTableStyles from "../assets/styles/pdfTableStyles";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store'; // 🚨 1. Importação necessária


// Chave usada no LoginScreen.js
const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

export default function PdfTable({
  cliente,
  setPdfSelecionado,
  pdfSelecionado,
  onAddPdfPress,
  pdfRefreshKey
}) {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🚨 2. Função Auxiliar para obter o Token
  const getAuthToken = async () => {
    let token;
    try {
      token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch (e) {
      Alert.alert("Erro de Autenticação", "Falha ao ler o token de acesso.");
      return null;
    }
    if (!token) {
      setError("Sessão Expirada. Faça login novamente.");
      return null;
    }
    return token;
  };

  useEffect(() => {
    const fetchPdfs = async () => {
      if (!cliente || !cliente.id) {
        setPdfs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      // 🚨 3. Obter o token
      const token = await getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;
        const url = `${backendUrl}/clientes/${cliente.id}/pdfs`;
        
        // 🚨 4. Adicionar o cabeçalho Authorization
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          let errorMsg = `Erro ao buscar PDFs: ${response.status} ${response.statusText}`;
          try {
            const errorBody = await response.json();
            errorMsg = errorBody.error || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setPdfs(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
        console.error("Erro ao buscar PDFs:", e);
      } finally {
        setLoading(false);
        setPdfSelecionado(null);
      }
    };

    fetchPdfs();
  }, [cliente, pdfRefreshKey, setPdfSelecionado]); // setPdfSelecionado adicionado para evitar warning

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0A789B" style={{ marginTop: 20 }} />;
    }

    if (error) {
      return <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>Erro: {error}</Text>;
    }

    if (!pdfs || pdfs.length === 0) {
      return (
        <Text style={{ color: "#888", textAlign: "center", marginTop: 10 }}>
          Nenhum PDF encontrado para este cliente.
        </Text>
      );
    }

    return (
      <View>
        {pdfs.map((pdf) => {
          if (!pdf || !pdf.id) return null;

          return (
            <View
              key={pdf.id.toString()}
              style={[
                pdfTableStyles.pdfRow,
                pdfSelecionado &&
                  pdfSelecionado.id === pdf.id &&
                  pdfTableStyles.selectedRow,
              ]}
            >
              <TouchableOpacity
                onPress={() => setPdfSelecionado(pdf)}
                onLongPress={() => setPdfSelecionado(pdf)}
                style={pdfTableStyles.selectionContainer}
              >
                <Text style={[pdfTableStyles.pdfCell, { textAlign: "left" }]}>
                  {pdf.nome_arquivo || "Sem nome"}
                </Text>

                <Text style={[pdfTableStyles.pdfCell, { textAlign: "center" }]}>
                  {pdf.data_upload_formatted || "-"}
                </Text>
              </TouchableOpacity>

              {pdf.url ? (
                <TouchableOpacity
                  onPress={() =>
                    WebBrowser.openBrowserAsync(`${pdf.url}?t=${Date.now()}`)
                  }
                  style={pdfTableStyles.iconButton}
                >
                  <MaterialCommunityIcons
                    name="file-download"
                    size={24}
                    color="#0A789B"
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ marginTop: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={[pdfTableStyles.pdfTitle, { flex: 1 }]}>
          Arquivos de {cliente?.nome || "Usuário"}
        </Text>

        <TouchableOpacity onPress={onAddPdfPress} style={tableStyles.addButton}>
          <Ionicons name="add" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={tableStyles.headerRow}>
        <Text style={[tableStyles.headerCell, { flex: 5 }]}>
          Nome do Arquivo
        </Text>
        <Text style={[tableStyles.headerCell, { flex: 2 }]}>Data</Text>
        <Text style={[tableStyles.headerCell, { flex: 1 }]}>Ver</Text>
      </View>

      {renderContent()}
    </View>
  );
}
