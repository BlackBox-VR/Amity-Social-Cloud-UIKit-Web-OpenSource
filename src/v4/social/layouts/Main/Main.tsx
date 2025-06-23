import React, { PropsWithChildren } from 'react';
import styles from './Main.module.css';

type MainLayoutProps = PropsWithChildren<{
  aside?: React.ReactNode;
}>;

export const MainLayout = ({ aside, children }: MainLayoutProps) => {
  const hasAside = aside != null && aside !== false;

  return (
    <div
      className={`${styles.layout} ${!hasAside ? styles.layout__noAside : ''}`}
      style={{
        width: '100%',
        height: '100vh',
        display: 'grid',
        overflow: 'hidden',
        gridTemplateColumns: !hasAside ? '1fr' : 'auto 1fr',
        background: 'var(--asc-color-background-shade1)',
        position: 'relative',
      }}
    >
      {hasAside && <aside className={styles.layout__aside}>{aside}</aside>}
      <main
        className={styles.layout__main}
        style={{
          width: '100%',
          height: '100%',
          margin: '0 auto',
          overflow: 'auto',
          maxWidth: '37.125rem',
          padding: '1rem 1.5rem 0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
        }}
      >
        {children}
      </main>
    </div>
  );
};
