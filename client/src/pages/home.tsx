import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import MobileNavigation from "@/components/mobile-navigation";
import FeedSection from "@/components/feed-section";
import LeaderboardSection from "@/components/leaderboard-section";
import ProfileSection from "@/components/profile-section";
import RegistrationModal from "@/components/registration-modal";
import type { User } from "@shared/schema";

export default function Home() {
  const [activeSection, setActiveSection] = useState<"feed" | "leaderboard" | "profile">("feed");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRegistration, setShowRegistration] = useState(true);

  // Check if user exists in localStorage and verify with backend
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Verify user exists in backend
        fetch(`/api/users/${user.id}`)
          .then(res => {
            if (res.ok) {
              return res.json();
            } else {
              // User doesn't exist in backend, clear localStorage and show registration
              localStorage.removeItem("currentUser");
              setShowRegistration(true);
              return null;
            }
          })
          .then(backendUser => {
            if (backendUser) {
              setCurrentUser(backendUser);
              setShowRegistration(false);
            }
          })
          .catch(error => {
            console.error("Failed to verify user:", error);
            localStorage.removeItem("currentUser");
            setShowRegistration(true);
          });
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleUserRegistered = (user: User) => {
    setCurrentUser(user);
    setShowRegistration(false);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleUserUpdated = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  if (!currentUser && showRegistration) {
    return (
      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onUserRegistered={handleUserRegistered}
      />
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-social-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SocialHub</h1>
          <button
            onClick={() => setShowRegistration(true)}
            className="bg-social-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-social-primary/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-social-background">
      <Header 
        currentUser={currentUser}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {activeSection === "feed" && <FeedSection currentUser={currentUser} />}
        {activeSection === "leaderboard" && <LeaderboardSection currentUser={currentUser} />}
        {activeSection === "profile" && (
          <ProfileSection 
            currentUser={currentUser} 
            onUserUpdated={handleUserUpdated}
          />
        )}
      </main>

      <MobileNavigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {showRegistration && (
        <RegistrationModal
          isOpen={showRegistration}
          onClose={() => setShowRegistration(false)}
          onUserRegistered={handleUserRegistered}
        />
      )}
    </div>
  );
}
