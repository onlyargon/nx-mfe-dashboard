import * as React from 'react';
import NxWelcome from './nx-welcome';
import { Link, Route, Routes } from 'react-router-dom';
import { RequireAuth, useAuth } from '@intervest-mfe/auth-utils';

const Workflows = React.lazy(() => import('workflows/Module'));
const Analytics = React.lazy(() => import('analytics/Module'));
const Settings = React.lazy(() => import('settings/Module'));
const Reports = React.lazy(() => import('reports/Module'));

export function App() {
  const { isAuthenticated, user, login, logout } = useAuth();
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
  };

  return (
    <React.Suspense fallback={null}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/workflows">Workflows</Link>
        </li>
        <li>
          <Link to="/analytics">Analytics</Link>
        </li>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
        <li>
          <Link to="/reports">Reports</Link>
        </li>
      </ul>
      <Routes>
        <Route path="/" element={<NxWelcome title="host" />} />
        <Route
          path="/login"
          element={
            <div>
              <h2>Login</h2>
              {isAuthenticated ? (
                <div>
                  <p>Signed in as {user?.name ?? 'User'}.</p>
                  <button type="button" onClick={logout}>
                    Sign out
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="login-email">Email</label>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password">Password</label>
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Any value"
                      autoComplete="current-password"
                    />
                  </div>
                  {error ? <p>{error}</p> : null}
                  <button type="submit">Sign in</button>
                </form>
              )}
            </div>
          }
        />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
