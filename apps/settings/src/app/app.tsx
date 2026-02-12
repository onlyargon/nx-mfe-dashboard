import { useAuth } from '@nx-mfe-demo/auth-utils';
import { Button } from '@nx-mfe-demo/shared-ui';

export function App() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <Button variant="ghost" onClick={() => logout()}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default App;
