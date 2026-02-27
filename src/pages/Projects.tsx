import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const projects = [
  { title: "FinTrack Dashboard", tags: ["SaaS", "Finance"], desc: "Real-time financial analytics and reporting platform for enterprise-level portfolio management." },
  { title: "MediConnect", tags: ["Healthcare", "Mobile"], desc: "Telemedicine application connecting patients with certified healthcare providers across East Africa." },
  { title: "LogiFlow", tags: ["Logistics", "Web App"], desc: "End-to-end supply chain management system with real-time GPS tracking and route optimization." },
  { title: "EduSpark LMS", tags: ["EdTech", "SaaS"], desc: "Learning management system supporting live classes, quizzes, and progress tracking for institutions." },
  { title: "AgriSense", tags: ["AgTech", "IoT"], desc: "IoT-powered agricultural monitoring platform providing real-time crop and soil analytics." },
  { title: "PaySwift Gateway", tags: ["FinTech", "Integration"], desc: "Unified payment gateway integrating M-Pesa, card payments, and bank transfers for e-commerce." },
];

const Projects = () => (
  <div className="pt-16">
    <section className="py-24 bg-section-alt">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
          <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">Portfolio</motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-gradient">Projects</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">
            Explore our portfolio of successful projects delivered across diverse industries.
          </motion.p>
        </motion.div>
      </div>
    </section>

    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="h-48 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Project Preview</span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                  ))}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Projects;
