import { Home, Trophy, Users, MoreHorizontal } from "lucide-react";

interface MobileNavigationProps {
  activeSection: "feed" | "leaderboard" | "profile";
  onSectionChange: (section: "feed" | "leaderboard" | "profile") => void;
}

export default function MobileNavigation({ activeSection, onSectionChange }: MobileNavigationProps) {
  const navItems = [
    { id: "feed", label: "Home", icon: Home, href: "dashboard.html" },
    { id: "leaderboard", label: "Standings", icon: Trophy, href: "standings.html" },
    { id: "profile", label: "Community", icon: Users, href: "blog.html" },
    { id: "more", label: "More", icon: MoreHorizontal, href: "more.html" },
  ] as const;

  const handleNavClick = (item: typeof navItems[number]) => {
    // Navigate to external HTML page
    window.location.href = item.href;
  };

  return (
    <nav className="bg-[#000] border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40 shadow-lg">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive 
                  ? "text-social-primary" 
                  : "text-social-secondary hover:text-social-primary"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
