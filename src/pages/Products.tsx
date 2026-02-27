import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const products = [
  {
    title: "eTech CRM",
    desc: "A lightweight, powerful customer relationship management tool designed for small and medium businesses. Track leads, manage pipelines, and close deals faster.",
    features: ["Contact Management", "Pipeline Tracking", "Email Integration", "Analytics Dashboard"],
  },
  {
    title: "CloudBooks",
    desc: "Simple, intuitive accounting and invoicing software for freelancers and SMEs. Send professional invoices, track expenses, and generate financial reports effortlessly.",
    features: ["Invoicing", "Expense Tracking", "Financial Reports", "Multi-Currency Support"],
  },
  {
    title: "TaskForge",
    desc: "Project management and team collaboration platform built for agile teams. Plan sprints, assign tasks, and track progress with real-time updates.",
    features: ["Sprint Planning", "Kanban Boards", "Time Tracking", "Team Chat"],
  },
];

const Products = () => (
  <div className="pt-16">
    <section className="py-24 bg-section-alt">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
          <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">Products</motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-gradient">Software Products</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">
            Ready-to-use software solutions designed to solve real business challenges.
          </motion.p>
        </motion.div>
      </div>
    </section>

    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="space-y-8">
          {products.map((p, i) => (
            <motion.div
              key={p.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="flex flex-col md:flex-row gap-8 p-8 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="md:w-1/3 h-48 md:h-auto rounded-lg bg-muted flex items-center justify-center shrink-0">
                <span className="text-muted-foreground text-sm">Product Screenshot</span>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.features.map((f) => (
                    <span key={f} className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{f}</span>
                  ))}
                </div>
                <Link to="/contact">
                  <Button size="sm">
                    Learn More <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Products;
