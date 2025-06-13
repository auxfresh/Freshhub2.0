import { useState } from "react";
import { Bell, Menu, X, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface HeaderProps {
  currentUser: UserType;
  activeSection: "feed" | "leaderboard" | "profile";
  onSectionChange: (section: "feed" | "leaderboard" | "profile") => void;
}

const avatarUrls = {
  "1": "https://auxfresh.github.io/freshhub/avater1.jpg",
  "2": "https://auxfresh.github.io/freshhub/avater2.jpg",
  "3": "https://auxfresh.github.io/freshhub/avater3.jpg",
};

export default function Header({ currentUser, activeSection, onSectionChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "feed", label: "Feed", icon: "fas fa-home" },
    { id: "leaderboard", label: "Leaderboard", icon: "fas fa-trophy" },
    { id: "profile", label: "Profile", icon: "fas fa-user" },
  ] as const;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Fresh Hub</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`nav-item transition-colors ${
                  activeSection === item.id 
                    ? "text-social-primary font-medium" 
                    : "text-social-secondary hover:text-social-primary"
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-social-secondary hover:text-social-primary transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            
            {/* Hamburger Menu */}
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="p-2 text-social-secondary hover:text-social-primary transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      onSectionChange("profile");
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                </div>
              )}
            </div>
            
            <img 
              src={avatarUrls[currentUser.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => onSectionChange("profile")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
