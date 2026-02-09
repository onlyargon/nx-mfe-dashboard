import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  roles?: string[];
};

export type AuthLoginInput = {
  email: string;
  password?: string;
  name?: string;
  id?: string;
  roles?: string[];
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: AuthLoginInput) => Promise<AuthUser>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
};

export type AuthProviderProps = {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  initialToken?: string | null;
  tokenTtlSeconds?: number;
  refreshWindowSeconds?: number;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

const DEFAULT_TOKEN_TTL_SECONDS = 15 * 60;
const DEFAULT_REFRESH_WINDOW_SECONDS = 60;

const getGlobalBuffer = () =>
  (
    globalThis as {
      Buffer?: {
        from: (
          input: string,
          encoding: string,
        ) => { toString: (enc: string) => string };
      };
    }
  ).Buffer;

const base64UrlEncode = (value: string): string => {
  const buffer = getGlobalBuffer();
  const base64 =
    typeof btoa === 'function'
      ? btoa(value)
      : buffer
        ? buffer.from(value, 'utf-8').toString('base64')
        : value;
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const base64UrlDecode = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const buffer = getGlobalBuffer();
  if (typeof atob === 'function') {
    return atob(padded);
  }
  return buffer ? buffer.from(padded, 'base64').toString('utf-8') : padded;
};

const nowSeconds = () => Math.floor(Date.now() / 1000);

export type FakeJwtPayload = {
  sub: string;
  name?: string;
  email?: string;
  roles?: string[];
  iat: number;
  exp: number;
};

export const createFakeJwt = (
  payload: Omit<FakeJwtPayload, 'iat' | 'exp'> & {
    iat?: number;
    exp?: number;
  },
  ttlSeconds: number = DEFAULT_TOKEN_TTL_SECONDS,
): string => {
  const issuedAt = payload.iat ?? nowSeconds();
  const expiresAt = payload.exp ?? issuedAt + ttlSeconds;
  const header = { alg: 'none', typ: 'JWT' };
  const body: FakeJwtPayload = {
    sub: payload.sub,
    name: payload.name,
    email: payload.email,
    roles: payload.roles,
    iat: issuedAt,
    exp: expiresAt,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  return `${encodedHeader}.${encodedPayload}.`;
};

export const decodeFakeJwt = (token: string): FakeJwtPayload | null => {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson) as FakeJwtPayload;
  } catch {
    return null;
  }
};

export const isFakeJwtExpired = (
  token: string,
  now: number = nowSeconds(),
): boolean => {
  const payload = decodeFakeJwt(token);
  if (!payload) {
    return true;
  }
  return payload.exp <= now;
};

export const maybeRefreshFakeJwt = (
  token: string,
  options: {
    refreshWindowSeconds?: number;
    ttlSeconds?: number;
    nowSeconds?: number;
  } = {},
): {
  token: string;
  refreshed: boolean;
  payload: FakeJwtPayload | null;
} => {
  const currentPayload = decodeFakeJwt(token);
  if (!currentPayload) {
    return { token, refreshed: false, payload: null };
  }
  const currentNow = options.nowSeconds ?? nowSeconds();
  const refreshWindow =
    options.refreshWindowSeconds ?? DEFAULT_REFRESH_WINDOW_SECONDS;
  if (currentPayload.exp - currentNow > refreshWindow) {
    return { token, refreshed: false, payload: currentPayload };
  }
  const refreshedToken = createFakeJwt(
    {
      sub: currentPayload.sub,
      name: currentPayload.name,
      email: currentPayload.email,
      roles: currentPayload.roles,
    },
    options.ttlSeconds ?? DEFAULT_TOKEN_TTL_SECONDS,
  );
  return {
    token: refreshedToken,
    refreshed: true,
    payload: decodeFakeJwt(refreshedToken),
  };
};

const buildUserFromPayload = (payload: FakeJwtPayload): AuthUser => ({
  id: payload.sub,
  name: payload.name ?? 'User',
  email: payload.email,
  roles: payload.roles,
});

const buildDisplayName = (email: string) =>
  email.split('@')[0].replace(/\./g, ' ').trim() || 'User';

const generateId = () => Math.random().toString(36).slice(2, 10);

export const AuthProvider = ({
  children,
  initialUser,
  initialToken,
  tokenTtlSeconds = DEFAULT_TOKEN_TTL_SECONDS,
  refreshWindowSeconds = DEFAULT_REFRESH_WINDOW_SECONDS,
}: AuthProviderProps) => {
  const [token, setToken] = React.useState<string | null>(initialToken ?? null);
  const [user, setUser] = React.useState<AuthUser | null>(() => {
    if (initialUser) {
      return initialUser;
    }
    if (initialToken) {
      const payload = decodeFakeJwt(initialToken);
      return payload ? buildUserFromPayload(payload) : null;
    }
    return null;
  });

  const isAuthenticated = React.useMemo(() => {
    if (!user || !token) {
      return false;
    }
    return !isFakeJwtExpired(token);
  }, [token, user]);

  const login = React.useCallback(
    async (input: AuthLoginInput) => {
      const nextUser: AuthUser = {
        id: input.id ?? generateId(),
        name: input.name ?? buildDisplayName(input.email),
        email: input.email,
        roles: input.roles,
      };
      const nextToken = createFakeJwt(
        {
          sub: nextUser.id,
          name: nextUser.name,
          email: nextUser.email,
          roles: nextUser.roles,
        },
        tokenTtlSeconds,
      );
      setUser(nextUser);
      setToken(nextToken);
      return nextUser;
    },
    [tokenTtlSeconds],
  );

  const logout = React.useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const refreshToken = React.useCallback(async () => {
    if (!token) {
      return null;
    }
    const refreshed = maybeRefreshFakeJwt(token, {
      refreshWindowSeconds,
      ttlSeconds: tokenTtlSeconds,
    });
    if (refreshed.refreshed) {
      setToken(refreshed.token);
      if (refreshed.payload) {
        setUser(buildUserFromPayload(refreshed.payload));
      }
    }
    return refreshed.token;
  }, [refreshWindowSeconds, token, tokenTtlSeconds]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      logout,
      refreshToken,
    }),
    [isAuthenticated, login, logout, refreshToken, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type RequireAuthProps = {
  children: React.ReactElement;
  redirectTo?: string;
};

export const RequireAuth = ({
  children,
  redirectTo = '/login',
}: RequireAuthProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
};
