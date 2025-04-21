
import { Link } from "react-router-dom";
import { Film, Home, SmilePlus } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <Film className="h-6 w-6" />
            <span>FaceFilmFinder</span>
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/detect" className="flex items-center gap-2 hover:text-primary transition-colors">
              <SmilePlus className="h-5 w-5" />
              <span>Detect Emotion</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 FaceFilmFinder - Movies recommended based on your emotion</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
