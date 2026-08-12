'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useAlerts from '@/hooks/useAlerts';
interface Post {
    id: number;
    titulo: string;
    conteudo: string;
    imagem_url: string;
    autor: string;
    data_publicacao: string;
    slug: string;
}
export default function AdminPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const {
        successToast,
        errorAlert,
        confirmAction
    } = useAlerts();
    useEffect(() => {
        async function fetchPosts() {
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`,
                    {
                        cache: 'no-store',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (res.ok) {
                    const fetchedPosts: Post[] = await res.json();
                    setPosts(fetchedPosts);
                } else {
                    if (res.status === 401) {
                        errorAlert(
                            'Sessão expirada. Faça login novamente.',
                            'Acesso Negado'
                        );
                    }
                    console.error('Falha ao buscar posts.');
                }
            } catch (error) {
                console.error(
                    'Erro ao buscar posts:',
                    error
                );
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);
    const handleDelete = async (postId: number) => {
        const confirmed = await confirmAction(
            'Excluir Publicação',
            'Tem certeza que deseja apagar este post do blog?'
        );
        if (!confirmed) {
            return;
        }
        const token =
            localStorage.getItem('authToken');
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.ok) {
                successToast(
                    'Post removido com sucesso!'
                );
                setPosts(
                    posts.filter(
                        post => post.id !== postId
                    )
                );
            } else {
                errorAlert(
                    'Falha ao excluir o post. Verifique se você é o autor ou admin.'
                );
            }
        } catch (error) {
            errorAlert(
                'Ocorreu um erro técnico ao tentar excluir.'
            );
        }
    };
    if (loading) {
        return (
            <div className="flex min-h-[200px] w-full items-center justify-center">
                <p className="text-sm text-slate-500">
                    Carregando gerenciador de blog...
                </p>
            </div>
        );
    }
    return (
        <div className="w-full min-w-0">
            <div className="w-full min-w-0 rounded-lg bg-white p-4 shadow-sm md:p-5">
                {/* CABEÇALHO */}
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        Painel de Administração Blog
                    </h2>
                    <Link
                        href="/admin/create-post"
                        className="inline-flex h-8 items-center rounded bg-blue-400 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                        + Criar Novo Post
                    </Link>
                </div>
                {/* LISTA DE POSTS */}
                <div className="w-full min-w-0 overflow-hidden rounded border border-slate-200">
                    <div className="h-[calc(100vh-250px)] min-h-[250px] overflow-y-auto">
                        {posts.length > 0 ? (
                            <table className="w-full min-w-[700px] border-collapse text-xs">
                                <thead className="sticky top-0 z-10 bg-slate-100">
                                    <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-600">
                                        <th className="w-16 px-3 py-2">
                                            ID
                                        </th>
                                        <th className="px-3 py-2">
                                            Título
                                        </th>
                                        <th className="w-40 px-3 py-2">
                                            Autor
                                        </th>
                                        <th className="w-32 px-3 py-2">
                                            Data
                                        </th>
                                        <th className="w-32 px-3 py-2 text-center">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map(post => (
                                        <tr
                                            key={post.id}
                                            className="border-b border-slate-100 text-slate-700 transition hover:bg-slate-50"
                                        >
                                            <td className="px-3 py-2 text-slate-500">
                                                {post.id}
                                            </td>
                                            <td className="max-w-[400px] px-3 py-2">
                                                <div
                                                    className="truncate font-medium text-slate-700"
                                                    title={post.titulo}
                                                >
                                                    {post.titulo}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                {post.autor}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-500">
                                                {new Date(
                                                    post.data_publicacao
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/admin/edit-post/${post.slug}`}
                                                        className="inline-flex h-7 items-center rounded bg-blue-400 px-2.5 text-[11px] font-semibold text-white transition hover:bg-blue-700"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                post.id
                                                            )
                                                        }
                                                        className="inline-flex h-7 items-center rounded bg-red-400 px-2.5 text-[11px] font-semibold text-white transition hover:bg-red-700"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex min-h-[200px] items-center justify-center px-4">
                                <p className="text-sm text-slate-500">
                                    Nenhum post encontrado.
                                    Crie um novo agora.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
