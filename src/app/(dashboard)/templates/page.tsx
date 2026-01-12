'use client';

import { useState } from 'react';
import { useTemplates } from '@/hooks';
import type { Template, TemplateCategory } from '@/types/template';
import { TEMPLATE_CATEGORIES } from '@/types/template';
import TemplateCard from '@/components/templates/TemplateCard';
import TemplatePreviewModal from '@/components/templates/TemplatePreviewModal';
import CloneTemplateModal from '@/components/templates/CloneTemplateModal';
import styles from '@/styles/Templates.module.css';

export default function TemplatesPage() {
  const { templates, loading } = useTemplates();
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');
  const [previewTpl, setPreviewTpl] = useState<Template | null>(null);
  const [cloneTpl, setCloneTpl] = useState<Template | null>(null);

  const filtered =
    category === 'all' ? templates : templates.filter((t) => t.category === category);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Templates</h1>
      <p className={styles.sub}>Start from a ready-made page.</p>

      <div className={styles.filters}>
        <button
          className={category === 'all' ? styles.activeFilter : styles.filter}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={category === c.value ? styles.activeFilter : styles.filter}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.muted}>Loading templates…</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onPreview={() => setPreviewTpl(t)}
              onUse={() => setCloneTpl(t)}
            />
          ))}
        </div>
      )}

      {previewTpl && (
        <TemplatePreviewModal
          template={previewTpl}
          onClose={() => setPreviewTpl(null)}
          onUse={() => {
            setCloneTpl(previewTpl);
            setPreviewTpl(null);
          }}
        />
      )}

      {cloneTpl && (
        <CloneTemplateModal template={cloneTpl} onClose={() => setCloneTpl(null)} />
      )}
    </div>
  );
}
