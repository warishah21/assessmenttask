import { useAuth } from './context/AuthenticateContext';
import AuthPage  from "./pages/AuthenticPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-gray-500">Loading...</div>;
  }
  return user ? <Dashboard /> : <AuthPage />;
}
export default App
