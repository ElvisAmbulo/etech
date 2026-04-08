import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
};

const IframePreview = ({ src, title }: { src: string; title: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setScale(width / 1280);
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden rounded-lg">
      <iframe
        src={src}
        title={title}
        className="absolute top-0 left-0 border-0 pointer-events-none"
        style={{ width: "1280px", height: "800px", transform: `scale(${scale})`, transformOrigin: "top left" }}
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").order("display_order").then(({ data }) => setProducts(data ?? []));
  }, []);

  return (
    <div className="pt-16">
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">Products</motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">Our <span className="text-gradient">Software Products</span></motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">Ready-to-use software solutions designed to solve real business challenges.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground">No products to display yet.</p>
          ) : (
            <div className="space-y-8">
              {products.map((p, i) => (
                <motion.div key={p.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={i} variants={fadeUp}
                  className="flex flex-col md:flex-row gap-8 p-8 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                  <div className="md:w-1/3 rounded-lg bg-muted shrink-0 overflow-hidden relative" style={{ aspectRatio: "16/10" }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : p.cta_link && (p.cta_link.startsWith("http://") || p.cta_link.startsWith("https://")) ? (
                      <IframePreview src={p.cta_link} title={`${p.name} preview`} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Product Screenshot</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-foreground mb-3">{p.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(p.features ?? []).map((f: string) => (
                        <span key={f} className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{f}</span>
                      ))}
                    </div>
                    <Link to={p.cta_link || "/contact"}>
                      <Button size="sm">{p.cta_text || "Learn More"} <ArrowRight size={14} className="ml-1" /></Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
