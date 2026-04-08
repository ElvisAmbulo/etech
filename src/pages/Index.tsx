import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Code, Globe, Cloud, Palette, Monitor, Settings, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
};

const iconMap: Record<string, any> = { Code, Globe, Cloud, Settings, Monitor, Palette, Layers };

const ProjectPreview = ({ project }: { project: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      setScale(containerRef.current.offsetWidth / 1280);
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  if (project.image_url) {
    return <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />;
  }
  if (project.site_url) {
    return (
      <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-background">
        <iframe
          src={project.site_url}
          title={project.title}
          className="absolute top-0 left-0 border-0 pointer-events-none"
          style={{ width: "1280px", height: "800px", transform: `scale(${scale})`, transformOrigin: "top left" }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }
  return <span className="text-muted-foreground text-sm">Project Preview</span>;
};

const TestimonialCarousel = ({ testimonials }: { testimonials: any[] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (testimonials.length === 0) return <p className="text-center text-muted-foreground">No testimonials yet.</p>;

  const current = testimonials[index];

  return (
    <div className="max-w-2xl mx-auto text-center min-h-[160px] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="space-y-4"
        >
          <p className="text-muted-foreground leading-relaxed italic">"{current.quote}"</p>
          <div>
            <p className="font-semibold text-foreground text-sm">{current.name}</p>
            <p className="text-xs text-muted-foreground">{current.role}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      {testimonials.length > 1 && (
        <div className="flex gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? "bg-primary w-6" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const { get } = useSiteContent();
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showTestimonials, setShowTestimonials] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [svc, proj, test, toggleRes] = await Promise.all([
        supabase.from("services").select("*").eq("is_active", true).order("display_order").limit(6),
        supabase.from("projects").select("*").eq("is_featured", true).order("display_order").limit(3),
        supabase.from("testimonials").select("*").eq("is_featured", true).eq("status", "approved").order("display_order"),
        supabase.from("site_content").select("value").eq("section", "company").eq("key", "show_testimonials").maybeSingle(),
      ]);
      setServices(svc.data ?? []);
      setProjects(proj.data ?? []);
      setTestimonials(test.data ?? []);
      if (toggleRes.data) {
        const val = toggleRes.data.value as Record<string, string>;
        setShowTestimonials(val.text !== "false");
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container relative mx-auto px-4 lg:px-8 pt-24 pb-16">
          <motion.div className="max-w-2xl" initial="hidden" animate="visible">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">
              {get("hero", "badge", "Technology Solutions Partner")}
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              {get("hero", "headline", "Building the future,")}{" "}
              <span className="text-gradient">one solution at a time.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              {get("hero", "subheadline", "We design, develop, and deploy software solutions that help businesses innovate, scale, and thrive in a digital-first world.")}
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <Link to="/contact"><Button size="lg">Request a Quote <ArrowRight size={16} className="ml-2" /></Button></Link>
              <Link to="/contact"><Button variant="outline" size="lg">Book a Consultation</Button></Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="What We Do" title="Our Services" description="We offer end-to-end technology services to power your digital transformation." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const Icon = iconMap[s.icon] || Code;
              return (
                <motion.div key={s.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={i} variants={fadeUp}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Our Work" title="Featured Projects" description="A selection of projects that showcase our expertise and commitment to excellence." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={i} variants={fadeUp}
                className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-muted overflow-hidden relative" style={{ aspectRatio: "16/10" }}>
                  <ProjectPreview project={p} />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(p.tags ?? []).map((tag: string) => (
                      <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-display font-semibold text-foreground mt-1 mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/projects"><Button variant="outline">View All Projects <ArrowRight size={16} className="ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {showTestimonials && (
        <section className="py-24 bg-section-alt">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeading badge="Testimonials" title="What Our Clients Say" />
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-2xl bg-primary p-12 md:p-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {get("cta", "headline", "Ready to Build Something Great?")}
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              {get("cta", "description", "Let's discuss your project and find the perfect solution for your business.")}
            </p>
            <Link to="/contact"><Button variant="secondary" size="lg">Get Started Today <ArrowRight size={16} className="ml-2" /></Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
