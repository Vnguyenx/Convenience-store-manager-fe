import { useAuth } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import './App.css';

function App() {
  useAuth();
  return <AppRouter />;
}

export default App;