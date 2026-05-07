import Navbar from './Navbar';
import Footer from './Footer';
import MovieChatbot from '../ui/MovieChatbot';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Layout({ children }) {
  const { isLoggedIn, user } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-cinema-black flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      {/* Chatbot tư vấn phim - xuất hiện trên mọi trang */}
      <MovieChatbot />
    </div>
  );
}
