import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Crown, Loader2 } from "lucide-react";

interface LeaderboardSectionProps {
  currentUser: User;
}

const avatarUrls = {
  "1": "https://auxfresh.github.io/freshhub/avater1.jpg",
  "2": "https://auxfresh.github.io/freshhub/avater2.jpg",
  "3": "https://auxfresh.github.io/freshhub/avater3.jpg",
};

export default function LeaderboardSection({ currentUser }: LeaderboardSectionProps) {
  const { data: leaderboard = [], isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
  });

  console.log('Leaderboard data:', leaderboard);
  console.log('Leaderboard loading:', isLoading);
  console.log('Leaderboard error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-social-primary" />
        <span className="ml-2 text-social-secondary">Loading leaderboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-red-500">Error loading leaderboard</span>
      </div>
    );
  }

  // Filter out any invalid entries and ensure we have valid user objects
  const validUsers = leaderboard.filter(user => user && user.id && user.username);
  
  if (validUsers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Leaderboard</h2>
          <p className="text-social-secondary">Top performers this month</p>
        </div>
        <div className="p-8 text-center">
          <p className="text-social-secondary">No users found on the leaderboard yet.</p>
        </div>
      </div>
    );
  }

  const topThree = validUsers.slice(0, 3);
  const remaining = validUsers.slice(3);
  const currentUserRank = validUsers.findIndex(user => user?.id === currentUser?.id) + 1;

  return (
    <section>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Leaderboard</h2>
          <p className="text-social-secondary">Top performers this month</p>
        </div>
        
        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex justify-center items-end space-x-8 mb-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="relative">
                  <img 
                    src={avatarUrls[topThree[1]?.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
                    alt="2nd place user" 
                    className="w-16 h-16 rounded-full border-4 border-gray-300 mb-2"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                </div>
                <p className="font-semibold text-sm">{topThree[1]?.username}</p>
                <p className="text-xs text-social-secondary">{topThree[1]?.score?.toLocaleString() || '0'} pts</p>
              </div>
              
              {/* 1st Place */}
              <div className="text-center">
                <div className="relative">
                  <img 
                    src={avatarUrls[topThree[0]?.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
                    alt="1st place user" 
                    className="w-20 h-20 rounded-full border-4 border-yellow-400 mb-2"
                  />
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <Crown className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-400 w-6 h-6" />
                </div>
                <p className="font-semibold">{topThree[0]?.username}</p>
                <p className="text-sm text-social-secondary">{topThree[0]?.score?.toLocaleString() || '0'} pts</p>
              </div>
              
              {/* 3rd Place */}
              <div className="text-center">
                <div className="relative">
                  <img 
                    src={avatarUrls[topThree[2]?.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
                    alt="3rd place user" 
                    className="w-16 h-16 rounded-full border-4 border-orange-400 mb-2"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                </div>
                <p className="font-semibold text-sm">{topThree[2]?.username}</p>
                <p className="text-xs text-social-secondary">{topThree[2]?.score?.toLocaleString() || '0'} pts</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="divide-y divide-gray-200">
          {remaining.map((user, index) => {
            const rank = index + 4;
            const isCurrentUser = user.id === currentUser.id;
            
            return (
              <div 
                key={`leaderboard-${user.id}`} 
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  isCurrentUser ? "bg-blue-50 border-l-4 border-social-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCurrentUser 
                          ? "bg-social-primary text-white" 
                          : "bg-gray-100 text-social-secondary"
                      }`}
                    >
                      {rank}
                    </span>
                    <img 
                      src={avatarUrls[user.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
                      alt="User avatar" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {isCurrentUser ? `You (${user.username})` : user.username}
                      </p>
                      <p className="text-sm text-social-secondary">{user.bio}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{user.score?.toLocaleString() || '0'} pts</p>
                    <p className="text-sm text-social-success">+{Math.floor(Math.random() * 50) + 10}</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Show current user if not in top rankings */}
          {currentUserRank > 10 && (
            <div className="p-4 bg-blue-50 border-l-4 border-social-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-full bg-social-primary text-white flex items-center justify-center text-sm font-medium">
                    {currentUserRank}
                  </span>
                  <img 
                    src={avatarUrls[currentUser.avatar as keyof typeof avatarUrls] || avatarUrls["2"]} 
                    alt="Your avatar" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">You ({currentUser.username})</p>
                    <p className="text-sm text-social-secondary">{currentUser.bio}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{currentUser.score?.toLocaleString() || '0'} pts</p>
                  <p className="text-sm text-social-success">+{Math.floor(Math.random() * 30) + 5}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
