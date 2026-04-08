import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Eye } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const About = () => {
  const { get } = useSiteContent();
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("team_members").select("*").eq("is_active", true).order("display_order").then(({ data }) => setTeam(data ?? []));
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">About Us</motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Driven by Innovation,{" "}<span className="text-gradient">Powered by Expertise.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">
              eTech Softwares was founded with a singular vision: to empower businesses through technology. From startups to enterprises, we partner with organizations to build solutions that create lasting impact.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="p-8 rounded-xl border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target size={22} className="text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Our Mission</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {get("about", "mission", "To deliver cutting-edge, reliable, and scalable technology solutions that accelerate business growth and digital transformation for our clients across Africa and beyond.")}
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="p-8 rounded-xl border border-border bg-card">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Eye size={22} className="text-accent" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Our Vision</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {get("about", "vision", "To become the leading technology partner in Africa, recognized for innovation, quality, and the ability to turn complex challenges into elegant software solutions.")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <SectionHeading badge="Our Story" title="From Idea to Impact" />
          <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
            <p>eTech Softwares began as a small team of passionate developers who believed that technology should be accessible, affordable, and impactful. What started as a freelance collective quickly grew into a full-service software company.</p>
            <p>Today, we serve clients ranging from ambitious startups to established enterprises, delivering projects that span custom software, cloud platforms, mobile applications, and everything in between.</p>
            <p>We're proud of the relationships we've built and the solutions we've delivered. Every project is an opportunity to push boundaries and create something meaningful.</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Our Team" title="The People Behind the Code" description="A talented, diverse team committed to delivering exceptional results." />
          {team.length === 0 ? (
            <p className="text-center text-muted-foreground">Team information coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => {
                const initials = member.initials || getInitials(member.name);
                return (
                  <motion.div key={member.id} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                    className="text-center p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-bold text-primary text-lg">{initials}</span>
                      )}
                    </div>
                    <h4 className="font-display font-semibold text-foreground">{member.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
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

export default About;
