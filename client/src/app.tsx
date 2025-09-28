import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SignInPage } from "./features/auth/sign-in";
import { Gallery } from "./features/gallery/gallery";
import { useAuthStore } from "./stores/auth-store";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate replace to="/signin" />;
}

function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <BrowserRouter>
        <Routes>
          <Route element={<SignInPage />} path="/signin" />

          <Route
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            }
            path="/"
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
