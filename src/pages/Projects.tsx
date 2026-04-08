import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
};

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

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("projects").select("*").order("display_order").then(({ data }) => setProjects(data ?? []));
  }, []);

  return (
    <div className="pt-16">
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">Portfolio</motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">Our <span className="text-gradient">Projects</span></motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">Explore our portfolio of successful projects delivered across diverse industries.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground">No projects to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => (
                <motion.div key={p.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={i} variants={fadeUp}
                  className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="bg-muted overflow-hidden relative" style={{ aspectRatio: "16/10" }}>
                    <ProjectPreview project={p} />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(p.tags ?? []).map((tag: string) => (
                        <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
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

export default Projects;
