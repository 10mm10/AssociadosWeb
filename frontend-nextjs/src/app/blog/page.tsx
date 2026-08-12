'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import useAlerts from '@/hooks/useAlerts';
import { FaInstagram, FaFacebookF, FaTiktok, FaLinkedinIn, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
interface Post {
  id: number;
  titulo: string;
  conteudo: string;
  imagem_url: string;
  autor: string;
  data_publicacao: string;
  slug: string;
  likes_count: number;
}
export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { successToast, errorAlert } = useAlerts();
  const formatImageSrc = (src: string) => {
    if (!src) return '';
    if (src.includes('https://')) {
      const parts = src.split('https://');
      return `https://${parts[parts.length - 1]}`;
    }
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${src}`;
  };
  useEffect(() => {
    async function getPosts() {
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
        if (!res.ok) {
          throw new Error();
        }
        const data: Post[] = await res.json();
        setPosts(data);
        setFilteredPosts(data);
      } catch {
        errorAlert(
          'Não foi possível carregar os artigos.'
        );
      } finally {
        setIsLoading(false);
      }
    }
    getPosts();
  }, []);
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPosts(posts);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredPosts(
      posts.filter(
        post =>
          post.titulo
            .toLowerCase()
            .includes(term) ||
          post.conteudo
            .toLowerCase()
            .includes(term)
      )
    );
  }, [searchTerm, posts]);
  const whatsappNumber1 = "5541984256603";
  const whatsappNumber = "5541987266188";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de mais informações sobre os seus serviços de Assessoria.`;
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    );
  const sharePost = async (
    slug: string,
    title: string
  ) => {
    const url =
      `${window.location.origin}/blog/${slug}`;
    if (navigator.share) {
      await navigator.share({
        title,
        url
      });
    } else {
      await navigator.clipboard.writeText(
        url
      );
      successToast(
        'Link copiado!'
      );
    }
  };
  const handleLike = async (id: number) => {
    const token =
      localStorage.getItem('authToken');
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${id}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setPosts(prev =>
        prev.map(post =>
          post.id === id
            ? {
              ...post,
              likes_count:
                (post.likes_count || 0) + 1
            }
            : post
        )
      );
      successToast(
        'Gostei registrado!'
      );
    } catch {
      errorAlert(
        'Erro ao registrar gostei.'
      );
    }
  };
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      {/* =====================================================
                CABEÇALHO
            ====================================================== */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Blog da Interagir
            </h1>
            <p className="text-sm text-slate-500">
              Notícias Jurídicas e Corporativas
            </p>
          </div>
          <div className="w-full max-w-md">
            <input
              type="text"
              placeholder="Pesquisar artigos..."
              value={searchTerm}
              onChange={e =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </header>
      {/* =====================================================
                CONTEÚDO
            ====================================================== */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-slate-500">
              Carregando artigos...
            </p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* IMAGEM */}
                {post.imagem_url && (
                  <div className="relative h-[150px] w-full overflow-hidden bg-slate-50">
                    <Image
                      src={formatImageSrc(post.imagem_url)}
                      alt={post.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                )}
                {/* CONTEÚDO DO CARD */}
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="mb-2 line-clamp-2 text-lg font-semibold leading-6 text-slate-800">
                    {post.titulo}
                  </h2>
                  <p className="mb-3 text-[11px] text-slate-400">
                    Por{' '}
                    <span className="font-medium text-slate-500">
                      {post.autor}
                    </span>
                    {' • '}
                    {formatDate(
                      post.data_publicacao
                    )}
                  </p>
                  <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {post.conteudo.substring(
                      0,
                      120
                    )}
                    {post.conteudo.length > 120
                      ? '...'
                      : ''}
                  </p>
                  <div className="mt-auto">
                    {/* AÇÕES */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          sharePost(
                            post.slug,
                            post.titulo
                          )
                        }
                        className="h-8 rounded bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                      >
                        Compartilhar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleLike(
                            post.id
                          )
                        }
                        className="h-8 rounded bg-blue-50 px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        Gostei (
                        {post.likes_count || 0}
                        )
                      </button>
                    </div>
                    {/* LEIA MAIS */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Leia mais →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
            <p className="text-sm text-slate-500">
              Nenhum artigo encontrado.
            </p>
          </div>
        )}
      </main>

      {/* REDES SOCIAIS */}
      <div className="
  flex justify-center gap-4 py-8 bg-slate-100
  lg:fixed lg:top-24 lg:left-6 lg:z-50
  lg:flex-col lg:gap-3 lg:py-0 lg:bg-transparent
">
        <a
          href="https://www.instagram.com/mairadeoliveira_pcd"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white hover:-translate-y-1 hover:scale-105 hover:shadow-md transition-all duration-300"
        >
          <FaInstagram size={20} />
        </a>

        <a
          href="https://facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-400 hover:text-white hover:-translate-y-1 hover:scale-105 hover:shadow-md transition-all duration-300"
        >
          <FaFacebookF size={20} />
        </a>

        <a
          href="https://tiktok.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white hover:-translate-y-1 hover:scale-105 hover:shadow-md transition-all duration-300"
        >
          <FaTiktok size={20} />
        </a>

        <a
          href="https://linkedin.com/in/maíra-oliveira-310a042a"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-700 hover:bg-blue-400 hover:text-white hover:-translate-y-1 hover:scale-105 hover:shadow-md transition-all duration-300"
        >
          <FaLinkedinIn size={20} />
        </a>
      </div>

      {/* FOOTER */}
      <footer id="footer" className="bg-slate-900 text-slate-300 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Sobre Nós</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">A Interagir é a parceira estratégica que impulsiona sua organização a conquistar reconhecimento e protagonismo no campo social.</p>
            <p className="text-xs text-slate-400 font-semibold">INTERAGIR ASSESSORIA E CONSULTORIA LTDA</p>
            <p className="text-xs text-slate-500">CNPJ: 65.754.154/0001-14</p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Voltar ao inicio</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contato</h3>

            {/* E-mail */}
            <p className="text-sm text-slate-400 mb-2">
              <a
                href="mailto:assessoria.interagir2026@gmail.com"
                className="group flex items-center gap-2 transition-all duration-300 hover:text-white hover:-translate-y-1"
              >
                <FaEnvelope className="text-base" />
                assessoria.interagir2026@gmail.com
              </a>
            </p>

            {/* WhatsApp Thiago */}
            <p className="text-sm text-slate-400 mb-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Olá! Gostaria de mais informações sobre os seus serviços de Assessoria.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 transition-all duration-300 hover:text-white hover:-translate-y-1"
              >
                <FaWhatsapp className="text-base" />
                (41) 98726-6188 Thiago Alberto
              </a>
            </p>

            {/* WhatsApp Maira */}
            <p className="text-sm text-slate-400">
              <a
                href={`https://wa.me/${whatsappNumber1}?text=Olá! Gostaria de mais informações sobre os seus serviços de Assessoria.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 transition-all duration-300 hover:text-white hover:-translate-y-1"
              >
                <FaWhatsapp className="text-base" />
                (41) 98425-6603 Maira de Oliveira
              </a>
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Interagir. Todos os direitos reservados.</p>
          <p>Tecnologia: MM10Sistemas</p>
        </div>
      </footer>

      {/* BOTÃO FLUTUANTE WHATSAPP */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center animate-bounce hover:bg-emerald-600 hover:scale-110 transition-transform"
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
}
