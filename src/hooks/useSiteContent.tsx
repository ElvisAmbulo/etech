import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSiteContent = () => {
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_content").select("*");
      if (data) {
        const map: Record<string, Record<string, string>> = {};
        data.forEach((row) => {
          const key = `${row.section}.${row.key}`;
          const val = row.value as Record<string, string>;
          map[key] = val;
        });
        setContent(map);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const get = (section: string, key: string, fallback: string = ""): string => {
    return content[`${section}.${key}`]?.text ?? fallback;
  };

  return { get, loading };
};
