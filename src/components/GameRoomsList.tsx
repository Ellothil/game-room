import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAppStore } from '../stores/useAppStore';
import { toast } from 'sonner';

export function GameRoomsList() {
  const rooms = useQuery(api.gameRooms.listGameRooms) || [];
  const currentUserRoom = useQuery(api.gameRooms.getCurrentUserRoom);
  const currentUser = useQuery(api.auth.loggedInUser);
  const joinRoom = useMutation(api.gameRooms.joinRoom);
  const { setCurrentRoomId } = useAppStore();

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom({ roomId: roomId as any });
      setCurrentRoomId(roomId as any);
      toast.success('Joined game successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join game');
    }
  };

  const handleEnterRoom = (roomId: string) => {
    setCurrentRoomId(roomId as any);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Game</h2>
        <p className="text-gray-400">Join a game room and play with others online</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const isInRoom = currentUserRoom?._id === room._id;
          const playerCount = room.memberCount;
          const isRoomFull = playerCount >= room.maxPlayers;
          const canJoin = !isRoomFull && !isInRoom;
          const isHost = currentUser && room.host === currentUser._id;
          
          return (
            <div
              key={room._id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">
                  {room.gameId === 'tic-tac-toe' && '⭕'}
                  {room.gameId === 'chess' && '♟️'}
                  {room.gameId === 'checkers' && '🔴'}
                  {room.gameId === 'card-game' && '🃏'}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{room.description}</p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Players:</span>
                  <span className={`font-medium ${
                    playerCount >= room.minPlayers ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {playerCount}/{room.maxPlayers}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Ready:</span>
                  <span className="text-blue-400 font-medium">
                    {room.readyCount || 0}/{playerCount}
                  </span>
                </div>

                {room.host && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Host:</span>
                    <span className="text-yellow-400 font-medium">
                      {room.members.find(m => m.userId === room.host)?.profile?.visibleName || 'Unknown'}
                      {isHost && ' (You)'}
                    </span>
                  </div>
                )}
              </div>

              {room.members.length > 0 && (
                <div className="flex justify-center mb-4">
                  <div className="flex -space-x-2">
                    {room.members.slice(0, 4).map((member) => (
                      <div
                        key={member._id}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center overflow-hidden ${
                          member.userId === room.host 
                            ? 'border-yellow-400 bg-yellow-600' 
                            : 'border-gray-800 bg-gray-700'
                        }`}
                        title={`${member.profile?.visibleName || 'Unknown'}${member.userId === room.host ? ' (Host)' : ''}`}
                      >
                        {member.profile?.profilePictureUrl ? (
                          <img
                            src={member.profile.profilePictureUrl}
                            alt={member.profile.visibleName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-300">
                            {member.profile?.visibleName?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                    ))}
                    {room.members.length > 4 && (
                      <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <span className="text-xs text-gray-300">+{room.members.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-center">
                {isInRoom ? (
                  <button
                    onClick={() => handleEnterRoom(room._id)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Enter Game
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinRoom(room._id)}
                    disabled={!canJoin}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      canJoin
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isRoomFull ? 'Room Full' : 'Join Game'}
                  </button>
                )}
              </div>

              {room.gameId !== 'tic-tac-toe' && (
                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-500">Coming Soon</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
