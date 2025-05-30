interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Post: {params.slug}</h1>
      <p className="text-gray-600">Conteúdo do blog post será carregado aqui</p>
    </div>
  )
}

export function generateStaticParams() {
  return []
}