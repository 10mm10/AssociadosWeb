'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import useAlerts from '@/hooks/useAlerts';
import { FaInstagram, FaFacebookF, FaTiktok, FaLinkedinIn, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

interface BlogPost {
  titulo: string;
  conteudo: string;
  imagem_url?: string;
  autor: string;
  data_publicacao: string;
  slug: string;
}

export default function SitePage() {
  const { successToast, errorAlert } = useAlerts();
  const whatsappNumber1 = "5541984256603";
  const whatsappNumber = "5541987266188";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de mais informações sobre os seus serviços de Assessoria.`;

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
    {
      title: "Gestão Estratégica",
      description: "Reestruturamos processos, fortalecemos a governança e profissionalizamos sua operação. Transformamos a gestão da sua organização em um diferencial competitivo, garantindo eficiência, transparência e resultados mensuráveis que elevam sua credibilidade institucional.",
      imageSrc: "/img/gestaoestrategica.png"
    },
    {
      title: "Captação de Recursos",
      description: "Desenvolvemos estratégias personalizadas para diversificar fontes de financiamento. Elaboramos projetos competitivos, identificamos editais e oportunidades, e construímos relacionamentos estratégicos com apoiadores, garantindo a sustentabilidade financeira de longo prazo.",
      imageSrc: "/img/captacaoderecursos.png"
    },
    {
      title: "Assessoria Jurídica Especializada",
      description: "Oferecemos suporte jurídico completo voltado ao terceiro setor. Garantimos compliance legal, atuamos em demandas judiciais, elaboramos contratos e estatutos, e fornecemos respaldo estratégico em todas as questões legais, protegendo sua instituição contra riscos.",
      imageSrc: "/img/assessoriajuridica.png"
    },
    {
      title: "Certificações e Qualificações",
      description: "Conduzimos todo o processo de obtenção e renovação de certificações essenciais como CEBAS, ISO e Utilidade Pública. Ampliamos seus benefícios fiscais, fortalecemos sua credibilidade institucional e abrimos portas para novas oportunidades de financiamento e parcerias.",
      imageSrc: "/img/certificacao.png"
    },
    {
      title: "Prestação de Contas e Transparência",
      description: "Realizamos o acompanhamento completo da prestação de contas, sempre alinhado ao objeto do projeto e às exigências dos órgãos competentes como TCE, Transferegov, SISTAG e demais plataformas governamentais. Cuidamos de todo o processo, do início ao fim, garantindo conformidade legal, organização documental e transparência absoluta, apoiados por sistemas eficientes que asseguram a credibilidade da sua gestão.",
      imageSrc: "/img/prestacaocontas.png"
    },
    {
      title: "Contabilidade Especializada",
      description: "Oferecemos contabilidade voltada exclusivamente para o terceiro setor, com domínio das particularidades legais e fiscais do segmento. Organizamos registros em conformidade para certificação CEBAS, gerenciamos obrigações acessórias e garantimos informações precisas para tomada de decisão e prestação de contas aos órgãos competentes.",
      imageSrc: "/img/contabilidadeespecializada.png"
    }
  ];

  const depoimentos = [
    { id: 1, nome: "Mariana Silva", cargo: "Gestora de Negocios", texto: "A Assessoria Interagir mudou o patamar do meu negócio. O suporte técnico é rápido e humano.", foto: "https://i.pravatar.cc/150?u=mario" },
    { id: 1, nome: "Mariana Silva", cargo: "Gestora de Negócios", texto: "A Assessoria Interagir mudou o patamar do meu negócio. O suporte técnico é rápido e humano.", foto: "https://i.pravatar.cc/150?u=mario" },
    { id: 2, nome: "Roberta Costa", cargo: "Gerente de Logística", texto: "O sistema web é muito estável e facilitou nossa comunicação interna. Recomendo fortemente.", foto: "https://i.pravatar.cc/150?u=roberta" },
    { id: 3, nome: "Juliana Neves", cargo: "Consultora Independente", texto: "A melhor escolha que fiz este ano. Transparência e eficiência em todos os processos de assessoria.", foto: "https://i.pravatar.cc/150?u=juliana" },
    { id: 4, nome: "Carlos Mendes", cargo: "Diretor de Projetos", texto: "A equipe da Assessoria Interagir é extremamente competente e profissional. Ajudaram a otimizar nossos processos de gestão.", foto: "https://i.pravatar.cc/150?u=carla" },
    { id: 5, nome: "Roberta Almeida", cargo: "Coordenador de Projetos", texto: "A Assessoria Interagir trouxe clareza e estruturação aos nossos processos. Um parceiro confiável e competente.", foto: "https://i.pravatar.cc/150?u=roberta" },
    { id: 6, nome: "Pedro Henrique", cargo: "Coordenador de Projetos", texto: "A Assessoria Interagir trouxe clareza e estruturação aos nossos processos. Um parceiro confiável e competente.", foto: "https://i.pravatar.cc/150?u=pedro" }
  ];

  const cards: Array<{
    title: string;
    imageSrc: string;
    description: string | Array<{ label: string; text: string; }>;
  }> = [
      {
        title: "Nossa Missão",
        description: "Organizar e consolidar a gestão de organizações sociais através da excelência técnica e jurídica, tornando-as instituições sólidas, sustentáveis e protagonistas para maximizar o impacto social e garantir a sustentabilidade de longo prazo de nossos parceiros.",
        imageSrc: "/img/missao.png"
      },
      {
        title: "Nossa Visão",
        description: "Ser referência em assessoria estratégica para o Terceiro Setor no Brasil, reconhecida por converter desafios institucionais em modelos de gestão que são protagonistas na construção de políticas públicas e na transformação de vidas.",
        imageSrc: "/img/visao.png"
      },
      {
        title: "Valores",
        imageSrc: "/img/valores.png",
        description: [
          { label: "Transparência", text: "Agimos com clareza e honestidade em todas as relações." },
          { label: "Compromisso com o Cliente", text: "Buscamos sempre a melhor experiência e resultado." },
          { label: "Inovação", text: "Estamos sempre evoluindo para oferecer soluções melhores." },
          { label: "Responsabilidade", text: "Cumprimos o que prometemos." },
        ]
      }
    ];

  useEffect(() => {
    async function fetchBlogPosts() {
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts?_limit=6&_sort=data_publicacao&_order=desc`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (res.ok) {
          const posts = await res.json();
          setBlogPosts(posts);
        }
      } catch (error) {
        console.error('Falha ao buscar posts do blog:', error);
      }
    }
    fetchBlogPosts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/img/InteragirLogoSemFundo.png" alt="Logo Interagir" className="h-12 w-auto object-contain" />
            <span className="text-3xl font-bold tracking-tight text-slate-600">Assessoria Interagir</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-700 ">
            <Link href="#sobre-section" className="hover:text-blue-900 transition-colors">Quem somos</Link>
            <Link href="/blog" className="hover:text-blue-900 transition-colors">Blog</Link>
            <Link href="#footer" className="hover:text-blue-900 transition-colors">Contato</Link>
            <Link href="/login" className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-colors shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">Área Restrita</Link>
          </nav>

          <button
            className="md:hidden text-2xl p-2 text-slate-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir Menu"
          >
            ☰
          </button>
        </div>

        {/* FUNDO ESCURO DO MENU MOBILE */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* MENU MOBILE SIDEBAR */}
        <div
          className={`fixed top-0 right-0 z-[100] h-dvh w-[85%] max-w-72 bg-white shadow-2xl md:hidden
               transform transition-transform duration-300 ease-in-out
              ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                 `}
        >
          <div className="flex h-full flex-col bg-white">

            {/* CABEÇALHO DO MENU */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5 bg-white">
              <span className="text-xl font-bold text-slate-900">
                Menu
              </span>

              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-3xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Fechar Menu"
              >
                &times;
              </button>
            </div>

            {/* OPÇÕES DO MENU */}
            <nav className="flex-1 bg-white px-4 py-5">
              <ul className="flex flex-col gap-2">

                <li>
                  <Link
                    href="#sobre-section"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 font-medium text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-900"
                  >
                    Quem somos
                  </Link>
                </li>

                <li>
                  <Link
                    href="/blog"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 font-medium text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-900"
                  >
                    Blog
                  </Link>
                </li>

                <li>
                  <Link
                    href="#footer"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 font-medium text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-900"
                  >
                    Contato
                  </Link>
                </li>

                <li className="mt-4">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg bg-blue-500 px-4 py-3 text-center font-semibold text-white shadow-sm transition-all duration-300 hover:bg-blue-400 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Área Restrita
                  </Link>
                </li>

              </ul>
            </nav>

          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow">

        {/* TITULO / HERO SECTION */}
        <section className="bg-gradient-to-b from-blue-900 to-blue-950 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Gestão Estratégica, Captação de Recursos e Segurança Jurídica Especializada para o Terceiro Setor
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed font-light">
              A Interagir é a parceira estratégica que eleva sua organização a um novo patamar de reconhecimento no terceiro setor. Nossa equipe possui mais de uma década de experiência gerenciando as maiores instituições do Brasil.
            </p>
          </div>
        </section>

        {/* NOSSOS SERVIÇOS (SWIPER) */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">Nossos Serviços</span>
            <h2 className="text-3xl font-bold text-slate-600 mt-3">Soluções para a sua Organização</h2>
          </div>

          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={true}
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            style={{ paddingBottom: '50px' }}
          >
            {services.map((service, index) => (
              <SwiperSlide key={`${service.title}-${index}`} className="h-auto">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col justify-between hover:shadow-md transition-shadow text-center">
                  <div>
                    {service.imageSrc && (
                      <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 mx-auto">
                        <img
                          src={service.imageSrc}
                          alt={service.title}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-slate-600 mb-3">
                      {service.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* QUEM SOMOS / SÓCIOS (COM O TEXTO ORIGINAL COMPLETO EM TAILWIND) */}
        <section id="sobre-section" className="bg-slate-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Quem somos
              </h2>

              <p className="mx-auto max-w-4xl text-slate-600 text-base leading-relaxed">
                Somos uma consultoria especializada em impulsionar organizações do terceiro setor, combinando expertise em gestão, captação de recursos e assessoria jurídica em uma parceria estratégica e contínua.
                <br /><br />
                Entendemos que ONGs, associações e fundações enfrentam desafios únicos: recursos limitados, exigências legais complexas e a necessidade constante de demonstrar impacto. Por isso, oferecemos muito mais que consultoria pontual – somos o braço estratégico que sua organização precisa para crescer de forma sustentável.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Sócio 1 - Maira de Oliveira */}
              <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center transition-all duration-300 lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:border-blue-200 lg:hover:ring-2 lg:hover:ring-blue-200">

                <img
                  src="/img/maira1.jpeg"
                  alt="Maira de Oliveira"
                  className="w-32 h-32 rounded-full object-cover mb-6 shadow-md border-4 border-blue-50 lg:grayscale lg:group-hover:grayscale-0 transition-all duration-300"
                />

                <h4 className="text-2xl font-bold text-slate-600 mb-4">
                  Maira de Oliveira
                </h4>

                <p className="text-slate-600 text-base leading-relaxed text-left space-y-3">
                  Sou advogada e pedagoga, com especialização na área de Educação Especial, Gestão de Pessoas e Advocacia no Direito Público e Governança Corporativa, dedicando mais de duas décadas à garantia de direitos da pessoa com deficiência e publico em condição de vulnerabilidade, por meio da consolidação de políticas públicas e fortalecimento do trabalho das Organizações da Sociedade Civil.
                  <br /><br />
                  Minha trajetória é pautada pela intersecção entre o domínio jurídico e a gestão estratégica, com foco na estruturação e gestão de organizações e na execução de políticas públicas para a pessoa com deficiência e populações vulneráveis.
                  <br /><br />
                  Com uma carreira consolidada na gestão de alto impacto, atuei como Diretora da Escola Especializada São Francisco de Assis e na Direção Geral da AFECE, por quase 20 anos, e atualmente, ocupo o cargo de Chefe do Departamento de Educação Inclusiva da Secretaria de Educação do Estado do Paraná (SEED/PR).
                  <br /><br />
                  Sob minha gestão, implantamos importantes projetos e programas, como o Centro Especializado de Reabilitação, com dispensação de OPMAL, implantação de Residência Inclusiva, além de projetos via Lei Rouanet, FIA Municipal, Fia Estadual, Fundo Municipal de Curitiba de Apoio à Pessoa com Deficiência, Pro Esportes e Lei Municipal de Incentivo ao Esporte, e também com o apoio de Fundos Internacionais, Editais de Seleção e Captações via Empresas Privadas e Pessoas Físicas.
                  <br /><br />
                  Minha experiência vai além da gestão executiva; possuo uma atuação política e institucional ativa em conselhos estratégicos. Fui Presidente da FEBIEX (representando 24 entidades de educação especial no Paraná) e atuo como conselheira no CEDCA/PR, no Conselho junto a OAB e Comitê Estadual de Direitos Humanos.
                  <br /><br />
                  Ao contratar a INTERAGIR, você traz para sua organização toda essa expertise em governança, segurança jurídica e gestão de políticas inclusivas. Não oferecemos apenas uma consultoria, mas uma assessoria estratégica especializada em transformar desafios institucionais em resultados sustentáveis. Seja na estruturação de atendimentos, na conformidade legal ou na captação de recursos, somos o parceiro ideal para elevar o impacto social e a excelência da sua entidade. Vamos trabalhar juntos para tornar sua organização uma referência no setor.
                </p>

              </div>

              {/* Sócio 2 - Thiago Alberto Aparecido */}
              <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center transition-all duration-300 lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:border-blue-200 lg:hover:ring-2 lg:hover:ring-blue-200">

                <img
                  src="/img/Thiago.jpeg"
                  alt="Thiago Alberto Aparecido"
                  className="w-32 h-32 rounded-full object-cover mb-6 shadow-md border-4 border-blue-50 lg:grayscale lg:group-hover:grayscale-0 transition-all duration-300"
                />

                <h4 className="text-2xl font-bold text-slate-600 mb-4">
                  Thiago Alberto Aparecido
                </h4>

                <p className="text-slate-600 text-base leading-relaxed text-left space-y-3">
                  Sou advogado, administrador de empresas e especialista em gestão do terceiro setor com mais de uma década de resultados comprovados. Dedico minha carreira a transformar desafios institucionais em crescimento sustentável, combinando domínio jurídico, excelência administrativa e profundo conhecimento das necessidades do setor social.
                  <br /><br />
                  Minha trajetória é marcada por conquistas expressivas. Assumi a gestão da APAE Maringá, a maior unidade do Paraná e a quinta maior do Brasil, comandando operações que garantem mais de 1.000 atendimentos diários com eficiência e impacto real. Atualmente, na Federação das APAEs do Estado do Paraná, sou o líder estratégico de 330 entidades, estruturando soluções que fortalecem as instituições e ampliam o alcance de seus serviços.
                  <br /><br />
                  Durante nove anos, atuei como Conselheiro Estadual dos Direitos da Criança e do Adolescente (CEDCA-PR), contribuindo ativamente para a formulação de políticas públicas que modificam vidas. Essa experiência proporcionou-me uma perspectiva estratégica singular sobre o funcionamento do sistema e as oportunidades à minha disposição.
                  <br /><br />
                  Domino cada etapa da gestão no terceiro setor: desde captação de recursos e obtenção de certificações até governança institucional. Possuo vivência prática para enfrentar os obstáculos que a sua organização encontra - e sei como vencê-los.
                  <br /><br />
                  Ao contratar a INTERAGIR, você leva todo esse conhecimento, experiência e compromisso para dentro da organização. Não oferecemos apenas consultoria, mas sim um parceiro estratégico que tem profundo conhecimento sobre o caminho para tornar sua organização uma referência, com segurança jurídica, saúde financeira e impacto social mensurável. Vamos trabalhar juntos para levar sua organização a um novo nível.
                </p>

              </div>

            </div>

          </div>
        </section>

        {/* PRINCÍPIOS / CARDS */}
        <section className="bg-slate-100 py-14">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-800">
                Nossos Princípios
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Os princípios que orientam nossa atuação e fortalecem nosso compromisso com cada organização atendida.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

              {cards.map((card, index) => (
                <div
                  key={index}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* IMAGEM */}
                  <div className="mb-5 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-50 p-3">
                      <img
                        src={card.imageSrc}
                        alt={card.title}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* TÍTULO */}
                  <h3 className="mb-5 text-center text-xl font-bold text-slate-700">
                    {card.title}
                  </h3>

                  {/* DESCRIÇÃO */}
                  <div className="flex-1">

                    {Array.isArray(card.description) ? (

                      <ul className="space-y-4 text-left">

                        {card.description.map((item, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-3"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
                              ✓
                            </span>

                            <div>
                              <strong className="block text-sm font-semibold text-slate-700">
                                {item.label}
                              </strong>

                              <span className="mt-0.5 block text-sm leading-5 text-slate-500">
                                {item.text}
                              </span>
                            </div>

                          </li>
                        ))}

                      </ul>

                    ) : (

                      <p className="text-center text-sm leading-6 text-slate-600">
                        {card.description}
                      </p>

                    )}

                  </div>

                </div>
              ))}

            </div>

          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Depoimentos</span>
            <h2 className="text-3xl font-bold text-slate-600 mt-3">O que dizem nossos parceiros</h2>
          </div>

          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            style={{ paddingBottom: '50px' }}
          >
            {depoimentos.map((d, index) => (
              <SwiperSlide key={`${d.id}-${index}`} className="h-auto">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div>
                    <span className="text-4xl text-blue-600 font-serif leading-none block mb-2">“</span>
                    <p className="text-slate-600 text-sm italic mb-6">{d.texto}</p>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <img src={d.foto} alt={d.nome} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{d.nome}</h4>
                      <p className="text-xs text-slate-500">{d.cargo}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* BLOG POSTS */}
        {blogPosts.length > 0 && (
          <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-600 text-center mb-12">Últimos Artigos do Nosso Blog!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
                {blogPosts.slice(0, 4).map((post, index: number) => (
                  <article key={`${post.slug}-${index}`} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div>
                      {post.imagem_url && (
                        <div className="relative h-[180px] w-full bg-white p-3">
                          <Image
                            src={
                              post.imagem_url.startsWith('http')
                                ? post.imagem_url
                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${post.imagem_url}`
                            }
                            alt={post.titulo}
                            fill
                            className="object-contain p-3"
                            unoptimized
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{post.titulo}</h3>
                        <p className="text-slate-600 text-xs line-clamp-3 mb-4">{post.conteudo}</p>
                      </div>
                    </div>
                    <div className="px-6 pb-6 pt-0 flex flex-col gap-2">
                      <span className="text-[11px] text-slate-400">Por {post.autor} | {new Date(post.data_publicacao).toLocaleDateString('pt-BR')}</span>
                      <Link href={`/blog/${post.slug}`} className="text-blue-600 font-semibold text-sm hover:underline inline-flex items-center gap-1">
                        Ler mais &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/blog" className="inline-block px-6 py-3 bg-blue-400 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  Acessar Blog da Interagir
                </Link>
              </div>
            </div>
          </section>
        )}
        {/* REDES SOCIAIS */}
        <div className="flex justify-center gap-4 py-8 bg-slate-100 lg:fixed lg:top-24 lg:left-6 lg:z-50 lg:flex-col lg:gap-3 lg:py-0 lg:bg-transparent">
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
      </main>

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
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg items-center justify-center animate-bounce hover:bg-emerald-600 hover:scale-110 transition-transform
    ${isMenuOpen ? 'hidden md:flex' : 'flex'}
  `}
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
}
