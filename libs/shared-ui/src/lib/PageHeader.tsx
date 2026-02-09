import * as React from 'react';
import styles from './shared-ui.module.css';

export type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  kicker?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
};

const mergeClassNames = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(' ');

export function PageHeader({
  title,
  subtitle,
  meta,
  actions,
  kicker,
  align = 'left',
  className,
}: PageHeaderProps) {
  return (
    <header
      className={mergeClassNames(
        styles.pageHeader,
        align === 'center' ? styles.pageHeaderCenter : undefined,
        className,
      )}
    >
      <div className={styles.pageHeaderText}>
        {kicker ? (
          <div className={styles.pageHeaderKicker}>{kicker}</div>
        ) : null}
        <h1 className={styles.pageHeaderTitle}>{title}</h1>
        {subtitle ? (
          <p className={styles.pageHeaderSubtitle}>{subtitle}</p>
        ) : null}
        {meta ? <div className={styles.pageHeaderMeta}>{meta}</div> : null}
      </div>
      {actions ? (
        <div className={styles.pageHeaderActions}>{actions}</div>
      ) : null}
    </header>
  );
}

export default PageHeader;
