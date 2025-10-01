/** biome-ignore-all lint/performance/noImgElement: <img is okay when not using next and only small images> */
export function ProfilePicture({
  profilePicture,
  username,
  className,
}: {
  profilePicture: string | undefined;
  username: string;
  className?: string;
}) {
  return (
    <div
      className={
        "relative h-8 w-8 overflow-hidden rounded-full border-2 border-background" +
        className
      }
      title={username}
    >
      {profilePicture ? (
        <img
          alt={username}
          className="h-full w-full object-cover"
          height={32}
          src={profilePicture}
          width={32}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary font-bold text-primary-foreground text-xs">
          {username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
