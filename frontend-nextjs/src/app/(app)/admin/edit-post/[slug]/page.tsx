'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import useAlerts from '@/hooks/useAlerts';
interface Post {
    id: number;
    titulo: string;
    conteudo: string;
    imagem_url: string | null;
    autor: string | null;
    data_publicacao: string;
    slug: string;
}
interface EditPostPageProps {
    params: Promise<{ slug: string }>;
}
export default function EditPostPage({ params }: EditPostPageProps) {
    const { slug } = React.use(params);
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [autor, setAutor] = useState('');
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isImageRemoved, setIsImageRemoved] = useState(false);
    const router = useRouter();
    const {
        successToast,
        errorAlert
    } = useAlerts();
    useEffect(() => {
        async function fetchPost() {
            if (!slug) {
                setLoading(false);
                return;
            }
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${slug}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (res.ok) {
                    const post: Post = await res.json();
                    if (post && post.slug) {
                        setTitulo(post.titulo || '');
                        setConteudo(post.conteudo || '');
                        setAutor(post.autor || '');
                        if (post.imagem_url) {
                            const finalUrl =
                                post.imagem_url.startsWith('http')
                                    ? post.imagem_url
                                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}${post.imagem_url}`;
                            setPreviewUrl(finalUrl);
                        } else {
                            setPreviewUrl(null);
                        }
                    } else {
                        errorAlert(
                            'Post não encontrado.',
                            'Aviso'
                        );
                        router.push('/admin');
                    }
                } else {
                    errorAlert(
                        'Falha ao buscar o post no servidor.'
                    );
                }
            } catch (error) {
                console.error(
                    'Erro ao buscar o post:',
                    error
                );
                errorAlert(
                    'Ocorreu um erro ao buscar o post.'
                );
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [slug, router]);
    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            e.target.files?.[0] || null;
        setImageFile(file);
        setIsImageRemoved(false);
        if (file) {
            setPreviewUrl(
                URL.createObjectURL(file)
            );
        } else {
            setPreviewUrl(null);
        }
    };
    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setIsImageRemoved(true);
        const fileInput =
            document.getElementById(
                'image-upload'
            ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };
    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        setLoading(true);
        if (!titulo || !conteudo) {
            errorAlert(
                'Título e conteúdo são campos obrigatórios.'
            );
            setLoading(false);
            return;
        }
        const token =
            localStorage.getItem('authToken');
        const newSlug = titulo
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
        const formData =
            new FormData();
        formData.append(
            'titulo',
            titulo
        );
        formData.append(
            'conteudo',
            conteudo
        );
        formData.append(
            'autor',
            autor
        );
        formData.append(
            'slug',
            newSlug
        );
        if (imageFile) {
            formData.append(
                'imagem',
                imageFile
            );
        } else if (isImageRemoved) {
            formData.append(
                'removeImage',
                'true'
            );
        }
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${slug}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );
            if (res.ok) {
                successToast(
                    'Post atualizado com sucesso!'
                );
                router.push('/admin');
            } else {
                const errorData =
                    await res.json();
                errorAlert(
                    `Falha ao atualizar o post: ${errorData.error}`
                );
            }
        } catch (error) {
            console.error(
                'Erro ao atualizar o post:',
                error
            );
            errorAlert(
                'Ocorreu um erro ao atualizar o post.'
            );
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="flex h-[calc(100vh-3rem)] w-full items-center justify-center">
                <p className="text-sm text-slate-500">
                    Carregando...
                </p>
            </div>
        );
    }
    return (
        <div className="h-[calc(100vh-2rem)] w-full min-w-0 overflow-hidden md:h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-3rem)]">
            <div className="flex h-full min-h-0 w-full flex-col rounded-lg bg-white p-4 shadow-sm">
                {/* CABEÇALHO */}
                <div className="mb-3 shrink-0 border-b border-slate-100 pb-2">
                    <h1 className="text-xl font-semibold text-slate-800">
                        Editar Post
                    </h1>
                </div>
                {/* FORMULÁRIO */}
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col gap-2.5"
                >
                    {/* TÍTULO E AUTOR */}
                    <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="titulo"
                                className="text-xs font-semibold text-slate-600"
                            >
                                Título
                            </label>
                            <input
                                type="text"
                                id="titulo"
                                value={titulo}
                                onChange={(e) =>
                                    setTitulo(
                                        e.target.value
                                    )
                                }
                                required
                                className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="autor"
                                className="text-xs font-semibold text-slate-600"
                            >
                                Autor
                            </label>
                            <input
                                type="text"
                                id="autor"
                                value={autor}
                                onChange={(e) =>
                                    setAutor(
                                        e.target.value
                                    )
                                }
                                required
                                className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                        </div>
                    </div>
                    {/* IMAGEM */}
                    <div className="shrink-0">
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Imagem
                        </label>
                        <div className="flex items-start gap-3">
                            {/* CONTROLES */}
                            <div className="flex shrink-0 flex-col gap-2">
                                <label
                                    htmlFor="image-upload"
                                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded bg-slate-600 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                                >
                                    {imageFile
                                        ? 'Imagem Selecionada'
                                        : previewUrl
                                            ? 'Trocar Imagem'
                                            : 'Selecionar Imagem'}
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleImageChange
                                    }
                                    className="hidden"
                                />
                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleRemoveImage
                                        }
                                        className="h-7 rounded bg-red-400 px-3 text-[11px] font-semibold text-white transition hover:bg-red-700"
                                    >
                                        Remover Imagem
                                    </button>
                                )}
                            </div>
                            {/* PREVIEW */}
                            {previewUrl ? (
                                <div className="flex h-[105px] w-[180px] shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50 p-1">
                                    <img
                                        src={previewUrl}
                                        alt="Pré-visualização da imagem"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-[70px] flex-1 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50">
                                    <span className="text-[11px] text-slate-400">
                                        Sem imagem
                                    </span>
                                </div>
                            )}
                            {/* NOME NOVA IMAGEM */}
                            {imageFile && (
                                <div className="min-w-0 flex-1 pt-1">
                                    <p className="text-[11px] font-medium text-slate-500">
                                        Nova imagem:
                                    </p>
                                    <p
                                        className="truncate text-xs text-slate-700"
                                        title={
                                            imageFile.name
                                        }
                                    >
                                        {imageFile.name}
                                    </p>
                                </div>
                            )}
                            {/* IMAGEM REMOVIDA */}
                            {isImageRemoved &&
                                !previewUrl && (
                                <div className="pt-1">
                                    <span className="text-[11px] font-medium text-red-500">
                                        A imagem atual será removida ao salvar.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* CONTEÚDO */}
                    <div className="flex min-h-0 flex-1 flex-col gap-1">
                        <label
                            htmlFor="conteudo"
                            className="shrink-0 text-xs font-semibold text-slate-600"
                        >
                            Conteúdo
                        </label>
                        <textarea
                            id="conteudo"
                            value={conteudo}
                            onChange={(e) =>
                                setConteudo(
                                    e.target.value
                                )
                            }
                            required
                            className="min-h-0 flex-1 resize-none rounded border border-slate-300 bg-white px-3 py-2 text-sm leading-5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                    </div>
                    {/* BOTÕES */}
                    <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-8 rounded bg-blue-400 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? 'Atualizando...'
                                : 'Atualizar Post'}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                router.push('/admin')
                            }
                            disabled={loading}
                            className="h-8 rounded bg-slate-500 px-4 text-xs font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}