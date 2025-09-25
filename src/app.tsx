import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProfileSetup } from "./components/ProfileSetup";
import { GameRoomsList } from "./components/GameRoomsList";
import { GameRoom } from "./components/GameRoom";
import { SettingsModal } from "./components/SettingsModal";
import { useAppStore } from "./stores/useAppStore";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-secondary">
      <header className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-700 shadow-sm px-4">
        <h2 className="text-xl font-semibold text-white">Multiplayer Hub</h2>
        <Authenticated>
          <div className="flex items-center space-x-4">
            <SettingsButton />
            <SignOutButton />
          </div>
        </Authenticated>
      </header>
      <main className="flex-1 p-8">
        <div className="w-full max-w-6xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}

function SettingsButton() {
  const { setShowSettings } = useAppStore();
  
  return (
    <button
      onClick={() => setShowSettings(true)}
      className="p-2 text-gray-400 hover:text-white transition-colors"
      title="Settings"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getCurrentUserProfile);
  const { currentRoomId, showSettings } = useAppStore();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Game Room</h1>
            <p className="text-xl text-gray-400">Join friends and play games together</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {loggedInUser && !userProfile && !showProfileSetup ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Welcome!</h1>
              <p className="text-gray-400 mb-6">Let's set up your profile to get started</p>
              <button
                onClick={() => setShowProfileSetup(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Set Up Profile
              </button>
            </div>
          </div>
        ) : null}

        {showProfileSetup && (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ProfileSetup onComplete={() => setShowProfileSetup(false)} />
            </div>
          </div>
        )}

        {userProfile && !showProfileSetup && (
          <>
            {currentRoomId ? (
              <GameRoom roomId={currentRoomId} />
            ) : (
              <GameRoomsList />
            )}
          </>
        )}
      </Authenticated>

      {showSettings && <SettingsModal />}
    </>
  );
}
