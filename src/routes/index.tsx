import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, MessageCircle, Plus, BatteryCharging, Zap, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/ie-logo-wide.png";
import mark from "@/assets/ie-mark-e.png";
import wordmark from "@/assets/ie-hero-wordmark.png";
import stillLife from "@/assets/accessories-still-life.png";
import { CATEGORIES, formatPrice, orderLink, productsQuery, type Product } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "ie accessories — Everyday essentials. Elevated." },
    { name: "description", content: "Discover power banks, chargers and phone cases from ie accessories. Find your everyday essentials and order on WhatsApp." },
    { property: "og:title", content: "ie accessories — Everyday essentials. Elevated." },
    { property: "og:description", content: "A considered collection of power banks, chargers and phone cases. Order directly on WhatsApp." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Store,
});

const categoryIcons = [BatteryCharging, Zap, Smartphone];

function Store() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const [category, setCategory] = useState("All");
  const visible = category === "All" ? products : products.filter((product) => product.category === category);
  function selectCategory(value: string) {
    setCategory(value);
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <main className="storefront">
      <header className="store-nav">
        <a href="#top" aria-label="ie accessories home" className="brand-logo"><img src={mark} alt="ie accessories" /></a>
        <span className="nav-note">Small things. Big difference.</span>
        <Button asChild variant="ghost" className="nav-contact"><a href={orderLink()} target="_blank" rel="noreferrer"><MessageCircle /> <span>Let’s talk</span><ArrowUpRight /></a></Button>
      </header>

      <section id="top" className="product-hero">
        <img src={stillLife} className="hero-photograph" alt="Graphite power bank, blue phone case, white charger and USB-C cables" fetchPriority="high" />
        <div className="hero-copy">
          <p className="editorial-label"><span className="brand-dot" /> YOUR EVERYDAY, UPGRADED</p>
          <h1 className="hero-mark"><img src={wordmark} alt="ie accessories" /></h1>
          <p className="hero-description">Good energy. <br />Great essentials.</p>
          <Button asChild className="hero-shop"><a href="#collection">Explore the collection <ArrowUpRight /></a></Button>
        </div>
        <div className="hero-caption"><span>POWER. PROTECT. CONNECT.</span><span>01 — THE EVERYDAY COLLECTION</span></div>
        <a href="#collection" className="hero-scroll" aria-label="Scroll to collection"><ArrowDown /></a>
      </section>

      <div className="category-index" aria-label="Shop by category">
        {CATEGORIES.map((name, index) => {
          const Icon = categoryIcons[index] ?? Zap;
          return <Button key={name} variant="ghost" className="category-index-link" onClick={() => selectCategory(name)}><span className="category-number">0{index + 1}</span><Icon /><span>{name}</span><ArrowUpRight className="category-arrow" /></Button>;
        })}
      </div>

      <section id="collection" className="collection-section">
        <div className="collection-heading">
          <div><p className="editorial-label text-muted-foreground">LESS NOISE. BETTER ESSENTIALS.</p><h2>The good stuff<span className="text-primary">.</span></h2></div>
          <p className="collection-count">A little power. A little protection.<br />A lot more you.</p>
        </div>
        <div className="collection-controls"><div role="group" aria-label="Filter products" className="collection-filters">{["All", ...CATEGORIES].map((name) => <Button key={name} variant="ghost" aria-pressed={category === name} onClick={() => setCategory(name)} className={`collection-filter ${category === name ? "is-active" : ""}`}>{name === "All" ? "All essentials" : name}</Button>)}</div><span className="product-count">{visible.length} items</span></div>
        {visible.length ? <div className="product-grid">{visible.map((product, index) => <ProductItem key={product.id} product={product} index={index} />)}</div> : <p className="empty-collection">Something good is on its way.</p>}
      </section>

      <footer className="store-footer">
        <div className="footer-top"><p className="editorial-label">GOOD THINGS START WITH A HELLO.</p><Button asChild variant="ghost" className="footer-chat"><a href={orderLink()} target="_blank" rel="noreferrer">Let’s connect <ArrowUpRight /></a></Button></div>
        <div className="footer-wordmark" aria-hidden="true">stay connected<span>↗</span></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} ie accessories</span><span>Power banks · Chargers · Phone cases</span></div>
      </footer>
    </main>
  );
}

function ProductItem({ product, index }: { product: Product; index: number }) {
  return (
    <article className="product-item group">
      <a href={orderLink(product)} target="_blank" rel="noreferrer" className="product-image-link" aria-label={`Order ${product.name} on WhatsApp`}>
        <img src={product.image_url || logo} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.src = logo; }} />
        <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <span className="product-open"><ArrowUpRight /></span>
      </a>
      <div className="product-meta"><span>{product.category}</span><span>{formatPrice(Number(product.price))}</span></div>
      <div className="product-name-row"><h3>{product.name}</h3><Button asChild variant="ghost" size="icon" className="product-order"><a href={orderLink(product)} target="_blank" rel="noreferrer" aria-label={`Order ${product.name}`} title="Order on WhatsApp"><Plus /></a></Button></div>
      <p className="product-description">{product.description}</p>
    </article>
  );
}
