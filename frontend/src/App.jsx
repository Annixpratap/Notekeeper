import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/AuthContext';
import { Router } from './router/Router';
import { queryClient } from './api/queryClient';
import './index.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
