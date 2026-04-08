import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle, MapPin, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

// Phone validation: allows +, digits, spaces, hyphens, parens. Min 7 digits, max 15 digits (E.164 standard).
const sanitizePhone = (value: string) => {
  // Allow only valid phone characters
  return value.replace(/[^\d\s\-+()]/g, "");
};

const countDigits = (value: string) => value.replace(/\D/g, "").length;

const isValidPhone = (value: string) => {
  const digits = countDigits(value);
  return digits >= 7 && digits <= 15;
};

const Contact = () => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [showMap, setShowMap] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMapSetting = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("value")
        .eq("section", "company")
        .eq("key", "show_map")
        .maybeSingle();
      if (data) {
        const val = data.value as Record<string, string>;
        setShowMap(val.text !== "false");
      }
    };
    loadMapSetting();
  }, []);

  const handlePhoneChange = (value: string) => {
    const sanitized = sanitizePhone(value);
    // Limit total length to 20 chars (including formatting)
    if (sanitized.length <= 20) {
      setForm({ ...form, phone: sanitized });
      if (errors.phone) setErrors({ ...errors, phone: "" });
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "We'd love to know your name";
    else if (form.name.trim().length > 100) e.name = "Name is too long (max 100 characters)";
    if (!form.email.trim()) e.email = "We need your email to get back to you";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address";
    else if (form.email.trim().length > 255) e.email = "Email is too long";
    if (!form.phone.trim()) e.phone = "A phone number helps us reach you faster";
    else if (!isValidPhone(form.phone)) e.phone = "Enter a valid phone number (7–15 digits, e.g. +1 234 567 8901)";
    if (!form.subject.trim()) e.subject = "A brief subject helps us help you faster";
    else if (form.subject.trim().length > 200) e.subject = "Subject is too long (max 200 characters)";
    if (!form.message.trim()) e.message = "Tell us a bit about what you need";
    else if (form.message.trim().length > 2000) e.message = "Message is too long (max 2000 characters)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      return;
    }
    toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setErrors({});
  };

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-xs text-destructive mt-1">{errors[key]}</p> : null;

  return (
    <div className="pt-16">
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">Contact</motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Let's <span className="text-gradient">Talk</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">
              Have a project in mind? We'd love to hear about it. Reach out and let's build something great together.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">Get in Touch</h3>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Phone size={18} className="text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium text-foreground">{settings.phone}</p></div>
              </a>
              <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-accent/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><MessageCircle size={18} className="text-accent" /></div>
                <div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="text-sm font-medium text-foreground">{settings.whatsapp}</p></div>
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Mail size={18} className="text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground">{settings.email}</p></div>
              </a>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><MapPin size={18} className="text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium text-foreground">{settings.location}</p></div>
              </div>
              {showMap && (
                <div className="h-48 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Map Placeholder</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="p-8 rounded-xl border border-border bg-card">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Send Us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Name <span className="text-destructive">*</span></label>
                      <Input placeholder="Your name" maxLength={100} value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }} className={errors.name ? "border-destructive" : ""} />
                      {fieldError("name")}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Email <span className="text-destructive">*</span></label>
                      <Input type="email" placeholder="your@email.com" maxLength={255} value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: "" }); }} className={errors.email ? "border-destructive" : ""} />
                      {fieldError("email")}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Phone <span className="text-destructive">*</span></label>
                      <Input
                        type="tel"
                        placeholder="+1 234 567 8901"
                        value={form.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      <p className="text-[10px] text-muted-foreground mt-0.5">Include country code (e.g. +1, +254, +44)</p>
                      {fieldError("phone")}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Subject <span className="text-destructive">*</span></label>
                      <Input placeholder="Project inquiry" maxLength={200} value={form.subject} onChange={(e) => { setForm({ ...form, subject: e.target.value }); if (errors.subject) setErrors({ ...errors, subject: "" }); }} className={errors.subject ? "border-destructive" : ""} />
                      {fieldError("subject")}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Message <span className="text-destructive">*</span></label>
                    <Textarea placeholder="Tell us about your project..." rows={5} maxLength={2000} value={form.message} onChange={(e) => { setForm({ ...form, message: e.target.value }); if (errors.message) setErrors({ ...errors, message: "" }); }} className={errors.message ? "border-destructive" : ""} />
                    <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{form.message.length}/2000</p>
                    {fieldError("message")}
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Message"} <Send size={16} className="ml-2" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReviewSection />
    </div>
  );
};

const ReviewSection = () => {
  const { toast } = useToast();
  const [review, setReview] = useState({ name: "", role: "", quote: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("testimonials").insert({
      name: review.name, role: review.role, quote: review.quote, status: "pending", is_featured: false,
    });
    if (error) {
      toast({ title: "Error", description: "Could not submit review.", variant: "destructive" });
      return;
    }
    toast({ title: "Review Submitted!", description: "Thank you! Your review will be reviewed by our team." });
    setReview({ name: "", role: "", quote: "" });
    setSubmitted(true);
  };

  return (
    <section className="py-24 bg-section-alt">
      <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
        <div className="text-center mb-8">
          <Star size={24} className="mx-auto text-primary mb-3" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Leave a Review</h2>
          <p className="text-sm text-muted-foreground">Share your experience working with us</p>
        </div>
        {submitted ? (
          <div className="text-center py-8">
            <p className="text-foreground font-medium">Thank you for your review!</p>
            <p className="text-sm text-muted-foreground mt-1">It will appear on our site once approved.</p>
            <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>Submit Another</Button>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4 p-8 rounded-xl border border-border bg-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Your Name</label>
                <Input placeholder="Your name" maxLength={100} value={review.name} onChange={(e) => setReview({ ...review, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Company / Role</label>
                <Input placeholder="CEO at Company" maxLength={100} value={review.role} onChange={(e) => setReview({ ...review, role: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Your Review</label>
              <Textarea placeholder="Tell us about your experience..." rows={4} maxLength={1000} value={review.quote} onChange={(e) => setReview({ ...review, quote: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full sm:w-auto">Submit Review</Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Contact;
