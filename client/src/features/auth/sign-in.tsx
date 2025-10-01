import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginUser, registerUser } from "../../services/auth";
import { useAuthStore } from "../../stores/auth-store";

export function SignInPage() {
  const [isSignIn, setIsSignIn] = useState<boolean>(true);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username: string = formData.get("username") as string;
    const password: string = formData.get("password") as string;

    try {
      if (isSignIn) {
        const response = await loginUser(username, password);
        login(response.data.token || "mock-token", {
          username,
          id: response.data.userId || "1",
          displayName: response.data.displayName,
          profilePicture: response.data.profilePicture,
          profileCompleted: response.data.profileCompleted,
        });
        toast(response.data.message);
        navigate("/");
      } else {
        const response = await registerUser(username, password);
        toast(response.data.message);
        // Automatically log in the user after successful registration
        login(response.data.token || "mock-token", {
          username: response.data.username,
          id: response.data.userId,
          displayName: response.data.displayName,
          profilePicture: response.data.profilePicture,
          profileCompleted: response.data.profileCompleted,
        });
        navigate("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast(error.response?.data.error);
      }
    }
  };

  return (
    <div className="flex w-lg flex-col justify-center gap-4 rounded-2xl border-2 p-8">
      <h1 className="w-full text-center font-bold text-2xl">
        {isSignIn ? "Sign In" : "Create an Account"}
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>
      </form>
      <p className="text-center">
        <span>
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
        </span>{" "}
        <button
          className="cursor-pointer border-none bg-transparent p-0 font-inherit text-primary"
          onClick={() => setIsSignIn(!isSignIn)}
          type="button"
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
