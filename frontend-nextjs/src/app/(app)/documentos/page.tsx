"use client";
import React, { useEffect, useState } from "react";
import useAlerts from "@/hooks/useAlerts";
interface Documento {
  id: number;
  nome_original: string;
  caminho_arquivo: string;
  url: string;
  data_upload: string;
  tipo_acesso: "publico" | "privado";
}
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null,
  );
  const [novoTipoAcesso, setNovoTipoAcesso] = useState<"publico" | "privado">(
    "privado",
  );
  const [userId, setUserId] = useState<string | null>(null);
  const { successToast, errorAlert, confirmAction } = useAlerts();
  const getValidToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token || token === "null" || token === "undefined") {
      return null;
    }
    return token;
  };
  const handleTipoAcessoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovoTipoAcesso(e.target.value as "publico" | "privado");
  };
  const fetchDocumentos = async (currentUserId: string) => {
    const token = getValidToken();
    if (!token) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/documentos_corporativos?userId=${currentUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar documentos.");
      }
      const data: Documento[] = await response.json();
      setDocumentos(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      errorAlert(message, "Falha na Busca");
    } finally {
      setLoading(false);
    }
  };
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const token = getValidToken();
    if (!file || !userId || !token) {
      return;
    }
    const confirmed = await confirmAction(
      "Upload de Arquivo",
      `Deseja enviar "${file.name}" para o servidor?`,
    );
    if (!confirmed) {
      event.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("documento", file);
    formData.append("tipo_acesso", novoTipoAcesso);
    formData.append("id_usuario", userId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/documentos_corporativos/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error("Falha no upload.");
      }
      successToast("Upload realizado com sucesso!");
      fetchDocumentos(userId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errorAlert(message, "Erro no Upload");
    } finally {
      event.target.value = "";
    }
  };
  const handleDelete = async (id: number) => {
    const token = getValidToken();
    const confirmed = await confirmAction(
      "Atenção!",
      "Tem certeza que deseja excluir este documento permanentemente?",
    );
    if (!confirmed || !token || !userId) {
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/documentos_corporativos/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_ids: [id],
            userId: userId,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erro ao excluir.");
      }
      successToast("Arquivo removido.");
      fetchDocumentos(userId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errorAlert(message, "Erro ao Excluir");
    }
  };
  const handleDeleteSelected = async () => {
    if (selectedDocumentId) {
      await handleDelete(selectedDocumentId);
      setSelectedDocumentId(null);
    } else {
      errorAlert(
        "Por favor, selecione um documento na lista antes de clicar em excluir.",
        "Seleção Necessária",
      );
    }
  };
  const handleSelectDocument = (id: number) => {
    const doc = documentos.find((d) => d.id === id);
    if (id === selectedDocumentId) {
      setSelectedDocumentId(null);
      setNovoTipoAcesso("privado");
    } else if (doc) {
      setSelectedDocumentId(id);
      setNovoTipoAcesso(doc.tipo_acesso.toLowerCase() as "publico" | "privado");
    }
  };
  const handleOpenDocument = (doc: Documento) => {
    if (doc.url) {
      console.log("Abrindo documento via:", doc.url);
      window.open(doc.url, "_blank");
    } else {
      errorAlert("URL do documento não encontrada.", "Erro");
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUserId = localStorage.getItem("userId");
      const token = getValidToken();
      if (currentUserId && token) {
        setUserId(currentUserId);
        fetchDocumentos(currentUserId);
      } else {
        setError("Autenticação necessária.");
        setLoading(false);
      }
    }
  }, []);
  /* =========================================
       LOADING
    ========================================== */
  if (loading) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center">
        <p className="text-sm text-slate-500">Carregando documentos...</p>
      </div>
    );
  }
  return (
    <div className="h-[calc(100dvh-5rem)] w-full min-w-0  lg:h-auto lg:overflow-visible">
      <div className="flex h-full w-full min-w-0 flex-col rounded-lg bg-white p-3 shadow-sm sm:p-4 md:p-5 lg:block lg:h-auto">
        {/* =========================================
                    TÍTULO
                ========================================== */}
        <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
          <h2 className="min-w-0 text-lg font-semibold leading-tight text-slate-600 sm:text-xl">
            Documentos Corporativos
          </h2>
        </div>
        {/* =========================================
                    ERRO
                ========================================== */}
        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        {/* =========================================
                    TIPO DE ACESSO
                ========================================== */}
        <div className="mb-3 grid grid-cols-2 gap-1.5 border-b border-slate-100 pb-3 lg:flex lg:items-center lg:gap-3">
          <span className="col-span-2 text-xs font-semibold text-slate-600 lg:col-span-1">
            Tipo de acesso:
          </span>
          <label
            className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition ${
              novoTipoAcesso === "publico"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <input
              type="radio"
              value="publico"
              checked={novoTipoAcesso === "publico"}
              onChange={handleTipoAcessoChange}
              className="sr-only"
            />
            Público
          </label>
          <label
            className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition ${
              novoTipoAcesso === "privado"
                ? "border-slate-600 bg-slate-100 text-slate-800"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <input
              type="radio"
              value="privado"
              checked={novoTipoAcesso === "privado"}
              onChange={handleTipoAcessoChange}
              className="sr-only"
            />
            Privado
          </label>
        </div>
        {/* =========================================
                    LISTA DE DOCUMENTOS
                ========================================== */}
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded border border-slate-200 lg:block">
          {/* CABEÇALHO */}
          <div className="grid grid-cols-1 border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 lg:grid-cols-[minmax(0,1fr)_180px]">
            <span className="min-w-0">Nome</span>
            <span className="hidden lg:block">Data / Hora</span>
          </div>
          {/* LISTA COM SCROLL INTERNO */}
          <div className="min-h-0 flex-1 overflow-y-auto lg:h-[calc(100vh-300px)] lg:min-h-[250px]">
            {documentos.length > 0 ? (
              documentos.map((doc) => {
                const isSelected = doc.id === selectedDocumentId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDocument(doc.id)}
                    onDoubleClick={() => handleOpenDocument(doc)}
                    className={`grid cursor-pointer grid-cols-1 border-b border-slate-100 px-3 py-2 text-xs transition-colors lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center lg:gap-0 ${
                      isSelected
                        ? "bg-blue-100 text-blue-800"
                        : "bg-white text-slate-700 hover:bg-blue-50"
                    }`}
                  >
                    <span className="min-w-0 break-words font-medium lg:truncate lg:pr-3 lg:font-normal">
                      {doc.nome_original}
                    </span>
                    <span className="hidden whitespace-nowrap text-slate-500 lg:block lg:text-xs">
                      {doc.data_upload}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex min-h-[180px] items-center justify-center">
                <p className="text-xs text-slate-500">
                  Nenhum documento encontrado.
                </p>
              </div>
            )}
          </div>
        </div>
        {/* =========================================
                    BOTÕES
                ========================================== */}
        <div className="mt-3 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center">
          {/* UPLOAD */}
          <label className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded bg-blue-400 px-2 text-center text-xs font-semibold text-white transition active:scale-[0.99] lg:h-8 lg:w-auto lg:px-3 lg:hover:bg-blue-700">
            Upload Documento
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
          {/* EXCLUIR */}
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={!selectedDocumentId}
            className="h-9 w-full rounded bg-red-600 px-2 text-xs font-semibold text-white transition active:scale-[0.99] lg:h-8 lg:w-auto lg:px-3 lg:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Excluir Selecionado
          </button>
        </div>
      </div>
    </div>
  );
}