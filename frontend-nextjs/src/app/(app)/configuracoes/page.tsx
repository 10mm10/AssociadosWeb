'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAlerts from '@/hooks/useAlerts';
import LogAuditoria from './LogAuditoria/page';
interface Usuario {
    id: number;
    nome_usuario: string;
    email: string;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export default function GerenciamentoPage() {
    const { successToast, errorAlert, confirmAction } = useAlerts();
    const router = useRouter();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [novoUsuario, setNovoUsuario] = useState({
        nome: '',
        email: '',
        senha: '',
    });
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const fetchUsuarios = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`);
            if (!response.ok) {
                throw new Error('Erro ao carregar usuários.');
            }
            const data = await response.json();
            setUsuarios(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            errorAlert(message, 'Falha ao Carregar');
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setNovoUsuario(prevState => ({
            ...prevState,
            [name]: value,
            role: 'usuario',
        }));
    };
    const handleAddUsuario = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${API_BASE_URL}/usuarios`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: novoUsuario.nome,
                        email: novoUsuario.email,
                        senha: novoUsuario.senha,
                        role: 'usuario'
                    }),
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                    'Falha ao adicionar novo usuário.'
                );
            }
            successToast(
                'Usuário adicionado com sucesso!'
            );
            setNovoUsuario({
                nome: '',
                email: '',
                senha: '',
            });
            fetchUsuarios();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            errorAlert(
                `Erro: ${message}`,
                'Falha na Criação'
            );
        }
    };
    const handleDeleteUsuario = async (
        id: number
    ) => {
        const isConfirmed = await confirmAction(
            'Confirmação de Exclusão',
            'Tem certeza que deseja excluir permanentemente este usuário? Esta ação não pode ser desfeita.'
        );
        if (!isConfirmed) return;
        try {
            const response = await fetch(
                `${API_BASE_URL}/usuarios/${id}`,
                {
                    method: 'DELETE',
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                    'Falha ao excluir o usuário.'
                );
            }
            successToast(
                'Usuário excluído com sucesso!'
            );
            fetchUsuarios();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            errorAlert(
                `Erro: ${message}`,
                'Falha na Exclusão'
            );
        }
    };
    const handleUpdateSenha = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        if (novaSenha !== confirmarSenha) {
            errorAlert(
                'As senhas não coincidem!',
                'Erro de Validação'
            );
            return;
        }
        if (novaSenha.length < 6) {
            errorAlert(
                'A senha deve ter no mínimo 6 caracteres.',
                'Senha muito curta'
            );
            return;
        }
        try {
            const response = await fetch(
                `${API_BASE_URL}/usuarios/${editingUserId}/senha`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        senha: novaSenha
                    }),
                }
            );
            if (!response.ok) {
                throw new Error(
                    'Falha ao atualizar senha.'
                );
            }
            successToast(
                'Senha atualizada com sucesso!'
            );
            setIsEditModalOpen(false);
            setNovaSenha('');
            setConfirmarSenha('');
            setEditingUserId(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            errorAlert(
                message,
                'Erro na Atualização'
            );
        }
    };
    useEffect(() => {
        const role =
            localStorage.getItem('userRole');
        if (role) {
            setUserRole(role);
            if (role === 'admin') {
                fetchUsuarios();
            } else {
                setLoading(false);
            }
        } else {
            router.push('/login');
        }
    }, [router]);
    if (loading) {
        return (
            <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
                <p className="text-sm text-slate-500">
                    Verificando suas permissões...
                </p>
            </div>
        );
    }
    if (userRole !== 'admin') {
        return (
            <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
                <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-red-600">
                        Acesso Negado!
                    </h2>
                </div>
            </div>
        );
    }
    return (
        <div className="h-[calc(100vh-2rem)] min-h-0 w-full overflow-hidden md:h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-3rem)]">
            {/* MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Redefinir Senha
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Digite e confirme a nova senha.
                            </p>
                        </div>
                        <form
                            onSubmit={handleUpdateSenha}
                            className="space-y-3"
                        >
                            <input
                                type="password"
                                placeholder="Nova Senha"
                                value={novaSenha}
                                onChange={(e) =>
                                    setNovaSenha(e.target.value)
                                }
                                required
                                className="h-9 w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                            <input
                                type="password"
                                placeholder="Confirme a Nova Senha"
                                value={confirmarSenha}
                                onChange={(e) =>
                                    setConfirmarSenha(e.target.value)
                                }
                                required
                                className="h-9 w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                            {confirmarSenha &&
                                novaSenha !== confirmarSenha && (
                                <p className="text-xs text-red-600">
                                    As senhas não coincidem.
                                </p>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={
                                        !novaSenha ||
                                        novaSenha !== confirmarSenha
                                    }
                                    className="h-8 rounded bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Salvar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setNovaSenha('');
                                        setConfirmarSenha('');
                                        setEditingUserId(null);
                                    }}
                                    className="h-8 rounded bg-slate-500 px-4 text-xs font-semibold text-white hover:bg-slate-600"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* GRID PRINCIPAL */}
            <div className="grid h-full min-h-0 grid-rows-[minmax(230px,38%)_minmax(0,1fr)] gap-3">
                {/* =============================================
                    USUÁRIOS
                ============================================== */}
                <section className="flex min-h-0 flex-col rounded-lg bg-white p-4 shadow-sm">
                    <div className="mb-3 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-700">
                                Gerenciamento de Usuários
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Cadastro, edição de senha e exclusão.
                            </p>
                        </div>
                    </div>
                    {error && (
                        <div className="mb-2 shrink-0 rounded border border-red-200 bg-red-50 px-3 py-1.5">
                            <p className="text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    )}
                    {/* CONTEÚDO USUÁRIOS */}
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[380px_minmax(0,1fr)]">
                        {/* CADASTRO */}
                        <div className="rounded border border-slate-200 bg-slate-50 p-3">
                            <h3 className="mb-2 text-xs font-semibold text-slate-700">
                                Cadastrar novo usuário
                            </h3>
                            <form
                                onSubmit={handleAddUsuario}
                                className="space-y-2"
                            >
                                <input
                                    type="text"
                                    name="nome"
                                    placeholder="Nome de Usuário"
                                    value={novoUsuario.nome}
                                    onChange={handleInputChange}
                                    required
                                    className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail"
                                    value={novoUsuario.email}
                                    onChange={handleInputChange}
                                    required
                                    className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        name="senha"
                                        placeholder="Senha"
                                        value={novoUsuario.senha}
                                        onChange={handleInputChange}
                                        required
                                        className="h-8 min-w-0 flex-1 rounded border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                    />
                                    <button
                                        type="submit"
                                        className="h-8 shrink-0 rounded bg-blue-400 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </form>
                        </div>
                        {/* TABELA USUÁRIOS */}
                        <div className="min-h-0 min-w-0 overflow-hidden rounded border border-slate-200">
                            <div className="h-full min-h-0 overflow-auto">
                                <table className="w-full min-w-[560px] border-collapse text-xs">
                                    <thead className="sticky top-0 z-10 bg-slate-100">
                                        <tr>
                                            <th className="h-8 border-b border-slate-200 px-3 text-left font-semibold text-slate-600">
                                                Nome
                                            </th>
                                            <th className="h-8 border-b border-slate-200 px-3 text-left font-semibold text-slate-600">
                                                E-mail
                                            </th>
                                            <th className="h-8 w-36 border-b border-slate-200 px-3 text-center font-semibold text-slate-600">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.length > 0 ? (
                                            usuarios.map(user => (
                                                <tr
                                                    key={user.id}
                                                    className="border-b border-slate-100 hover:bg-slate-50"
                                                >
                                                    <td className="h-8 px-3 text-slate-700">
                                                        {user.nome_usuario}
                                                    </td>
                                                    <td className="h-8 px-3 text-slate-600">
                                                        {user.email}
                                                    </td>
                                                    <td className="h-8 px-3">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingUserId(user.id);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="h-6 rounded bg-blue-400 px-2 text-[10px] font-semibold text-white hover:bg-blue-700"
                                                            >
                                                                Senha
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteUsuario(user.id)
                                                                }
                                                                className="h-6 rounded bg-red-400 px-2 text-[10px] font-semibold text-white hover:bg-red-700"
                                                            >
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-3 py-5 text-center text-xs text-slate-500"
                                                >
                                                    Nenhum usuário encontrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
                {/* =============================================
                    LOGS
                ============================================== */}
                <section className="min-h-0 overflow-hidden">
                    <LogAuditoria />
                </section>
            </div>
        </div>
    );
}
