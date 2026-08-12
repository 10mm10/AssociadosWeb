'use client';
export const dynamic = "force-dynamic";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
function ChangePasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = searchParams.get('user');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('');
        setError('');
        if (newPassword !== confirmPassword) {
            setError(
                'As senhas não coincidem. Tente novamente.'
            );
            return;
        }
        if (newPassword.length < 8) {
            setError(
                'A nova senha deve ter no mínimo 8 caracteres.'
            );
            return;
        }
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/change-password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        senha: newPassword
                    }),
                }
            );
            if (!response.ok) {
                const errorData =
                    await response.json();
                throw new Error(
                    errorData.error ||
                    'Erro ao trocar a senha.'
                );
            }
            setMessage(
                'Senha alterada com sucesso! Redirecionando para a tela inicial...'
            );
            setTimeout(() => {
                router.push('/inicial');
            }, 2000);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erro ao trocar a senha.';
            console.error(
                'Erro na troca de senha:',
                errorMessage
            );
            setError(errorMessage);
        }
    };
    if (!username) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
                <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
                    <h1 className="mb-2 text-xl font-semibold text-red-600">
                        Acesso Negado
                    </h1>
                    <p className="text-sm leading-6 text-slate-600">
                        Por favor, faça login com uma senha temporária para acessar esta página.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 border-b border-slate-100 pb-4">
                    <h1 className="text-xl font-semibold text-slate-800">
                        Troca de Senha Obrigatória
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Para sua segurança, por favor, crie uma nova senha.
                    </p>
                </div>
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                )}
                {message && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                        <p className="text-sm text-green-700">
                            {message}
                        </p>
                    </div>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="newPassword"
                            className="text-xs font-semibold text-slate-600"
                        >
                            Nova Senha
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(
                                    e.target.value
                                )
                            }
                            required
                            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="confirmPassword"
                            className="text-xs font-semibold text-slate-600"
                        >
                            Confirme a Nova Senha
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            required
                            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-2 h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Trocar Senha
                    </button>
                </form>
            </div>
        </div>
    );
}
export default function ChangePasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-slate-100">
                    <p className="text-sm text-slate-500">
                        Carregando...
                    </p>
                </div>
            }
        >
            <ChangePasswordContent />
        </Suspense>
    );
}