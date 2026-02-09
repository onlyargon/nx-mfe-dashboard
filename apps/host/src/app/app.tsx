import { RequireAuth, useAuth } from '@intervest-mfe/auth-utils';
import { AppShell, Button, Card, PageHeader } from '@intervest-mfe/shared-ui';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import styles from './app.module.css';

const Workflows = React.lazy(() => import('workflows/Module'));
const Analytics = React.lazy(() => import('analytics/Module'));
const Settings = React.lazy(() => import('settings/Module'));
const Reports = React.lazy(() => import('reports/Module'));

export function App() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    await login({ email: email.trim(), password });
    setEmail('');
    setPassword('');
    setError(null);
    navigate('/');
  };

  const navItems = [
    { label: 'Analytics', path: '/' },
    { label: 'Workflows', path: '/workflows' },
    { label: 'Settings', path: '/settings' },
    { label: 'Reports', path: '/reports' },
  ];

  return (
    <React.Suspense fallback={null}>
      <AppShell
        sidebar={
          <div style={{ display: 'grid', gap: '8px' }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                size="sm"
                variant="ghost"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Analytics />
              </RequireAuth>
            }
          />
          <Route
            path="/workflows"
            element={
              <RequireAuth>
                <Workflows />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <Reports />
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <PageHeader
                  title="Secure sign in"
                  subtitle="Use any credentials to access the sandbox environment and preview the design system."
                  align="center"
                />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Card
                    title="Welcome back"
                    eyebrow="Access"
                    footer={
                      isAuthenticated ? (
                        <Button variant="secondary" onClick={logout}>
                          Sign out
                        </Button>
                      ) : null
                    }
                  >
                    {isAuthenticated ? (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <p>Signed in as {user?.name ?? 'User'}.</p>
                        <Button onClick={logout}>Sign out</Button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleLogin}
                        style={{ display: 'grid', gap: '16px', width: '300px' }}
                      >
                        <label
                          htmlFor="login-email"
                          style={{ display: 'grid', gap: '6px' }}
                        >
                          Email
                          <input
                            id="login-email"
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                          />
                        </label>
                        <label
                          htmlFor="login-password"
                          style={{ display: 'grid', gap: '6px' }}
                        >
                          Password
                          <input
                            id="login-password"
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            placeholder="Any value"
                            autoComplete="current-password"
                          />
                        </label>
                        {error ? (
                          <p style={{ color: 'var(--ui-color-accent)' }}>
                            {error}
                          </p>
                        ) : null}
                        <Button type="submit">Sign in</Button>
                      </form>
                    )}
                  </Card>
                </div>
              </>
            }
          />
        </Routes>
      </AppShell>
    </React.Suspense>
  );
}

export default App;
