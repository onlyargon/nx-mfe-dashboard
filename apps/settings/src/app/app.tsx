import { useAuth } from '@intervest-mfe/auth-utils';
import { Button } from '@intervest-mfe/shared-ui';

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
