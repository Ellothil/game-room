import { registerUser } from "../../services/auth";

export function SignInPage() {
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username: string = formData.get("username") as string;
    const password: string = formData.get("password") as string;
    await registerUser(username, password);
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col gap-4 rounded-2xl border-2 p-8">
        <form
          className="flex max-w-2xl flex-col gap-4"
          onSubmit={handleRegister}
        >
          <input
            className="rounded-lg border px-3 py-2"
            name="username"
            placeholder="Username"
            required
            type="text"
          />
          <input
            className="rounded-lg border px-3 py-2"
            name="password"
            placeholder="Password"
            required
            type="password"
          />
          <button
            className="rounded-lg bg-primary px-3 py-2 hover:bg-primary/80"
            type="submit"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
