"use client";

import type {
    ChangeEventHandler,
    Dispatch,
    FormEventHandler,
    RefObject,
    SetStateAction,
} from "react";
import { IMaskInput } from "react-imask";

interface ClienteCompacto {
    id: string;
    nome: string;
    celular: string;
}

interface PdfCompacto {
    id: string;
    nome_arquivo: string;
    data: string;
    url: string;
}

interface FormDataCompacto {
    nome: string;
    email: string;
    celular: string;
    tipo_acesso: "publico" | "privado";
}

interface ProcuracaoCompacta {
    id: number;
    nome_original: string;
}

interface ClientesTelaCompactaProps<

    TCliente extends ClienteCompacto,
    TPdf extends PdfCompacto,
    TFormData extends FormDataCompacto,
> {
    fileName: string;
    handleDelete: () => void | Promise<void>;
    error: string | null;
    tipoCliente: "fisica" | "juridica";
    setTipoCliente: Dispatch<SetStateAction<"fisica" | "juridica">>;
    formData: TFormData;
    setFormData: Dispatch<SetStateAction<TFormData>>;
    celularMask: string;
    isMobileSaving: boolean;
    handleMobileSubmit: FormEventHandler<HTMLFormElement>;
    handleLimpar: () => void;
    searchTerm: string;
    handleSearch: ChangeEventHandler<HTMLInputElement>;
    isLoading: boolean;
    clientes: TCliente[];
    selectedClienteId: string | null;
    handleClienteSelect: (cliente: TCliente) => void;
    setSelectedLinkType: Dispatch<SetStateAction<string>>;
    setProcuracaoSelecionada: Dispatch<SetStateAction<string | null>>;
    setShowProcuracaoList: Dispatch<SetStateAction<boolean>>;
    setShowLinkOptions: Dispatch<SetStateAction<boolean>>;
    setProcuracaoList: Dispatch<SetStateAction<ProcuracaoCompacta[]>>;
    linkGerado: string | null;
    handleCopyLink: () => void;
    linkRef: RefObject<HTMLInputElement | null>;
    linkProcuracao: string | null;
    handleCopyProcuracaoLink: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileChange: ChangeEventHandler<HTMLInputElement>;
    pdfs: TPdf[];
    selectedPdfId: string | null;
    handlePdfClick: (pdf: TPdf) => void;
    formatarData: (dataString: string) => string;
    handleEnviarParaZapsign: (
        pdfId: string,
        documentoNome: string,
    ) => void | Promise<void>;
    showLinkOptions: boolean;
    selectedLinkType: string;
    procuracaoList: ProcuracaoCompacta[];
    procuracaoSelecionada: string | null;
    handleGerarLink: (
        tipo: string,
        procuracaoNome?: string | null,
    ) => void | Promise<void>;
}

export default function ClientesTelaCompacta<
    TCliente extends ClienteCompacto,
    TPdf extends PdfCompacto,
    TFormData extends FormDataCompacto,
