import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';

interface TicTacToeGameProps {
  roomId: Id<"gameRooms">;
  currentUserId: Id<"users">;
  room: any;
  isHost: boolean;
}

export function TicTacToeGame({ roomId, currentUserId, room, isHost }: TicTacToeGameProps) {
  const gameState = useQuery(api.ticTacToe.getGameState, { roomId });
  const makeMove = useMutation(api.ticTacToe.makeMove);
  const resetGame = useMutation(api.ticTacToe.resetGame);

  const handleCellClick = async (position: number) => {
    if (!gameState || gameState.gameOver || gameState.currentPlayer !== currentUserId) {
      return;
    }

    try {
      const result = await makeMove({ roomId, position });
      
      if (result.winner) {
        const winnerName = result.winner === 'X' 
          ? getPlayerName(gameState.player1) 
          : getPlayerName(gameState.player2);
        toast.success(`${winnerName} wins!`);
      } else if (result.gameOver) {
        toast.info("It's a tie!");
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to make move');
    }
  };

  const handleReset = async () => {
    try {
      await resetGame({ roomId });
      toast.success('Game reset!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset game');
    }
  };

  const getPlayerName = (playerId: Id<"users">) => {
    const member = room.members.find((m: any) => m.userId === playerId);
    return member?.profile?.visibleName || 'Unknown Player';
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isCurrentPlayerTurn = gameState.currentPlayer === currentUserId;
  const currentPlayerSymbol = currentUserId === gameState.player1 ? 'X' : 'O';
  const isPlayer = currentUserId === gameState.player1 || currentUserId === gameState.player2;

  return (
    <div className="space-y-6">
      {/* Game Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Tic Tac Toe</h3>
          {isHost && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Reset Game
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Player X</div>
            <div className="text-white font-medium">
              {getPlayerName(gameState.player1)}
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Player O</div>
            <div className="text-white font-medium">
              {getPlayerName(gameState.player2)}
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="mt-4 p-3 bg-gray-700 rounded-lg text-center">
          {gameState.gameOver ? (
            gameState.winner ? (
              <div className="text-green-400 font-medium">
                🎉 {gameState.winner === 'X' ? getPlayerName(gameState.player1) : getPlayerName(gameState.player2)} wins!
              </div>
            ) : (
              <div className="text-yellow-400 font-medium">
                🤝 It's a tie!
              </div>
            )
          ) : isPlayer ? (
            isCurrentPlayerTurn ? (
              <div className="text-blue-400 font-medium">
                Your turn ({currentPlayerSymbol})
              </div>
            ) : (
              <div className="text-gray-400">
                Waiting for {getPlayerName(gameState.currentPlayer)}...
              </div>
            )
          ) : (
            <div className="text-gray-400">
              Spectating - {getPlayerName(gameState.currentPlayer)}'s turn
            </div>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {gameState.board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!isPlayer || !isCurrentPlayerTurn || gameState.gameOver || cell !== null}
              className={`
                aspect-square bg-gray-700 border-2 border-gray-600 rounded-lg
                flex items-center justify-center text-3xl font-bold
                transition-all duration-200
                ${isPlayer && isCurrentPlayerTurn && !gameState.gameOver && cell === null
                  ? 'hover:bg-gray-600 hover:border-blue-500 cursor-pointer'
                  : 'cursor-not-allowed'
                }
                ${cell === 'X' ? 'text-blue-400' : cell === 'O' ? 'text-red-400' : 'text-gray-500'}
              `}
            >
              {cell || ''}
            </button>
          ))}
        </div>
      </div>

      {/* Spectators */}
      {room.members.length > 2 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Spectators</h4>
          <div className="flex flex-wrap gap-2">
            {room.members
              .filter((member: any) => member.userId !== gameState.player1 && member.userId !== gameState.player2)
              .map((member: any) => (
                <div
                  key={member._id}
                  className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden border ${
                    member.userId === room.host ? 'border-yellow-400 bg-yellow-600' : 'border-gray-600 bg-gray-600'
                  }`}>
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
                  <span className="text-sm text-white flex items-center space-x-1">
                    <span>{member.profile?.visibleName || 'Unknown'}</span>
                    {member.userId === room.host && (
                      <span className="text-xs text-yellow-400">(Host)</span>
                    )}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
