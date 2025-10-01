import { FaCrown, FaUser } from "react-icons/fa";
import { ProfilePicture } from "@/components/profile-picture";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import { socket } from "@/websocket/socket";
import { useTicTacToeStore } from "../games/tic-tac-toe/store";

export function RoomList() {
  const rooms = useRoomStore((state) => state.rooms);
  const user = useAuthStore((state) => state.user);
  const { status } = useTicTacToeStore();

  const handleJoinClick = (roomId: string) => {
    if (user) {
      socket.emit("room:join", roomId, {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
      });
    }
  };

  const handleLeaveClick = (roomId: string) => {
    socket.emit("room:leave", roomId);
  };

  const handleStartGame = (roomId: string) => {
    socket.emit("game:start", roomId);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {rooms.map((room) => {
        const isUserInThisRoom = room.players.some((p) => p.id === user?.id);
        const isRoomFull = room.players.length >= room.maxPlayers;
        const isDisabled = isRoomFull && !isUserInThisRoom;

        // Find the game master (player who has been in the room the longest)
        const gameMaster =
          room.players.length > 0
            ? room.players.reduce((earliest, current) => {
                const earliestJoinTime =
                  earliest.joinedAt ?? Number.POSITIVE_INFINITY;
                const currentJoinTime =
                  current.joinedAt ?? Number.POSITIVE_INFINITY;
                return currentJoinTime < earliestJoinTime ? current : earliest;
              })
            : null;

        // Get regular players (non-game-master)
        const regularPlayers = room.players.filter(
          (p) => p.id !== gameMaster?.id
        );

        return (
          <div
            className="flex flex-col gap-4 rounded-lg border p-4"
            key={room.id}
          >
            {/* Room Header */}
            <div className="grid grid-cols-13 items-center justify-between gap-4">
              {/* Room Name */}
              <h2 className="col-span-5 font-bold text-xl">{room.name}</h2>
              <div className="col-span-5 flex items-center gap-6">
                {/* Game Master Column */}
                <div className="col-span-2 flex items-center gap-2">
                  {gameMaster ? (
                    <>
                      <FaCrown className="text-yellow-500" size={24} />
                      <div className="flex items-center gap-2">
                        <ProfilePicture
                          className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-yellow-500"
                          profilePicture={gameMaster.profilePicture}
                          username={gameMaster.username}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <FaCrown className="text-muted-foreground" size={24} />
                      <span className="mx-2 font-bold text-muted-foreground">
                        —
                      </span>
                    </>
                  )}
                </div>

                {/* Regular Players Column */}
                <div className="col-span-5 flex items-center gap-2">
                  <FaUser size={24} />
                  <div className="-space-x-2 flex">
                    {regularPlayers?.length === 0 && (
                      <span className="mx-2 font-bold text-muted-foreground">
                        —
                      </span>
                    )}
                    {regularPlayers.map((player) => (
                      <ProfilePicture
                        key={player.id}
                        profilePicture={player.profilePicture}
                        username={player.username}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Numbers */}
              <div className="flex items-center justify-end">
                {room.players.length}/{room.maxPlayers}
              </div>

              {/* Join/Leave Button */}
              <button
                className={
                  isUserInThisRoom
                    ? "col-span-2 rounded-lg bg-destructive px-3 py-2 text-destructive-foreground hover:bg-destructive/80"
                    : "col-span-2 rounded-lg bg-primary px-3 py-2 hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                }
                disabled={isDisabled}
                onClick={() =>
                  isUserInThisRoom
                    ? handleLeaveClick(room.id)
                    : handleJoinClick(room.id)
                }
                type="button"
              >
                {(() => {
                  if (isUserInThisRoom) {
                    return "Leave Room";
                  }
                  if (isRoomFull) {
                    return "Room Full";
                  }
                  return "Join Room";
                })()}
              </button>
            </div>
            {isUserInThisRoom && (
              <div className="border-t pt-4">
                {status === "waiting" ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    {user?.id === gameMaster?.id ? (
                      <>
                        <p className="text-muted-foreground">
                          {isRoomFull
                            ? "All players ready! Start the game when ready."
                            : `Need ${room.maxPlayers - room.players.length} more player(s)...`}
                        </p>
                        <button
                          className={`rounded-lg bg-primary px-3 py-2 hover:bg-primary/80 ${isRoomFull ? "" : "disabled:cursor-not-allowed disabled:opacity-50"}`}
                          disabled={!isRoomFull}
                          onClick={() => handleStartGame(room.id)}
                          type="button"
                        >
                          Start Game
                        </button>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        {isRoomFull
                          ? "All players ready! Wait for the game master to start the game."
                          : `Waiting for ${room.maxPlayers - room.players.length} more player(s)...`}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
