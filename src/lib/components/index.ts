import type { FormComponents } from '../types';
import Layout from './Layout.svelte';
import Form from './Form.svelte';
import { defaultFieldComponents as fields } from './fields';

export const defaultFormComponents = {
  layout: Layout,
  form: Form,

  fields: fields
};

export { Layout, Form, fields };
