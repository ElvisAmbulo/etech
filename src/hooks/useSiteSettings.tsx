import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  company_name: string;
  phone: string;
  whatsapp: string;
  whatsapp_number: string;
  email: string;
  location: string;
  tagline: string;
}

const defaults: SiteSettings = {
  company_name: "eTech Softwares",
  phone: "+254 796 867 637",
  whatsapp: "+254 745 534 176",
  whatsapp_number: "254745534176",
  email: "etechsoftwares@gmail.com",
  location: "Nairobi, Kenya",
  tagline: "Delivering innovative technology solutions that drive growth and transform businesses worldwide.",
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("*")
        .eq("section", "company");
      if (data) {
        const s = { ...defaults };
        data.forEach((row) => {
          const val = row.value as Record<string, string>;
          const key = row.key;
          if (key === "name") s.company_name = val.text ?? s.company_name;
          else if (key === "phone") s.phone = val.text ?? s.phone;
          else if (key === "whatsapp") s.whatsapp = val.text ?? s.whatsapp;
          else if (key === "whatsapp_number") s.whatsapp_number = val.text ?? s.whatsapp_number;
          else if (key === "email") s.email = val.text ?? s.email;
          else if (key === "location") s.location = val.text ?? s.location;
          else if (key === "tagline") s.tagline = val.text ?? s.tagline;
        });
        setSettings(s);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { settings, loading };
};
