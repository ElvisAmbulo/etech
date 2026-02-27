import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Code, Globe, Cloud, Palette, Monitor, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const services = [
  { icon: Code, title: "Custom Software", desc: "Tailored solutions built to fit your unique business processes." },
  { icon: Globe, title: "Web & Mobile Apps", desc: "Responsive, high-performance applications for every platform." },
  { icon: Cloud, title: "SaaS Solutions", desc: "Scalable cloud-based software products for modern businesses." },
  { icon: Settings, title: "System Integration", desc: "Seamlessly connect your tools and systems for maximum efficiency." },
  { icon: Monitor, title: "IT Consulting", desc: "Expert guidance to align your technology with business goals." },
  { icon: Palette, title: "UI/UX Design", desc: "Beautiful, intuitive interfaces that users love." },
];

const projects = [
  { title: "FinTrack Dashboard", tag: "SaaS", desc: "Real-time financial analytics platform for enterprise clients." },
  { title: "MediConnect", tag: "Healthcare", desc: "Telemedicine app connecting patients with healthcare providers." },
  { title: "LogiFlow", tag: "Logistics", desc: "Supply chain management system with real-time tracking." },
];

const testimonials = [
  { name: "Sarah Kimani", role: "CEO, NovaTech", quote: "eTech Softwares transformed our operations with a custom ERP that exceeded expectations." },
  { name: "James Oduor", role: "CTO, Greenfield Ltd", quote: "Their team delivered a complex SaaS platform on time and within budget. Highly recommend." },
  { name: "Amina Hassan", role: "Founder, Sahara Labs", quote: "Professional, innovative, and reliable. They're our go-to technology partner." },
];

const clients = ["Acme Corp", "GlobalTech", "InnoVate", "PrimeNet", "SkyBridge", "Vantage"];

const Index = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container relative mx-auto px-4 lg:px-8 pt-24 pb-16">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">
              Technology Solutions Partner
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Building the future,{" "}
              <span className="text-gradient">one solution at a time.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              We design, develop, and deploy software solutions that help businesses innovate, scale, and thrive in a digital-first world.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <Link to="/contact">
                <Button size="lg">
                  Request a Quote <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Book a Consultation
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="What We Do" title="Our Services" description="We offer end-to-end technology services to power your digital transformation." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <s.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Our Work" title="Featured Projects" description="A selection of projects that showcase our expertise and commitment to excellence." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <motion.div
                key={p.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Project Preview</span>
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-primary">{p.tag}</span>
                  <h3 className="font-display font-semibold text-foreground mt-1 mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/projects">
              <Button variant="outline">
                View All Projects <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Testimonials" title="What Our Clients Say" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-wider">Trusted by Leading Companies</p>
          <div className="flex flex-wrap justify-center gap-8">
            {clients.map((c) => (
              <div key={c} className="px-6 py-3 rounded-lg bg-muted text-muted-foreground font-display font-semibold text-sm">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-2xl bg-primary p-12 md:p-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Build Something Great?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Let's discuss your project and find the perfect solution for your business.
            </p>
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Get Started Today <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
