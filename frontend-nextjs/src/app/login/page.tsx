'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import useAlerts from '@/hooks/useAlerts';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);

    const router = useRouter();
    const { setUserName } = useUser();
    const { successToast, errorAlert } = useAlerts();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_usuario: username, senha: password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao tentar fazer login.');
            }

            const data = await response.json();
            setUserName(username);

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);

            if (data.needsPasswordChange) {
                router.replace(`/trocar-senha?user=${username}`);
            } else {
                router.replace('/inicial');
            }
        } catch (err: unknown) {
            let msg = 'Erro ao tentar fazer login.';
            if (err instanceof Error) msg = err.message;
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <img src="/img/Interagir.png" alt="Logo Interagir" className="mx-auto h-25 object-contain" />
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-3xl font-bold text-slate-600 text-center">Seja bem vindo(a) ao sistema Interagir!</h2>
                    
                    {error && (
                        <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center">
                            {error}
                        </p>
                    )}
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700" htmlFor="username">Nome de Usuário</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700" htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-400 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Entrar
                    </button>

                    <div className="text-center">
                        <button 
                            type="button"
                            onClick={() => { setShowForgotModal(true); setError(''); }}
                            className="text-sm text-blue-600 hover:underline cursor-pointer font-medium"
                        >
                            Esqueci a senha
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 text-center">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Recuperar Senha</h3>
                        <p className="text-slate-600 mb-2">Entre em contato com o administrador do sistema:</p>
                        <p className="text-lg font-bold text-blue-600 mb-6">41 99761-8970</p>
                        
                        <button 
                            onClick={() => setShowForgotModal(false)}
                            className="w-full bg-slate-100 text-slate-700 font-semibold py-2 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}