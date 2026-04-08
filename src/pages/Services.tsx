import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code, Globe, Cloud, Settings, Monitor, Palette, Layers, Cpu, Database, Shield, Smartphone, Zap } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
};

const iconMap: Record<string, any> = { Code, Globe, Cloud, Settings, Monitor, Palette, Layers, Cpu, Database, Shield, Smartphone, Zap };

const Services = () => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("services").select("*").eq("is_active", true).order("display_order").then(({ data }) => setServices(data ?? []));
  }, []);

  return (
    <div className="pt-16">
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">Our Services</motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">Comprehensive Technology{" "}<span className="text-gradient">Solutions</span></motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">From concept to deployment, we provide the expertise and tools you need to succeed in today's digital landscape.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          {services.length === 0 ? (
            <p className="text-center text-muted-foreground">No services to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((s, i) => {
                const Icon = iconMap[s.icon] || Code;
                return (
                  <motion.div key={s.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={i} variants={fadeUp}
                    className="flex gap-5 p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Services;
