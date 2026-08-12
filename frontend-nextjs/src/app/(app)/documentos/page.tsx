'use client';
import React, { useEffect, useState } from 'react';
import useAlerts from '@/hooks/useAlerts';
interface Documento {
    id: number;
    nome_original: string;
    caminho_arquivo: string;
    url: string;
    data_upload: string;
    tipo_acesso: 'publico' | 'privado';
}
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export default function DocumentosPage() {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [novoTipoAcesso, setNovoTipoAcesso] =
        useState<'publico' | 'privado'>('privado');
    const [userId, setUserId] = useState<string | null>(null);
    const {
        successToast,
        errorAlert,
        confirmAction
    } = useAlerts();
    const getValidToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token || token === 'null' || token === 'undefined') {
            return null;
        }
        return token;
    };
    const handleTipoAcessoChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNovoTipoAcesso(
            e.target.value as 'publico' | 'privado'
        );
    };
    const fetchDocumentos = async (currentUserId: string) => {
        const token = getValidToken();
        if (!token) {
            setError('Autenticação necessária.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(
                `${API_BASE_URL}/documentos_corporativos?userId=${currentUserId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Erro ao carregar documentos.');
            }
            const data: Documento[] = await response.json();
            setDocumentos(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            errorAlert(
                message,
                'Falha na Busca'
            );
        } finally {
            setLoading(false);
        }
    };
    const handleUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        const token = getValidToken();
        if (!file || !userId || !token) {
            return;
        }
        const confirmed = await confirmAction(
            'Upload de Arquivo',
            `Deseja enviar "${file.name}" para o servidor?`
        );
        if (!confirmed) {
            event.target.value = '';
            return;
        }
        const formData = new FormData();
        formData.append('documento', file);
        formData.append('tipo_acesso', novoTipoAcesso);
        formData.append('id_usuario', userId);
        try {
            const response = await fetch(
                `${API_BASE_URL}/documentos_corporativos/upload`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );
            if (!response.ok) {
                throw new Error('Falha no upload.');
            }
            successToast(
                'Upload realizado com sucesso!'
            );
            fetchDocumentos(userId);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            errorAlert(
                message,
                'Erro no Upload'
            );
        } finally {
            event.target.value = '';
        }
    };
    const handleDelete = async (id: number) => {
        const token = getValidToken();
        const confirmed = await confirmAction(
            'Atenção!',
            'Tem certeza que deseja excluir este documento permanentemente?'
        );
        if (!confirmed || !token || !userId) {
            return;
        }
        try {
            const response = await fetch(
                `${API_BASE_URL}/documentos_corporativos/delete`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        document_ids: [id],
                        userId: userId
                    })
                }
            );
            const result = await response.json();
            if (!response.ok) {
                throw new Error(
                    result.error || 'Erro ao excluir.'
                );
            }
            successToast(
                'Arquivo removido.'
            );
            fetchDocumentos(userId);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            errorAlert(
                message,
                'Erro ao Excluir'
            );
        }
    };
    const handleDeleteSelected = async () => {
        if (selectedDocumentId) {
            await handleDelete(
                selectedDocumentId
            );
            setSelectedDocumentId(null);
        } else {
            errorAlert(
                'Por favor, selecione um documento na lista antes de clicar em excluir.',
                'Seleção Necessária'
            );
        }
    };
    const handleSelectDocument = (id: number) => {
        const doc = documentos.find(
            d => d.id === id
        );
        if (id === selectedDocumentId) {
            setSelectedDocumentId(null);
            setNovoTipoAcesso('privado');
        } else if (doc) {
            setSelectedDocumentId(id);
            setNovoTipoAcesso(
                doc.tipo_acesso.toLowerCase() as
                'publico' | 'privado'
            );
        }
    };
    const handleOpenDocument = (doc: Documento) => {
        if (doc.url) {
            console.log(
                'Abrindo documento via:',
                doc.url
            );
            window.open(
                doc.url,
                '_blank'
            );
        } else {
            errorAlert(
                'URL do documento não encontrada.',
                'Erro'
            );
        }
    };
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentUserId =
                localStorage.getItem('userId');
            const token =
                getValidToken();
            if (currentUserId && token) {
                setUserId(currentUserId);
                fetchDocumentos(
                    currentUserId
                );
            } else {
                setError(
                    'Autenticação necessária.'
                );
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
                <p className="text-sm text-slate-500">
                    Carregando documentos...
                </p>
            </div>
        );
    }
    return (
        <div className="w-full min-w-0">
            <div className="w-full min-w-0 rounded-lg bg-white p-4 shadow-sm md:p-5">
                {/* =========================================
                    TÍTULO
                ========================================== */}
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-slate-600">
                        Documentos Corporativos
                    </h2>
                </div>
                {/* =========================================
                    ERRO
                ========================================== */}
                {error && (
                    <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2">
                        <p className="text-xs text-red-600">
                            {error}
                        </p>
                    </div>
                )}
                {/* =========================================
                    TIPO DE ACESSO
                ========================================== */}
                <div className="mb-4 flex items-center gap-6 border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-600">
                        Tipo de acesso:
                    </span>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                        <input
                            type="radio"
                            value="publico"
                            checked={
                                novoTipoAcesso === 'publico'
                            }
                            onChange={
                                handleTipoAcessoChange
                            }
                            className="h-3.5 w-3.5 accent-blue-600"
                        />
                        Público
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                        <input
                            type="radio"
                            value="privado"
                            checked={
                                novoTipoAcesso === 'privado'
                            }
                            onChange={
                                handleTipoAcessoChange
                            }
                            className="h-3.5 w-3.5 accent-blue-600"
                        />
                        Privado
                    </label>
                </div>
                {/* =========================================
                    LISTA DE DOCUMENTOS
                ========================================== */}
                <div className="w-full min-w-0 overflow-hidden rounded border border-slate-200">
                    {/* CABEÇALHO */}
                    <div className="grid grid-cols-[minmax(0,1fr)_180px] border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                        <span className="min-w-0">
                            Nome
                        </span>
                        <span>
                            Data / Hora
                        </span>
                    </div>
                    {/* LISTA COM SCROLL INTERNO */}
                    <div className="h-[calc(100vh-300px)] min-h-[250px] overflow-y-auto">
                        {documentos.length > 0 ? (
                            documentos.map(doc => {
                                const isSelected =
                                    doc.id ===
                                    selectedDocumentId;
                                return (
                                    <div
                                        key={doc.id}
                                        onClick={() =>
                                            handleSelectDocument(
                                                doc.id
                                            )
                                        }
                                        onDoubleClick={() =>
                                            handleOpenDocument(
                                                doc
                                            )
                                        }
                                        className={`grid cursor-pointer grid-cols-[minmax(0,1fr)_180px] items-center border-b border-slate-100 px-3 py-2 text-xs transition-colors ${isSelected
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-white text-slate-700 hover:bg-blue-50'
                                            }`}
                                    >
                                        <span className="min-w-0 truncate pr-3">
                                            {
                                                doc.nome_original
                                            }
                                        </span>
                                        <span className="whitespace-nowrap text-slate-500">
                                            {
                                                doc.data_upload
                                            }
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
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* UPLOAD */}
                    <label className="inline-flex h-8 cursor-pointer items-center rounded bg-blue-400 px-3 text-xs font-semibold text-white transition hover:bg-blue-700">
                        Upload Documento
                        <input
                            type="file"
                            onChange={handleUpload}
                            className="hidden"
                        />
                    </label>
                    {/* EXCLUIR */}
                    <button
                        type="button"
                        onClick={
                            handleDeleteSelected
                        }
                        disabled={
                            !selectedDocumentId
                        }
                        className="h-8 rounded bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Excluir Selecionado
                    </button>
                </div>
                {/* =========================================
                    INFORMAÇÃO
                ========================================== */}
                <div className="mt-3">
                    <p className="text-[11px] text-slate-400">
                        Clique uma vez para selecionar um documento.
                        Dê duplo clique para abrir.
                    </p>
                </div>
            </div>
        </div>
    );
}
