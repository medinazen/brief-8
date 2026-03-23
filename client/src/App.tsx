import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import BoardView from "./components/BoardView";
import { api } from "./services/fetchapi";
import type { Board } from "./types/vite-env";

type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
};

export default function App() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [coworking, setCoworking] = useState(false);
  const [ready, setReady] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const user = await api.get<User>("/getUser");
      setCurrentUser(user);
      setAuthError(null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const fetchBoards = useCallback(async () => {
    try {
      const query = coworking ? "?all=true" : "";
      const data = await api.get<Board[]>(`/boards${query}`);
      setBoards(data);
      setSelectedBoard((prev) => {
        if (prev && data.some((b) => b.id === prev.id)) return prev;
        return data.length > 0 ? data[0] : null;
      });
    } catch (error) {
      console.error("Impossible de charger les boards", error);
      setBoards([]);
      setSelectedBoard(null);
    }
  }, [coworking]);

  useEffect(() => {
    const init = async () => {
      await fetchUser();
      setReady(true);
    };
    init();
  }, [fetchUser]);

  useEffect(() => {
    if (currentUser) fetchBoards();
  }, [currentUser, fetchBoards]);

  const createBoard = async () => {
    const title = prompt("Nom du board ?");
    if (!title) return;

    await api.post("/boards", { title });
    await fetchBoards();
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", {});
    } catch (e) {
      console.error("Erreur logout", e);
    } finally {
      setCurrentUser(null);
      setBoards([]);
      setSelectedBoard(null);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    try {
      await api.post("/login", { email, password });
      await fetchUser();
      setAuthError(null);
    } catch {
      setAuthError("Identifiants invalides");
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() ?? "";
    const firstname = formData.get("firstname")?.toString() ?? "";
    const lastname = formData.get("lastname")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    try {
      await api.post("/createUser", { email, firstname, lastname, password });
      await api.post("/login", { email, password });
      await fetchUser();
      setAuthError(null);
    } catch {
      setAuthError("Impossible de créer l'utilisateur");
    }
  };

  if (!ready)
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Chargement...
      </div>
    );

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/60 px-4">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700 backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Trello Clone
            </h1>
            <p className="text-slate-400 text-sm">
              Gérez vos projets efficacement
            </p>
          </div>

          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                authMode === "login"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                authMode === "register"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Inscription
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/15 border-l-4 border-red-500 text-red-400 py-3 px-4 rounded-lg mb-6 text-sm font-medium">
              {authError}
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-slate-300 text-sm font-medium mb-2"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-slate-300 text-sm font-medium mb-2"
                >
                  Mot de passe
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="input-field"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Se connecter →
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-slate-300 text-sm font-medium mb-2"
                >
                  Email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="register-firstname"
                    className="block text-slate-300 text-sm font-medium mb-2"
                  >
                    Prénom
                  </label>
                  <input
                    id="register-firstname"
                    name="firstname"
                    type="text"
                    placeholder="Jean"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label
                    htmlFor="register-lastname"
                    className="block text-slate-300 text-sm font-medium mb-2"
                  >
                    Nom
                  </label>
                  <input
                    id="register-lastname"
                    name="lastname"
                    type="text"
                    placeholder="Dupont"
                    required
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-slate-300 text-sm font-medium mb-2"
                >
                  Mot de passe
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="input-field"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Créer mon compte →
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/40">
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white mb-4">Trello Clone</h1>

          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-slate-300 text-sm">
              Connecté:{" "}
              <span className="font-semibold text-blue-400">
                {currentUser.firstname} {currentUser.lastname}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setCoworking((v) => !v)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                coworking
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300"
              }`}
            >
              {coworking ? " Tous les boards" : "Mes boards"}
            </button>

            <button
              type="button"
              onClick={createBoard}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-200"
            >
              Nouveau board
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors duration-200"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {boards.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
              Boards
            </h2>
            <div className="flex flex-wrap gap-2">
              {boards.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelectedBoard(b)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedBoard?.id === b.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {b.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedBoard ? (
          <BoardView board={selectedBoard} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Aucun board disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
