import { useState, useEffect } from 'react';
import type { Template } from '@/types/template';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/templates');
        const data = await res.json();
        if (active) setTemplates(data.templates || []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { templates, loading };
}
