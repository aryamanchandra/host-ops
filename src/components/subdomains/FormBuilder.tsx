'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { useFormSchema } from '@/hooks';
import { DEFAULT_FORM_SCHEMA } from '@/types/form';
import type { FormSchema, FormField, FormFieldType } from '@/types/form';
import styles from '@/styles/Forms.module.css';

const TYPES: FormFieldType[] = [
  'text',
  'email',
  'textarea',
  'number',
  'tel',
  'select',
  'radio',
  'checkbox',
];

export default function FormBuilder({
  token,
  subdomain,
}: {
  token: string;
  subdomain: string;
}) {
  const { schema, save } = useFormSchema(token, subdomain);
  const [draft, setDraft] = useState<FormSchema>(DEFAULT_FORM_SCHEMA);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (schema) setDraft(schema);
  }, [schema]);

  const setField = (i: number, patch: Partial<FormField>) =>
    setDraft((d) => ({
      ...d,
      fields: d.fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }));
  const move = (i: number, to: number) =>
    setDraft((d) => {
      if (to < 0 || to >= d.fields.length) return d;
      const a = [...d.fields];
      const [m] = a.splice(i, 1);
      a.splice(to, 0, m);
      return { ...d, fields: a };
    });
  const remove = (i: number) =>
    setDraft((d) => ({ ...d, fields: d.fields.filter((_, idx) => idx !== i) }));
  const add = () =>
    setDraft((d) => ({
      ...d,
      fields: [
        ...d.fields,
        {
          key: `field_${d.fields.length + 1}`,
          label: 'New field',
          type: 'text',
          required: false,
        },
      ],
    }));

  const onSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await save(draft);
      setMsg('Saved');
    } catch (e: any) {
      setMsg(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.builder}>
      <label className={styles.enableRow}>
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
        />
        Enable contact form on this subdomain
      </label>

      <input
        className={styles.metaInput}
        placeholder="Form title"
        value={draft.title || ''}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      />
      <input
        className={styles.metaInput}
        placeholder="Submit button text"
        value={draft.submitButtonText}
        onChange={(e) => setDraft({ ...draft, submitButtonText: e.target.value })}
      />
      <input
        className={styles.metaInput}
        placeholder="Success message"
        value={draft.successMessage}
        onChange={(e) => setDraft({ ...draft, successMessage: e.target.value })}
      />

      <div className={styles.fieldList}>
        {draft.fields.map((f, i) => (
          <div key={i} className={styles.fieldRow}>
            <input
              className={styles.fieldLabel}
              value={f.label}
              onChange={(e) => setField(i, { label: e.target.value })}
            />
            <select
              value={f.type}
              onChange={(e) => setField(i, { type: e.target.value as FormFieldType })}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {(f.type === 'select' || f.type === 'radio') && (
              <input
                className={styles.fieldOptions}
                placeholder="Options (comma-separated)"
                value={(f.options || []).join(', ')}
                onChange={(e) =>
                  setField(i, {
                    options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                  })
                }
              />
            )}
            <label className={styles.reqToggle}>
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => setField(i, { required: e.target.checked })}
              />
              req
            </label>
            <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0}>
              <ArrowUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => move(i, i + 1)}
              disabled={i === draft.fields.length - 1}
            >
              <ArrowDown size={13} />
            </button>
            <button type="button" onClick={() => remove(i)}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <button type="button" className={styles.addField} onClick={add}>
        <Plus size={14} /> Add field
      </button>

      <div className={styles.builderActions}>
        {msg && <span className={styles.msg}>{msg}</span>}
        <button className={styles.save} onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save form'}
        </button>
      </div>
    </div>
  );
}
