export type FormFieldType =
  | 'text'
  | 'email'
  | 'textarea'
  | 'number'
  | 'tel'
  | 'select'
  | 'radio'
  | 'checkbox';

export interface FormField {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select/radio
}

export interface FormSchema {
  enabled: boolean;
  title?: string;
  description?: string;
  submitButtonText: string;
  successMessage: string;
  fields: FormField[];
  updatedAt?: string | Date;
}

export interface SubmissionView {
  _id: string;
  subdomain: string;
  data: Record<string, string | string[]>;
  isRead: boolean;
  createdAt: string;
}

export const DEFAULT_FORM_SCHEMA: FormSchema = {
  enabled: false,
  title: 'Get in touch',
  description: '',
  submitButtonText: 'Send',
  successMessage: 'Thanks — we’ll be in touch!',
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'message', label: 'Message', type: 'textarea', required: true },
  ],
};
