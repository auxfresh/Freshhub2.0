import { Bell } from "lucide-react";
import type { User } from "@shared/schema";

interface HeaderProps {
  currentUser: User;
  activeSection: "feed" | "leaderboard" | "profile";
  onSectionChange: (section: "feed" | "leaderboard" | "profile") => void;
}

const avatarUrls = {
  "1": "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "2": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  "3": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
};

export default function Header({ currentUser, activeSection, onSectionChange }: HeaderProps) {
  const navItems = [
    { id: "feed", label: "Feed", icon: "fas fa-home" },
    { id: "leaderboard", label: "Leaderboard", icon: "fas fa-trophy" },
    { id: "profile", label: "Profile", icon: "fas fa-user" },
  ] as const;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">SocialHub</h1>
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
            <img 
              src={avatarUrls[currentUser.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
