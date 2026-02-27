import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-card border-t border-border">
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gradient font-display text-xl font-bold">eTech</span>
            <span className="font-display text-sm font-medium text-muted-foreground">softwares</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Delivering innovative technology solutions that drive growth and transform businesses worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["About", "Services", "Projects", "Products", "Contact"].map((link) => (
              <Link key={link} to={`/${link.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* Services */}
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

        {/* Contact */}
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Contact Us</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <a href="tel:+254796867637" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone size={14} /> +254 796 867 637
            </a>
            <a href="mailto:etechsoftwares@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail size={14} /> etechsoftwares@gmail.com
            </a>
            <div className="flex items-center gap-2">
              <MapPin size={14} /> Nairobi, Kenya
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} eTech Softwares. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
