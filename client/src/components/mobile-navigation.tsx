interface MobileNavigationProps {
  activeSection: "feed" | "leaderboard" | "profile";
  onSectionChange: (section: "feed" | "leaderboard" | "profile") => void;
}

export default function MobileNavigation({ activeSection, onSectionChange }: MobileNavigationProps) {
  const navItems = [
    { id: "feed", label: "Feed", icon: "fas fa-home" },
    { id: "leaderboard", label: "Board", icon: "fas fa-trophy" },
    { id: "profile", label: "Profile", icon: "fas fa-user" },
  ] as const;

  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`nav-item flex flex-col items-center py-2 px-4 transition-colors ${
              activeSection === item.id 
                ? "text-social-primary" 
                : "text-social-secondary"
            }`}
          >
            <i className={`${item.icon} text-xl`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
