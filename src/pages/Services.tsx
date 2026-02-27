import { motion } from "framer-motion";
import { Code, Globe, Cloud, Settings, Monitor, Palette, Layers } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const services = [
  { icon: Code, title: "Custom Software Development", desc: "We build bespoke software solutions from the ground up, tailored precisely to your workflows, data, and business logic. From internal tools to client-facing platforms, we deliver robust, maintainable code." },
  { icon: Globe, title: "Web & Mobile App Development", desc: "Modern, responsive web apps and native mobile applications designed for performance and usability. We work with React, React Native, Flutter, and more to reach your audience on every device." },
  { icon: Layers, title: "SaaS Solutions", desc: "End-to-end SaaS product development including multi-tenancy, subscription billing, analytics dashboards, and scalable cloud infrastructure designed for growth." },
  { icon: Settings, title: "System Integration", desc: "Connect your existing tools, APIs, and data sources into a unified ecosystem. We specialize in ERP integrations, payment gateways, CRM systems, and third-party API orchestration." },
  { icon: Monitor, title: "IT Consulting", desc: "Strategic technology guidance to help you make informed decisions about architecture, stack selection, digital strategy, and technology roadmaps aligned with your business objectives." },
  { icon: Cloud, title: "Cloud Solutions", desc: "Cloud migration, infrastructure setup, and optimization on AWS, Azure, and Google Cloud. We help you leverage the cloud for scalability, reliability, and cost efficiency." },
  { icon: Palette, title: "UI/UX Design", desc: "User-centered design that combines aesthetics with functionality. We create wireframes, prototypes, and polished designs that deliver exceptional user experiences." },
];

const Services = () => (
  <div className="pt-16">
    <section className="py-24 bg-section-alt">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
          <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">Our Services</motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Comprehensive Technology{" "}
            <span className="text-gradient">Solutions</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">
            From concept to deployment, we provide the expertise and tools you need to succeed in today's digital landscape.
          </motion.p>
        </motion.div>
      </div>
    </section>

    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="flex gap-5 p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Services;
