import { MetadataRoute } from "next";

interface Post {
  slug: string;
  data_publicacao?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.assessoria-interagir.com.br";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const paginasFixas: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  if (!backendUrl) {
    return paginasFixas;
  }

  try {
    const response = await fetch(`${backendUrl}/posts`, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      return paginasFixas;
    }

    const posts: Post[] = await response.json();

    const artigos: MetadataRoute.Sitemap = posts
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.data_publicacao
          ? new Date(post.data_publicacao)
          : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

    return [
      ...paginasFixas,
      ...artigos,
    ];

  } catch (error) {
    console.error("Erro ao gerar sitemap:", error);

    return paginasFixas;
  }
}