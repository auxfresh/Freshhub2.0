import { Home, Trophy, Users, MoreHorizontal} from "lucide-react";

interface MobileNavigationProps {
  activeSection: "feed" | "leaderboard" | "profile";
  onSectionChange: (section: "feed" | "leaderboard" | "profile") => void;
}

export default function MobileNavigation({ activeSection, onSectionChange }: MobileNavigationProps) {
  const navItems = [
    { id: "feed", label: "Home", icon: Home, href: "https://freshhubweb.netlify.app/" },
    { id: "leaderboard", label: "Standings", icon: Trophy, href: "https://freshhubweb.netlify.app/standings.html" },
    { id: "profile", label: "Community", icon: Users, href: "#" },
    { id: "https://freshhubweb.netlify.app/more", label: "More", icon: MoreHorizontal, href: "more.html" },
  ] as const;

  const handleNavClick = (item: typeof navItems[number]) => {
    // Navigate to external HTML page
    window.location.href = item.href;
  };

  return (
    // Changed background to #4d2e6b and border-t to a slightly lighter shade if desired, or remove if not needed
    <nav className="bg-[#4d2e6b] border-t border-[#6a4294] fixed bottom-0 left-0 right-0 z-40 shadow-lg">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              // Changed icon and text colors to white, and hover effect to a lighter shade of purple
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive
                  ? "text-white" // Active icon/text is white
                  : "text-gray-300 hover:text-white" // Inactive icons/text are light gray, turn white on hover
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
