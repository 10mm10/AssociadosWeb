'use client';

import { ReactNode, useEffect, useState } from 'react';
import UserInfo from './UserInfo';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';

import { app } from '../../config/firebaseClient';

export default function AppLayout({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const auth = getAuth(app);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fecha o menu mobile ao mudar de página
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        signOut(auth);
        router.replace('/login');
    };

    const menuItems = [
        { href: '/inicial', label: 'Inicio', icon: '/img/dash.png' },
        { href: '/clientes', label: 'Clientes', icon: '/img/clientes.png' },
        { href: '/documentos', label: 'Documentos', icon: '/img/documentos.png' },
        { href: '/admin', label: 'ConfigBlog', icon: '/img/blog.png' },
        { href: '/configuracoes', label: 'Configurações', icon: '/img/configuracoes.png' },
    ];

    const SidebarContent = () => (
        <>
            <div>
                {/* LOGO */}
                <div className="mb-8 flex items-center justify-center border-b border-slate-200 py-10">
                    <Link href="/" rel="noopener noreferrer">
                        <Image
                            src="/img/Interagir.png"
                            alt="Logo Interagir"
                            width={200}
                            height={50}
                            className="object-contain"
                        />
                    </Link>
                </div>

                {/* MENU */}
                {mounted && (
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Image
                                        src={item.icon}
                                        alt={item.label}
                                        width={22}
                                        height={22}
                                        className="object-contain"
                                    />

                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </div>

            {/* RODAPÉ */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-4">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                    <i className="fas fa-user-circle text-xl text-slate-400"></i>

                    <UserInfo />
                </div>

                <button
                    onClick={handleLogout}
                    className="group cursor-pointer rounded-lg p-2 transition-colors hover:bg-red-50"
                    title="Sair"
                >
                    <Image
                        src="/img/logout.png"
                        alt="Sair"
                        width={45}
                        height={45}
                        className="object-contain group-hover:opacity-80"
                    />
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50 text-slate-800">

            {/* =====================================================
                SIDEBAR DESKTOP
            ====================================================== */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-sm lg:flex">
                <SidebarContent />
            </aside>

            {/* =====================================================
                TOPO MOBILE / TABLET
            ====================================================== */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">

                <Link href="/inicial">
                    <Image
                        src="/img/Interagir.png"
                        alt="Logo Interagir"
                        width={135}
                        height={40}
                        className="h-auto w-auto max-w-[135px] object-contain"
                    />
                </Link>

                <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-slate-600 transition hover:bg-slate-100"
                    aria-label="Abrir Menu"
                >
                    ☰
                </button>

            </header>

            {/* =====================================================
                FUNDO ESCURO MOBILE
            ====================================================== */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* =====================================================
                SIDEBAR MOBILE / TABLET
            ====================================================== */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-72 flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
                    isMenuOpen
                        ? 'translate-x-0'
                        : '-translate-x-full'
                }`}
            >

                {/* BOTÃO FECHAR */}
                <div className="absolute right-3 top-3">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-3xl text-slate-500 transition hover:bg-slate-100"
                        aria-label="Fechar Menu"
                    >
                        &times;
                    </button>
                </div>

                <SidebarContent />
            </aside>

            {/* =====================================================
                CONTEÚDO
            ====================================================== */}
            <main className="min-h-screen min-w-0 bg-slate-50 p-3 sm:p-4 lg:ml-64 lg:p-6">
                {children}
            </main>

        </div>
    );
}