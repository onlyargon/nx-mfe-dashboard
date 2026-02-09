import * as React from 'react';
import styles from './shared-ui.module.css';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

const mergeClassNames = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(' ');

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={mergeClassNames(
        styles.button,
        styles[`button${variant[0].toUpperCase()}${variant.slice(1)}`],
        styles[`button${size[0].toUpperCase()}${size.slice(1)}`],
        fullWidth ? styles.buttonFullWidth : undefined,
        className,
      )}
      {...props}
    />
  );
}

export default Button;
