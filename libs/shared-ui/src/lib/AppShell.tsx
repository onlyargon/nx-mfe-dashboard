import * as React from 'react';
import styles from './shared-ui.module.css';

export type AppShellProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  sidebarWidth?: number | string;
};

const mergeClassNames = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(' ');

export function AppShell({
  sidebar,
  children,
  className,
  contentClassName,
  sidebarWidth,
}: AppShellProps) {
  const shellStyle = sidebarWidth
    ? {
        ['--ui-sidebar-width' as string]:
          typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth,
      }
    : undefined;

  return (
    <div
      className={mergeClassNames(styles.appShell, className)}
      style={shellStyle}
    >
      <aside className={styles.appShellSidebar}>{sidebar}</aside>
      <main className={styles.appShellMain}>
        <div
          className={mergeClassNames(styles.appShellContent, contentClassName)}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;
