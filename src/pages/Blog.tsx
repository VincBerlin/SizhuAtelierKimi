import { useEffect } from 'react'
import { Link } from 'react-router'
import { blogPosts } from '../lib/shop'

export default function Blog() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="blog-page">
      <section className="blog-page-hero">
        <p className="section-eyebrow">SIZHU JOURNAL</p>
        <h1>Blog & Artikel</h1>
        <p>Notizen zu BaZi, Wuxing, Praxispostern, Raumwirkung und kommenden Personalisierungen.</p>
      </section>

      <section className="blog-page-list">
        {blogPosts.map((post) => (
          <article id={post.slug} key={post.slug}>
            <div>
              <span>{post.category}</span>
              <time>{post.date}</time>
            </div>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <Link to={`/blog/${post.slug}`}>Weiterlesen →</Link>
          </article>
        ))}
      </section>
    </main>
  )
}
