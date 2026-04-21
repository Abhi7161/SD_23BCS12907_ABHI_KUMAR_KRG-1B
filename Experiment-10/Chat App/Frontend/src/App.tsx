import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import ChatPage from './Pages/ChatPage';
import Login from './Pages/Login';
import Signup from './Pages/Signup';

function App() {
  const { authUser } = useAuthStore();

  return (
    <BrowserRouter>
      <div className="font-sans">
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