>({
    error,
    tipoCliente,
    setTipoCliente,
    formData,
    setFormData,
    celularMask,
    isMobileSaving,
    handleMobileSubmit,
    handleLimpar,
    searchTerm,
    handleSearch,
    isLoading,
    clientes,
    selectedClienteId,
    handleClienteSelect,
    setSelectedLinkType,
    setProcuracaoSelecionada,
    setShowProcuracaoList,
    setShowLinkOptions,
    setProcuracaoList,
    linkGerado,
    handleCopyLink,
    linkRef,
    linkProcuracao,
    handleCopyProcuracaoLink,
    fileInputRef,
    handleFileChange,
    pdfs,
    selectedPdfId,
    handlePdfClick,
    formatarData,
    handleEnviarParaZapsign,
    showLinkOptions,
    selectedLinkType,
    procuracaoList,
    procuracaoSelecionada,
    handleGerarLink,
    handleDelete,
    fileName
}: ClientesTelaCompactaProps<TCliente, TPdf, TFormData>) {
    return (
        <div className="w-full lg:hidden">
            <div className="mx-auto w-full max-w-2xl space-y-3">
                {/* CABEÇALHO */}
                <section className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="mb-3">
                        <h2 className="text-lg font-semibold text-slate-700">Clientes</h2>
                    </div>
                    {error && (
                        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                            {error}
                        </p>
                    )}
                    {/* =================================================
        1. CADASTRO RÁPIDO
        ================================================== */}
                    <form onSubmit={handleMobileSubmit}>
                        {/* TIPO DO CLIENTE */}
                        <div className="mb-3">
                            <p className="mb-2 text-xs font-semibold text-slate-600">
                                Tipo de Cliente
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                <label
                                    className={`flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-[11px] font-semibold transition ${tipoCliente === "fisica"
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-white text-slate-600"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="tipoClienteMobile"
                                        value="fisica"
                                        checked={tipoCliente === "fisica"}
                                        onChange={() => {
                                            handleLimpar();
                                            setTipoCliente("fisica");
                                        }}
                                        className="sr-only"
                                    />
                                    Pessoa Física
                                </label>
                                <label
                                    className={`flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-[11px] font-semibold transition ${tipoCliente === "juridica"
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-white text-slate-600"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="tipoClienteMobile"
                                        value="juridica"
                                        checked={tipoCliente === "juridica"}
                                        onChange={() => {
                                            handleLimpar();
                                            setTipoCliente("juridica");
                                        }}
                                        className="sr-only"
                                    />
                                    Pessoa Jurídica
                                </label>
                            </div>
                        </div>
                        {/* TIPO DE ACESSO */}
                        <div className="mb-3">
                            <p className="mb-2 text-xs font-semibold text-slate-600">
                                Tipo de Acesso
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                <label
                                    className={`flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-[11px] font-semibold transition ${formData.tipo_acesso === "publico"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-slate-200 bg-white text-slate-600"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="tipoAcessoMobile"
                                        value="publico"
                                        checked={formData.tipo_acesso === "publico"}
                                        onChange={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                tipo_acesso: "publico",
                                            }))
                                        }
                                        className="sr-only"
                                    />
                                    Público
                                </label>
                                <label
                                    className={`flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-[11px] font-semibold transition ${formData.tipo_acesso === "privado"
                                            ? "border-slate-600 bg-slate-100 text-slate-800"
                                            : "border-slate-200 bg-white text-slate-600"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="tipoAcessoMobile"
                                        value="privado"
                                        checked={formData.tipo_acesso === "privado"}
                                        onChange={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                tipo_acesso: "privado",
                                            }))
                                        }
                                        className="sr-only"
                                    />
                                    Privado
                                </label>
                            </div>
                        </div>
                        {/* NOME / RAZÃO SOCIAL */}
                        <div className="mb-3">
                            <label
                                htmlFor="nome-mobile"
                                className="mb-1 block text-xs font-medium text-slate-600"
                            >
                                {tipoCliente === "fisica" ? "Nome Completo" : "Razão Social"}
                            </label>
                            <input
                                id="nome-mobile"
                                type="text"
                                value={formData.nome}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        nome: e.target.value,
                                    }))
                                }
                                placeholder={
                                    tipoCliente === "fisica" ? "Nome completo" : "Razão social"
                                }
                                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        {/* E-MAIL */}
                        <div className="mb-3">
                            <label
                                htmlFor="email-mobile"
                                className="mb-1 block text-xs font-medium text-slate-600"
                            >
                                E-mail
                            </label>
                            <input
                                id="email-mobile"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                placeholder="cliente@email.com"
                                autoCapitalize="none"
                                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        {/* CELULAR */}
                        <div className="mb-4">
                            <label
                                htmlFor="celular-mobile"
                                className="mb-1 block text-xs font-medium text-slate-600"
                            >
                                Celular
                            </label>
                            <IMaskInput
                                mask={celularMask}
                                id="celular-mobile"
                                type="tel"
                                value={formData.celular}
                                placeholder="(00) 00000-0000"
                                onAccept={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        celular: String(value),
                                    }))
                                }
                                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        {/* BOTÕES */}
                        <div className="grid grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={handleLimpar}
                                disabled={isMobileSaving}
                                className="h-9 rounded-md bg-slate-200 px-3 text-xs font-semibold text-slate-700 transition active:scale-[0.98] disabled:opacity-50"
                            >
                                Limpar
                            </button>
                            <button
                                type="submit"
                                disabled={isMobileSaving}
                                className="h-9 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isMobileSaving ? "Salvando..." : "Salvar Cliente"}
                            </button>
                        </div>
                    </form>
                </section>
                {/* =================================================
        2. CLIENTES CADASTRADOS
        ================================================== */}
                <section className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-slate-700">
                            Clientes cadastrados
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Selecione um cliente para continuar o atendimento.
                        </p>
                    </div>
                    <input
                        type="text"
                        id="client-search-input-mobile"
                        className="mb-2.5 h-9 w-full rounded-md border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Pesquisar por nome ou CPF/CNPJ..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div className="max-h-[300px] space-y-1.5 overflow-y-auto pr-0.5">
                        {isLoading ? (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                                Carregando clientes...
                            </div>
                        ) : error ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-4 text-center text-xs text-red-600">
                                Erro ao carregar clientes: {error}
                            </div>
                        ) : clientes.length > 0 ? (
                            clientes.map((cliente, index) => (
                                <button
                                    key={cliente.id ? cliente.id : `mobile-juridica-${index}`}
                                    type="button"
                                    onClick={() => handleClienteSelect(cliente)}
                                    className={`w-full rounded-lg border px-3 py-2 text-left transition active:scale-[0.99] ${selectedClienteId === cliente.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-slate-700">
                                                {cliente.nome}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                {cliente.celular || "Celular não informado"}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                                            ID {cliente.id}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                                Nenhum cliente encontrado.
                            </div>
                        )}
                    </div>
                </section>
                {/* =================================================
        3. AÇÕES DO CLIENTE SELECIONADO
        ================================================== */}
                {selectedClienteId && (
                    <section className="rounded-lg bg-white p-3 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-slate-700">
                                Ações do cliente
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedLinkType("cadastro");
                                    setProcuracaoSelecionada("");
                                    setShowProcuracaoList(false);
                                    setShowLinkOptions(true);
                                }}
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-center transition active:scale-[0.99]"
                            >
                                <span className="block text-xs font-semibold text-blue-700">
                                    Link de Cadastro
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    setSelectedLinkType("procuracao");
                                    setProcuracaoSelecionada("");
                                    try {
                                        const token = localStorage.getItem("authToken");
                                        if (!token) {
                                            console.error("Token não encontrado no localStorage");
                                            return;
                                        }
                                        const cleanToken = token.replace(/['"]+/g, "").trim();
                                        const response = await fetch(
                                            `${process.env.NEXT_PUBLIC_BACKEND_URL}/documentos/procuracao`,
                                            {
                                                method: "GET",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    Authorization: `Bearer ${cleanToken}`,
                                                },
                                            },
                                        );
                                        if (!response.ok) {
                                            const errorData = await response.json();
                                            console.error("Erro retornado pelo backend:", errorData);
                                            throw new Error(`Erro ${response.status}`);
                                        }
                                        const data = await response.json();
                                        setProcuracaoList(data);
                                        setShowProcuracaoList(true);
                                        setShowLinkOptions(true);
                                    } catch (error) {
                                        console.error("Erro ao carregar procurações:", error);
                                        alert("Erro ao carregar documentos de procuração.");
                                    }
                                }}
                                className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2.5 text-center transition active:scale-[0.99]"
                            >
                                <span className="block text-xs font-semibold text-purple-700">
                                    Criar Procuração
                                </span>
                            </button>
                        </div>
                        {/* LINK DE CADASTRO */}
                        {linkGerado && (
                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                                <p className="text-xs font-semibold text-blue-700">
                                    Link de Cadastro
                                </p>
                                <a
                                    href={linkGerado}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 block break-all text-xs leading-5 text-blue-600 underline-offset-2 hover:underline"
                                >
                                    {linkGerado}
                                </a>
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="mt-3 h-10 w- rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white active:scale-[0.99]"
                                >
                                    Copiar Link de Cadastro
                                </button>
                                <input
                                    type="text"
                                    ref={linkRef}
                                    defaultValue={linkGerado}
                                    className="absolute left-[-9999px]"
                                />
                            </div>
                        )}
                        {/* LINK DA PROCURAÇÃO / ASSINATURA */}
                        {linkProcuracao && (
                            <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50 p-3">
                                <p className="text-xs font-semibold text-purple-700">
                                    Link da Assinatura
                                </p>
                                <a
                                    href={linkProcuracao}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 block break-all text-xs leading-5 text-purple-600 underline-offset-2 hover:underline"
                                >
                                    {linkProcuracao}
                                </a>
                                <button
                                    type="button"
                                    onClick={handleCopyProcuracaoLink}
                                    className="mt-3 h-10 rounded-lg bg-purple-600 px-3 text-xs font-semibold text-white active:scale-[0.99]"
                                >
                                    Copiar Link da Procuração
                                </button>
                            </div>
                        )}
                    </section>
                )}
                {/* =================================================
        4. ARQUIVOS / PROCURAÇÃO / ZAPSIGN
        ================================================== */}
                {selectedClienteId && (
                    <section className="rounded-lg bg-white p-3 shadow-sm">
                        <div className="mb-3">
                            <h3 className="mb-3 text-sm font-semibold text-slate-700">
                                Arquivos do Cliente
                            </h3>

                            <div className="grid grid-cols-3 gap-2">
                                <label
                                    htmlFor="pdf-upload-mobile"
                                    className="flex cursor-pointer items-center justify-center rounded-md bg-slate-500 px-2 py-2 text-xs font-semibold text-white transition active:scale-[0.99]"
                                >
                                    Arquivo
                                </label>

                                <button
                                    type="submit"
                                    form="clienteForm"
                                    className="cursor-pointer rounded-md bg-blue-400 px-2 py-2 text-xs font-semibold text-slate-700 transition active:scale-[0.99]"
                                >
                                    Atualizar
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="cursor-pointer rounded-md bg-red-500 px-2 py-2 text-xs font-semibold text-white transition active:scale-[0.99]"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                        {/* INPUT ESCONDIDO */}
                        <input
                            id="pdf-upload-mobile"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {fileName && (
                            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                                <p className="text-[11px] font-semibold text-blue-700">
                                    Arquivo selecionado:
                                </p>

                                <p className="mt-1 break-words text-xs text-slate-700">
                                    {fileName}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-500">
                                    Clique em Atualizar para enviar o arquivo.
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            {pdfs.length > 0 ? (
                                pdfs.map((pdf) => {
                                    const nomeNormalizado = pdf.nome_arquivo
                                        .normalize("NFD")
                                        .replace(/[\u0300-\u036f]/g, "")
                                        .toLowerCase();
                                    const isProcuracao = nomeNormalizado.includes("procuracao");
                                    return (
                                        <div
                                            key={pdf.id}
                                            onClick={() => handlePdfClick(pdf)}
                                            className={`rounded-lg border px-3 py-2.5 transition ${selectedPdfId === pdf.id
                                                    ? "border-blue-400 bg-blue-50"
                                                    : "border-slate-200 bg-white"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="break-words text-xs font-semibold text-slate-700">
                                                        {pdf.nome_arquivo}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                                        {formatarData(pdf.data)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                                                <a
                                                    href={pdf.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex h-9 items-center justify-center rounded-md bg-blue-200 px-2 text-[11px] font-semibold text-slate-700 transition active:scale-[0.99]"
                                                >
                                                    Abrir Arquivo
                                                </a>
                                                {isProcuracao && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleEnviarParaZapsign(pdf.id, pdf.nome_arquivo);
                                                        }}
                                                        className="h-9 rounded-md bg-orange-500 px-2 text-[11px] font-semibold text-white transition active:scale-[0.99]"
                                                    >
                                                        Enviar ZapSign
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                                    Nenhum arquivo encontrado para este cliente.
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {/* =================================================
        MODAL MOBILE - LINK / PROCURAÇÃO
        ================================================== */}
                {showLinkOptions && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
                        <div className="max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-5">
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-slate-800">
                                    {selectedLinkType === "procuracao"
                                        ? "Escolha a procuração"
                                        : "Gerar link de cadastro"}
                                </h4>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    {selectedLinkType === "procuracao"
                                        ? "Selecione o modelo que será gerado para este cliente."
                                        : "Confirme para gerar um novo link de cadastro."}
                                </p>
                            </div>
                            {selectedLinkType === "procuracao" ? (
                                <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                                    {procuracaoList.length > 0 ? (
                                        procuracaoList.map(
                                            (procuracao: { id: number; nome_original: string }) => (
                                                <label
                                                    key={procuracao.id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-xs transition ${procuracaoSelecionada === procuracao.nome_original
                                                            ? "border-purple-500 bg-purple-50 text-purple-700"
                                                            : "border-slate-200 text-slate-700"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="procuracao_type_mobile"
                                                        value={procuracao.nome_original}
                                                        checked={
                                                            procuracaoSelecionada === procuracao.nome_original
                                                        }
                                                        onChange={(e) =>
                                                            setProcuracaoSelecionada(e.target.value)
                                                        }
                                                        className="h-4 w-4 accent-purple-600"
                                                    />
                                                    <span className="break-words">
                                                        {procuracao?.nome_original
                                                            ?.replace("procuracao_", "")
                                                            .replace(".pdf", "")
                                                            .replace(".html", "")}
                                                    </span>
                                                </label>
                                            ),
                                        )
                                    ) : (
                                        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                                            Nenhum documento de procuração encontrado.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3">
                                    <p className="text-xs leading-5 text-blue-700">
                                        O link será associado ao cliente selecionado e poderá ser
                                        enviado para ele completar o cadastro.
                                    </p>
                                </div>
                            )}
                            <div className="mt-5 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLinkOptions(false);
                                        setShowProcuracaoList(false);
                                    }}
                                    className="h-11 rounded-lg bg-slate-200 px-4 text-sm font-semibold text-slate-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (
                                            selectedLinkType === "cadastro" ||
                                            (selectedLinkType === "procuracao" &&
                                                procuracaoSelecionada)
                                        ) {
                                            handleGerarLink(selectedLinkType, procuracaoSelecionada);
                                            setShowLinkOptions(false);
                                            setShowProcuracaoList(false);
                                        } else {
                                            alert("Selecione uma procuração para continuar.");
                                        }
                                    }}
                                    className="h-11 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
                                >
                                    {selectedLinkType === "procuracao"
                                        ? "Gerar Procuração"
                                        : "Gerar Link"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}