import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import PostClient, { Post } from "./PostClient";

interface PostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

const SITE_URL = "https://www.assessoria-interagir.com.br";

const getPost = cache(async (slug: string): Promise<Post | null> => {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!backendUrl) {
            console.error(
                "NEXT_PUBLIC_BACKEND_URL não configurada."
            );

            return null;
        }

        const response = await fetch(
            `${backendUrl}/posts/${encodeURIComponent(slug)}`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            return null;
        }

        const post: Post = await response.json();

        return post;

    } catch (error) {
        console.error(
            "Erro ao buscar artigo:",
            error
        );

        return null;
    }
});

function criarDescricao(conteudo: string) {
    const textoLimpo = conteudo
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (textoLimpo.length <= 160) {
        return textoLimpo;
    }

    return `${textoLimpo.substring(0, 157).trim()}...`;
}

function criarUrlImagem(imagemUrl: string) {
    if (!imagemUrl) {
        return `${SITE_URL}/favicon/logointeragir1200.jpeg`;
    }

    if (imagemUrl.startsWith("http")) {
        return imagemUrl;
    }

    const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "";

    return `${backendUrl}${imagemUrl}`;
}

export async function generateMetadata({
    params,
}: PostPageProps): Promise<Metadata> {

    const { slug } = await params;

    const post = await getPost(slug);

    if (!post) {
        return {
            title: "Artigo não encontrado",
            description:
                "O artigo solicitado não foi encontrado no Blog da Interagir.",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const descricao = criarDescricao(post.conteudo);

    const canonical =
        `${SITE_URL}/blog/${post.slug}`;

    const imagem = criarUrlImagem(
        post.imagem_url
    );

    return {
        title: post.titulo,

        description: descricao,

        alternates: {
            canonical,
        },

        openGraph: {
            title: post.titulo,
            description: descricao,
            url: canonical,
            siteName:
                "Interagir Assessoria e Consultoria",
            locale: "pt_BR",
            type: "article",

            publishedTime:
                post.data_publicacao,

            authors: [
                post.autor
            ],

            images: [
                {
                    url: imagem,
                    width: 1200,
                    height: 630,
                    alt: post.titulo,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title: post.titulo,
            description: descricao,
            images: [
                imagem
            ],
        },
    };
}

export default async function PostPage({
    params,
}: PostPageProps) {

    const { slug } = await params;

    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <PostClient initialPost={post} />
    );
}