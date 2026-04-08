import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const { settings } = useSiteSettings();
  const [adminExists, setAdminExists] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.functions.invoke("manage-users", {
          body: { action: "check_admin_exists" },
        });
        setAdminExists(data?.exists ?? true);
      } catch {
        setAdminExists(true);
      }
    };
    check();
  }, []);

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gradient font-display text-xl font-bold">eTech</span>
              <span className="font-display text-sm font-medium text-muted-foreground">softwares</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{settings.tagline}</p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {["About", "Services", "Projects", "Products", "Contact"].map((link) => (
                <Link key={link} to={`/${link.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Services</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>Custom Software</span>
              <span>Web & Mobile Apps</span>
              <span>SaaS Solutions</span>
              <span>Cloud Solutions</span>
              <span>IT Consulting</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone size={14} /> {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={14} /> {settings.email}
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> {settings.location}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} {settings.company_name}. All rights reserved.</span>
          {!adminExists && (
            <Link to="/admin/setup" className="hover:text-primary transition-colors">Setup Admin</Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
