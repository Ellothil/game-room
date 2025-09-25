import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAppStore } from '../stores/useAppStore';
import { toast } from 'sonner';
import { Id } from '../../convex/_generated/dataModel';
import { TicTacToeGame } from './TicTacToeGame';

interface GameRoomProps {
  roomId: Id<"gameRooms">;
}

export function GameRoom({ roomId }: GameRoomProps) {
  const room = useQuery(api.gameRooms.getRoomDetails, { roomId });
  const currentUser = useQuery(api.auth.loggedInUser);
  const gameState = useQuery(api.ticTacToe.getGameState, { roomId });
  const leaveRoom = useMutation(api.gameRooms.leaveRoom);
  const toggleReady = useMutation(api.gameRooms.toggleReady);
  const startGame = useMutation(api.gameRooms.startGame);
  const initializeGame = useMutation(api.ticTacToe.initializeGame);
  const { setCurrentRoomId } = useAppStore();
  const [isStartingGame, setIsStartingGame] = useState(false);

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom({ roomId });
      setCurrentRoomId(null);
      toast.success('Left game successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave game');
    }
  };

  const handleToggleReady = async () => {
    try {
      await toggleReady({ roomId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update ready status');
    }
  };

  const handleStartGame = async () => {
    if (!room || room.gameId !== 'tic-tac-toe') {
      toast.error('Game not supported yet');
      return;
    }

    setIsStartingGame(true);
    try {
      await startGame({ roomId });
      await initializeGame({ roomId });
      toast.success('Game started!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start game');
    } finally {
      setIsStartingGame(false);
    }
  };

  if (!room || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentUserMember = room.members.find(m => m.userId === currentUser._id);
  const isReady = currentUserMember?.isReady || false;
  const playerCount = room.members.length;
  const readyCount = room.members.filter(m => m.isReady).length;
  const hasMinPlayers = playerCount >= room.minPlayers;
  const allReady = playerCount > 0 && room.members.every(m => m.isReady);
  const isHost = room.host === currentUser._id;
  const canStartGame = isHost && hasMinPlayers && allReady;

  // Show game screen if game has been initialized
  if (gameState) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{room.name}</h2>
            <p className="text-gray-400">{room.description}</p>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Leave Game
          </button>
        </div>

        {/* Render specific game component based on game type */}
        {room.gameId === 'tic-tac-toe' ? (
          <TicTacToeGame 
            roomId={roomId} 
            currentUserId={currentUser._id}
            room={room}
            isHost={isHost}
          />
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <div className="text-6xl mb-6">
              {room.gameId === 'chess' && '♟️'}
              {room.gameId === 'checkers' && '🔴'}
              {room.gameId === 'card-game' && '🃏'}
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Game Started!</h3>
            <p className="text-gray-400 mb-6">
              {room.name} is now in progress with {playerCount} players.
            </p>
            <div className="bg-gray-700 rounded-lg p-6">
              <p className="text-lg text-white mb-2">Game integration coming soon!</p>
              <p className="text-sm text-gray-400">
                This is where the actual {room.name} gameplay will be displayed.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">{room.name}</h2>
          <p className="text-gray-400">{room.description}</p>
        </div>
        <button
          onClick={handleLeaveRoom}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Leave Game
        </button>
      </div>

      {/* Game Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Game Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Players Required:</span>
            <span className="text-white ml-2">{room.minPlayers}-{room.maxPlayers}</span>
          </div>
          <div>
            <span className="text-gray-400">Current Players:</span>
            <span className={`ml-2 font-medium ${
              playerCount >= room.minPlayers ? 'text-green-400' : 'text-orange-400'
            }`}>
              {playerCount}/{room.maxPlayers}
            </span>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">
            Players ({playerCount}/{room.maxPlayers})
          </h3>
          <div className="text-sm">
            <span className="text-gray-400">Ready: </span>
            <span className="text-blue-400 font-medium">{readyCount}/{playerCount}</span>
          </div>
        </div>

        {!hasMinPlayers && (
          <div className="mb-4 p-3 bg-orange-900/30 border border-orange-600/50 rounded-lg">
            <p className="text-orange-400 text-sm">
              ⚠️ Need at least {room.minPlayers} players to start the game. 
              Waiting for {room.minPlayers - playerCount} more player(s).
            </p>
          </div>
        )}

        {hasMinPlayers && allReady && !isHost && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
            <p className="text-blue-400 text-sm font-medium">
              🎮 All players ready! Waiting for host to start the game...
            </p>
          </div>
        )}

        {canStartGame && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-600/50 rounded-lg">
            <p className="text-green-400 text-sm font-medium">
              🎮 All players ready! You can start the game now.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {room.members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 ${
                  member.userId === room.host 
                    ? 'border-yellow-400 bg-yellow-600' 
                    : 'border-gray-600 bg-gray-600'
                }`}>
                  {member.profile?.profilePictureUrl ? (
                    <img
                      src={member.profile.profilePictureUrl}
                      alt={member.profile.visibleName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg text-gray-300">
                      {member.profile?.visibleName?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-white font-medium flex items-center space-x-2">
                    <span>{member.profile?.visibleName || 'Unknown Player'}</span>
                    {member.userId === room.host && (
                      <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded-full font-medium">
                        HOST
                      </span>
                    )}
                    {member.userId === currentUser._id && (
                      <span className="text-blue-400">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    Joined {new Date(member.joinedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    member.isReady
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {member.isReady ? 'Ready' : 'Not Ready'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-600 space-y-3">
          <button
            onClick={handleToggleReady}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              isReady
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isReady ? 'Mark as Not Ready' : 'Mark as Ready'}
          </button>

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStartGame || isStartingGame || room.gameId !== 'tic-tac-toe'}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                canStartGame && room.gameId === 'tic-tac-toe'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isStartingGame ? 'Starting Game...' : 
               room.gameId !== 'tic-tac-toe' ? 'Game Coming Soon' :
               !hasMinPlayers ? `Need ${room.minPlayers - playerCount} More Players` :
               !allReady ? 'Waiting for All Players to be Ready' :
               'Start Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
