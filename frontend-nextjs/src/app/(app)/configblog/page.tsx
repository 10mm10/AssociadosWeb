'use client';
import React from 'react';
import Link from 'next/link';
export default function GerenciamentoPage() {
    return (
        <div className="w-full min-w-0">
            <div className="w-full min-w-0 rounded-lg bg-white p-4 shadow-sm md:p-5">
                <div className="mb-4 border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-semibold text-slate-800">
                        Configuração Posts Blog
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin"
                        className="inline-flex h-8 items-center justify-center rounded bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                        Config Blog
                    </Link>
                </div>
            </div>
        </div>
    );
}
