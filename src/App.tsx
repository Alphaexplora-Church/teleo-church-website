import { AuthProvider } from "./shared/context/AuthContext";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
