import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FeedbackProvider } from './components/shared/Feedback';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <FeedbackProvider>
        <AppRouter />
      </FeedbackProvider>
    </AuthProvider>
  );
}

export default App;
