"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import useAlerts from "@/hooks/useAlerts";

import {
    FaInstagram,
    FaFacebookF,
    FaTiktok,
    FaLinkedinIn,
    FaWhatsapp,
    FaEnvelope,
} from "react-icons/fa";

export interface Post {
    id: number;
    titulo: string;
    conteudo: string;
    imagem_url: string;
    autor: string;
    data_publicacao: string;
    slug: string;
    likes_count: number;
}

interface PostClientProps {
    initialPost: Post;
}

export default function PostClient({
    initialPost,
}: PostClientProps) {

    const [post, setPost] =
        useState<Post>(initialPost);

    const [isLiking, setIsLiking] =
        useState(false);

    const {
        successToast,
        errorAlert,
    } = useAlerts();

    const whatsappNumber1 =
        "5541984256603";

    const whatsappNumber =
        "5541987266188";

    const whatsappLink =
        `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de mais informações sobre os seus serviços de Assessoria.`;

    // =====================================================
    // FORMATAÇÃO DA DATA
    // =====================================================

    const formatDate = (
        dateString: string
    ) => {

        const options:
            Intl.DateTimeFormatOptions = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            };

        const formatted =
            new Date(
                dateString
            ).toLocaleDateString(
                "pt-BR",
                options
            );

        return (
            formatted.charAt(0).toUpperCase() +
            formatted.slice(1)
        );
    };

    // =====================================================
    // COMPARTILHAR ARTIGO
    // =====================================================

    const sharePost = async () => {

        const url =
            `${window.location.origin}/blog/${post.slug}`;

        try {

            if (navigator.share) {

                await navigator.share({
                    title: post.titulo,
                    text:
                        `Leia agora: ${post.titulo}`,
                    url,
                });

            } else {

                await navigator.clipboard.writeText(
                    url
                );

                successToast(
                    "Link copiado!"
                );
            }

        } catch (error) {

            console.error(
                "Erro ao compartilhar artigo:",
                error
            );
        }
    };

    // =====================================================
    // CURTIR ARTIGO
    // =====================================================

    const handleLike = async () => {

        if (isLiking) {
            return;
        }

        setIsLiking(true);

        try {

            const token =
                localStorage.getItem(
                    "authToken"
                );

            const headers:
                Record<string, string> = {};

            if (token) {
                headers.Authorization =
                    `Bearer ${token}`;
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${post.id}/like`,
                {
                    method: "POST",
                    headers,
                }
            );

            if (!res.ok) {
                throw new Error(
                    "Erro ao registrar gostei."
                );
            }

            setPost((postAtual) => ({
                ...postAtual,

                likes_count:
                    (postAtual.likes_count || 0) +
                    1,
            }));

            successToast(
                "Gostei registrado!"
            );

        } catch (error) {

            console.error(
                "Erro ao registrar gostei:",
                error
            );

            errorAlert(
                "Erro ao registrar gostei."
            );

        } finally {

            setIsLiking(false);
        }
    };

    // =====================================================
    // URL DA IMAGEM
    // =====================================================

    const imagemPost =
        post.imagem_url
            ? post.imagem_url.includes(
                  "amazonaws.com"
              )
                ? post.imagem_url

                : post.imagem_url.startsWith(
                      "http"
                  )
                    ? post.imagem_url

                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}${post.imagem_url}`

            : "";

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-800">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="border-b border-slate-200 bg-white">

                <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-6 sm:px-6 lg:px-8">

                    <Link
                        href="/blog"
                        className="w-fit"
                    >
                        <p className="text-2xl font-bold tracking-tight text-slate-800 transition hover:text-blue-600 md:text-3xl">
                            Blog da Interagir
                        </p>
                    </Link>

                    <p className="text-sm text-slate-500">
                        Notícias Jurídicas e Corporativas
                    </p>

                </div>

            </header>

            {/* =====================================================
                CONTEÚDO DO ARTIGO
            ====================================================== */}

            <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:px-8">

                <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {/* IMAGEM */}

                    {imagemPost && (

                        <Image
                            src={imagemPost}
                            alt={post.titulo}
                            width={1200}
                            height={620}
                            className="max-h-[420px] w-full bg-slate-50 object-contain p-3"
                            unoptimized={true}
                        />

                    )}

                    {/* CONTEÚDO */}

                    <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">

                        {/* TÍTULO */}

                        <h1 className="mb-3 text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
                            {post.titulo}
                        </h1>

                        {/* META */}

                        <p className="mb-6 text-xs text-slate-400">

                            Por{" "}

                            <span className="font-medium text-slate-500">
                                {post.autor}
                            </span>

                            {" • "}

                            {formatDate(
                                post.data_publicacao
                            )}

                        </p>

                        {/* TEXTO */}

                        <div className="space-y-4 text-[15px] leading-7 text-slate-700">

                            {post.conteudo
                                .split("\n")
                                .map(
                                    (
                                        line,
                                        index
                                    ) => (

                                        <p key={index}>
                                            {line ||
                                                "\u00A0"}
                                        </p>

                                    )
                                )}

                        </div>

                        {/* AÇÕES */}

                        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">

                            <button
                                type="button"
                                onClick={sharePost}
                                className="h-8 rounded bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                            >
                                Compartilhar
                            </button>

                            <button
                                type="button"
                                onClick={handleLike}
                                disabled={isLiking}
                                className="h-8 rounded bg-blue-50 px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {isLiking
                                    ? "Registrando..."
                                    : `Gostei (${post.likes_count || 0})`}

                            </button>

                            <Link
                                href="/blog"
                                className="inline-flex h-8 items-center rounded bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                                ← Voltar
                            </Link>

                        </div>

                    </div>

                </article>

            </main>

            {/* =====================================================
                REDES SOCIAIS
            ====================================================== */}

            <div
                className="
                    flex justify-center gap-4 bg-slate-100 py-8
                    lg:fixed lg:left-6 lg:top-24 lg:z-50
                    lg:flex-col lg:gap-3 lg:bg-transparent lg:py-0
                "
            >

                {/* INSTAGRAM */}

                <a
                    href="https://www.instagram.com/mairadeoliveira_pcd"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-pink-500 hover:text-white hover:shadow-md"
                >
                    <FaInstagram size={20} />
                </a>

                {/* FACEBOOK */}

                <a
                    href="https://facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-blue-400 hover:text-white hover:shadow-md"
                >
                    <FaFacebookF size={20} />
                </a>

                {/* TIKTOK */}

                <a
                    href="https://tiktok.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-slate-900 hover:text-white hover:shadow-md"
                >
                    <FaTiktok size={20} />
                </a>

                {/* LINKEDIN */}

                <a
                    href="https://linkedin.com/in/maíra-oliveira-310a042a"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-blue-400 hover:text-white hover:shadow-md"
                >
                    <FaLinkedinIn size={20} />
                </a>

            </div>

            {/* =====================================================
                FOOTER
            ====================================================== */}

            <footer
                id="footer"
                className="border-t border-slate-800 bg-slate-900 px-4 py-16 text-slate-300 sm:px-6 lg:px-8"
            >

                <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-3">

                    {/* SOBRE */}

                    <div>

                        <h3 className="mb-4 text-lg font-bold text-white">
                            Sobre Nós
                        </h3>

                        <p className="mb-4 text-sm leading-relaxed text-slate-400">
                            A Interagir é a parceira estratégica que impulsiona sua organização a conquistar reconhecimento e protagonismo no campo social.
                        </p>

                        <p className="text-xs font-semibold text-slate-400">
                            INTERAGIR ASSESSORIA E CONSULTORIA LTDA
                        </p>

                        <p className="text-xs text-slate-500">
                            CNPJ: 65.754.154/0001-14
                        </p>

                    </div>

                    {/* LINKS */}

                    <div>

                        <h3 className="mb-4 text-lg font-bold text-white">
                            Links Rápidos
                        </h3>

                        <ul className="space-y-2 text-sm">

                            <li>
                                <Link
                                    href="/"
                                    className="transition-colors hover:text-white"
                                >
                                    Voltar ao inicio
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/blog"
                                    className="transition-colors hover:text-white"
                                >
                                    Blog
                                </Link>
                            </li>

                        </ul>

                    </div>

                    {/* CONTATO */}

                    <div>

                        <h3 className="mb-4 text-lg font-bold text-white">
                            Contato
                        </h3>

                        {/* E-MAIL */}

                        <p className="mb-2 text-sm text-slate-400">

                            <a
                                href="mailto:assessoria.interagir2026@gmail.com"
                                className="group flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:text-white"
                            >
                                <FaEnvelope className="text-base" />

                                assessoria.interagir2026@gmail.com
                            </a>

                        </p>

                        {/* WHATSAPP THIAGO */}

                        <p className="mb-2 text-sm text-slate-400">

                            <a
                                href={`https://wa.me/${whatsappNumber}?text=Olá! Gostaria de mais informações sobre os seus serviços de Assessoria.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:text-white"
                            >

                                <FaWhatsapp className="text-base" />

                                (41) 98726-6188 Thiago Alberto

                            </a>

                        </p>

                        {/* WHATSAPP MAIRA */}

                        <p className="text-sm text-slate-400">

                            <a
                                href={`https://wa.me/${whatsappNumber1}?text=Olá! Gostaria de mais informações sobre os seus serviços de Assessoria.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:text-white"
                            >

                                <FaWhatsapp className="text-base" />

                                (41) 98425-6603 Maira de Oliveira

                            </a>

                        </p>

                    </div>

                </div>

                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 border-t border-slate-800 pt-8 text-center text-xs text-slate-500 sm:flex-row">

                    <p>
                        &copy; {new Date().getFullYear()} Interagir. Todos os direitos reservados.
                    </p>

                    <p>
                        Tecnologia: MM10Sistemas
                    </p>

                </div>

            </footer>

            {/* =====================================================
                BOTÃO FLUTUANTE WHATSAPP
            ====================================================== */}

            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-emerald-600"
            >
                <FaWhatsapp size={28} />
            </a>

        </div>
    );
}