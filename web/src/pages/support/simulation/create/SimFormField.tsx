import { Form } from 'antd';
import type { FormItemProps } from 'antd';

/** Consistent label + control spacing for Simulation create modals. */
export function SimFormField({ style, className, ...rest }: FormItemProps) {
  return (
    <Form.Item
      {...rest}
      className={['sim-form-field', className].filter(Boolean).join(' ')}
      style={{ marginBottom: 18, ...style }}
    />
  );
}
