"use client";
import React, {
    useState,
    useEffect,
    useCallback
} from "react";
import useAlerts from "@/hooks/useAlerts";
interface LogEntry {
    id: number;
    data_hora: string;
    usuario_id: number;
    nome_usuario: string;
    tipo_acao: string;
    tabela_afetada: string;
    registro_id: number | null;
    dados_antigos: string;
    status_restauracao: "ORIGINAL" | "RESTAURADO";
    nome_arquivo: string;
}
interface ErrorResponse {
    error?: string;
}
interface RestoreResponse {
    message?: string;
}
const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL;
const RESTORE_ENDPOINTS: {
    [key: string]: string;
} = {
    pdfs_unificados:
        "/admin/restaurar/pdf",
    clientes_unificados:
        "/admin/restaurar/cliente",
    documentos_corporativos:
        "/admin/restaurar/documento_corporativo",
};
const LogAuditoria: React.FC = () => {
    const {
        successToast,
        errorAlert,
        confirmAction
    } = useAlerts();
    const [logs, setLogs] =
        useState<LogEntry[]>([]);
    const [loading, setLoading] =
        useState(false);
    const [error, setError] =
        useState<string | null>(null);
    const fetchLogs =
        useCallback(async () => {
            setLoading(true);
            setError(null);
            const token =
                localStorage.getItem(
                    "authToken"
                );
            if (!token) {
                setError(
                    "Token de autenticação não encontrado. Acesso restrito."
                );
                setLoading(false);
                return;
            }
            try {
                const response =
                    await fetch(
                        `${API_BASE_URL}/admin/logs`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );
                if (!response.ok) {
                    let errorData: ErrorResponse = {
                        error:
                            `Erro desconhecido: Status ${response.status}`,
                    };
                    try {
                        errorData =
                            await response.json() as ErrorResponse;
                    } catch {
                        errorData.error =
                            `Erro do Servidor (${response.status}): Falha na resposta JSON.`;
                    }
                    throw new Error(
                        errorData.error ||
                        `Erro ao carregar logs: ${response.statusText}`
                    );
                }
                const data: LogEntry[] =
                    await response.json();
                setLogs(data);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(
                    "Erro ao buscar logs:",
                    err
                );
                setError(
                    `Falha ao carregar logs: ${message}`
                );
            } finally {
                setLoading(false);
            }
        }, []);
    const handleRestore =
        useCallback(
            async (
                logId: number,
                tabela: string
            ) => {
                const routePrefix =
                    RESTORE_ENDPOINTS[
                        tabela
                    ];
                if (!routePrefix) {
                    errorAlert(
                        `Restauração para a tabela '${tabela}' não está implementada.`,
                        "Aviso de Restauração"
                    );
                    return;
                }
                const title =
                    "CONFIRMAÇÃO CRÍTICA";
                const text =
                    tabela ===
                    "pdfs_unificados"
                        ? "Deseja restaurar este PDF? Um novo registro será criado no sistema."
                        : `Deseja restaurar este(a) ${tabela}? O registro será re-inserido com o ID original.`;
                const isConfirmed =
                    await confirmAction(
                        title,
                        text
                    );
                if (!isConfirmed) {
                    return;
                }
                const token =
                    localStorage.getItem(
                        "authToken"
                    );
                if (!token) {
                    errorAlert(
                        "Sessão expirada.",
                        "Erro de Autenticação"
                    );
                    return;
                }
                try {
                    const url =
                        `${API_BASE_URL}${routePrefix}/${logId}`;
                    const response =
                        await fetch(
                            url,
                            {
                                method:
                                    "POST",
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                    "Content-Type":
                                        "application/json",
                                },
                            }
                        );
                    if (!response.ok) {
                        let errorData: ErrorResponse =
                            {
                                error:
                                    `Erro desconhecido: Status ${response.status}`,
                            };
                        try {
                            errorData =
                                await response.json() as ErrorResponse;
                        } catch {
                            // Ignora
                        }
                        throw new Error(
                            errorData.error ||
                            `Erro ao restaurar: ${response.statusText}`
                        );
                    }
                    const result: RestoreResponse =
                        await response.json();
                    successToast(
                        `Restauração de ${tabela} concluída com sucesso! ${result.message}`
                    );
                    fetchLogs();
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : String(err);
                    console.error(
                        "Erro ao restaurar:",
                        err
                    );
                    errorAlert(
                        `Falha na Restauração: ${message}`,
                        "Erro Crítico"
                    );
                }
            },
            [
                fetchLogs,
                successToast,
                errorAlert,
                confirmAction
            ]
        );
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    if (loading) {
        return (
            <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-slate-200 bg-white">
                <p className="text-sm text-slate-500">
                    Carregando logs de auditoria...
                </p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">
                    Erro: {error}
                </p>
            </div>
        );
    }
    return (
        <div className="w-full min-w-0 rounded-lg bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-xl font-semibold text-slate-800">
                    Logs de Auditoria
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                    Histórico de ações e restaurações do sistema.
                </p>
            </div>
            {logs.length === 0 ? (
                <div className="flex min-h-[120px] items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50">
                    <p className="text-xs text-slate-500">
                        Nenhum log de auditoria encontrado.
                    </p>
                </div>
            ) : (
                <div className="min-w-0 overflow-hidden rounded border border-slate-200">
                    <div className="h-[320px] min-w-0 overflow-auto">
                        <table className="w-full min-w-[1100px] border-collapse text-xs">
                            <thead className="sticky top-0 z-10 bg-slate-100">
                                <tr className="border-b border-slate-200">
                                    <th className="w-16 px-2 py-2 text-left font-semibold text-slate-600">
                                        ID Log
                                    </th>
                                    <th className="w-40 px-2 py-2 text-left font-semibold text-slate-600">
                                        Data
                                    </th>
                                    <th className="w-44 px-2 py-2 text-left font-semibold text-slate-600">
                                        Usuário Ação
                                    </th>
                                    <th className="w-28 px-2 py-2 text-left font-semibold text-slate-600">
                                        Tipo Ação
                                    </th>
                                    <th className="min-w-[220px] px-2 py-2 text-left font-semibold text-slate-600">
                                        Nome do Arquivo
                                    </th>
                                    <th className="w-48 px-2 py-2 text-left font-semibold text-slate-600">
                                        Tabela
                                    </th>
                                    <th className="w-24 px-2 py-2 text-center font-semibold text-slate-600">
                                        ID Original
                                    </th>
                                    <th className="w-28 px-2 py-2 text-center font-semibold text-slate-600">
                                        Status
                                    </th>
                                    <th className="w-28 px-2 py-2 text-center font-semibold text-slate-600">
                                        Ação
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => {
                                    const isRestoreImplemented =
                                        log.tabela_afetada in
                                        RESTORE_ENDPOINTS;
                                    const isRestoreAllowed =
                                        log.tipo_acao ===
                                            "EXCLUSAO" &&
                                        log.status_restauracao !==
                                            "RESTAURADO" &&
                                        isRestoreImplemented;
                                    return (
                                        <tr
                                            key={log.id}
                                            className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                                        >
                                            <td className="h-8 px-2 text-slate-600">
                                                {log.id}
                                            </td>
                                            <td className="h-8 whitespace-nowrap px-2 text-slate-600">
                                                {new Date(
                                                    log.data_hora
                                                ).toLocaleString()}
                                            </td>
                                            <td className="h-8 px-2 text-slate-700">
                                                <span className="block max-w-[180px] truncate">
                                                    {
                                                        log.nome_usuario
                                                    }{" "}
                                                    (
                                                    {
                                                        log.usuario_id
                                                    }
                                                    )
                                                </span>
                                            </td>
                                            <td className="h-8 px-2 text-slate-600">
                                                {log.tipo_acao}
                                            </td>
                                            <td className="h-8 max-w-[280px] px-2 text-slate-700">
                                                <span
                                                    className="block truncate"
                                                    title={
                                                        log.nome_arquivo
                                                    }
                                                >
                                                    {
                                                        log.nome_arquivo
                                                    }
                                                </span>
                                            </td>
                                            <td className="h-8 px-2 text-slate-600">
                                                {
                                                    log.tabela_afetada
                                                }
                                            </td>
                                            <td className="h-8 px-2 text-center text-slate-600">
                                                {log.registro_id ??
                                                    "-"}
                                            </td>
                                            <td className="h-8 px-2 text-center">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                        log.status_restauracao ===
                                                        "RESTAURADO"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {
                                                        log.status_restauracao
                                                    }
                                                </span>
                                            </td>
                                            <td className="h-8 px-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRestore(
                                                            log.id,
                                                            log.tabela_afetada
                                                        )
                                                    }
                                                    disabled={
                                                        !isRestoreAllowed
                                                    }
                                                    title={
                                                        !isRestoreImplemented
                                                            ? `Restauração não implementada para esta tabela: ${log.tabela_afetada}`
                                                            : ""
                                                    }
                                                    className="h-7 rounded bg-amber-500 px-2.5 text-[11px] font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                                >
                                                    Restaurar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default LogAuditoria;
