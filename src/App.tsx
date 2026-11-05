import { AuthProvider } from "./shared/context/AuthContext";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <div className="min-h-screen bg-midnight-teal text-soft-linen font-sans antialiased">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </div>
  );
}
