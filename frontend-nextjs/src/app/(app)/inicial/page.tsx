'use client';

import React from 'react';
import { useUser } from '@/context/UserContext';

export default function LandingPage() {
    const { userName } = useUser();

    return (
        <div className="flex min-h-[calc(100dvh-5rem)] w-full min-w-0 items-center justify-center lg:min-h-[calc(100dvh-3rem)]">

            <div className="flex w-full min-w-0 items-center justify-center rounded-xl bg-white px-4 py-8 shadow-sm sm:px-6 sm:py-10 lg:min-h-[calc(100dvh-3rem)]">

                <div className="flex w-full max-w-2xl flex-col items-center text-center">

                    <img
                        src="/img/Interagir.png"
                        alt="Logo Interagir"
                        className="mb-4 h-14 max-w-full object-contain sm:mb-6 sm:h-20 lg:h-24"
                    />

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600 sm:text-xs sm:tracking-[0.2em]">
                        Sistema de Gestão
                    </p>

                    <h1 className="break-words text-xl font-bold tracking-tight text-slate-600 sm:text-2xl md:text-3xl lg:text-4xl">
                        Bem-vindo(a), {userName || 'Usuário(a)'}!
                    </h1>

                    <p className="mt-3 max-w-lg px-1 text-xs leading-5 text-slate-500 sm:mt-4 sm:text-sm sm:leading-6 md:text-base">
                        Bem-vindo ao sistema de gestão da Assessoria Interagir.
                        Utilize o menu para acessar as funcionalidades disponíveis.
                    </p>

                    <div className="mt-5 h-px w-20 bg-slate-300 sm:mt-7 sm:w-24" />

                    <p className="mt-4 text-[10px] text-slate-400 sm:mt-5 sm:text-xs">
                        Assessoria Interagir
                    </p>

                </div>

            </div>

        </div>
    );
}