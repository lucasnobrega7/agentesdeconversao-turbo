interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Post: {slug}</h1>
      <p className="text-gray-600">Conteúdo do blog post será carregado aqui</p>
    </div>
  )
}

export function generateStaticParams() {
  return []
}