import * as React from 'react';
import styles from './shared-ui.module.css';

export type CardProps = {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

const mergeClassNames = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(' ');

export function Card({
  eyebrow,
  title,
  actions,
  children,
  footer,
  className,
}: CardProps) {
  const hasHeader = eyebrow || title || actions;

  return (
    <section className={mergeClassNames(styles.card, className)}>
      {hasHeader ? (
        <div className={styles.cardHeader}>
          <div>
            {eyebrow ? (
              <div className={styles.cardEyebrow}>{eyebrow}</div>
            ) : null}
            {title ? <h3 className={styles.cardTitle}>{title}</h3> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
      ) : null}
      <div className={styles.cardBody}>{children}</div>
      {footer ? <div className={styles.cardFooter}>{footer}</div> : null}
    </section>
  );
}

export default Card;
