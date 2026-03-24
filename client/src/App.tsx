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
    } catch {
      setBoards([]);
      setSelectedBoard(null);
    }
  }, [coworking]);

  useEffect(() => {
    const init = async () => { await fetchUser(); setReady(true); };
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
    try { await api.post("/logout", {}); } catch {}
    setCurrentUser(null);
    setBoards([]);
    setSelectedBoard(null);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await api.post("/login", {
        email: f.get("email")?.toString() ?? "",
        password: f.get("password")?.toString() ?? "",
      });
      await fetchUser();
      setAuthError(null);
    } catch {
      setAuthError("Identifiants invalides");
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await api.post("/createUser", {
        email:     f.get("email")?.toString() ?? "",
        firstname: f.get("firstname")?.toString() ?? "",
        lastname:  f.get("lastname")?.toString() ?? "",
        password:  f.get("password")?.toString() ?? "",
      });
      await api.post("/login", {
        email:    f.get("email")?.toString() ?? "",
        password: f.get("password")?.toString() ?? "",
      });
      await fetchUser();
      setAuthError(null);
    } catch {
      setAuthError("Impossible de créer le compte");
    }
  };

  if (!ready) {
    return (
      <div className="loading-screen">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">
            Trello <em>Clone</em>
          </h1>
          <p className="auth-subtitle">Organisez vos projets simplement</p>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${authMode === "login" ? " active" : ""}`}
              onClick={() => { setAuthMode("login"); setAuthError(null); }}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`auth-tab${authMode === "register" ? " active" : ""}`}
              onClick={() => { setAuthMode("register"); setAuthError(null); }}
            >
              Inscription
            </button>
          </div>

          {authError && <div className="alert-error">{authError}</div>}

          {authMode === "login" ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">Email</label>
                <input id="login-email" name="email" type="email" placeholder="vous@exemple.com" required className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Mot de passe</label>
                <input id="login-password" name="password" type="password" placeholder="••••••••" required className="form-input" />
              </div>
              <button type="submit" className="btn-submit">Se connecter →</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">Email</label>
                <input id="reg-email" name="email" type="email" placeholder="vous@exemple.com" required className="form-input" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-firstname" className="form-label">Prénom</label>
                  <input id="reg-firstname" name="firstname" type="text" placeholder="Jean" required className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-lastname" className="form-label">Nom</label>
                  <input id="reg-lastname" name="lastname" type="text" placeholder="Dupont" required className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">Mot de passe</label>
                <input id="reg-password" name="password" type="password" placeholder="••••••••" required className="form-input" />
              </div>
              <button type="submit" className="btn-submit">Créer mon compte →</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-logo">📋 Trello <em>Clone</em></span>

          <div className="user-badge">
            <strong>{currentUser.firstname} {currentUser.lastname}</strong>
          </div>

          <button
            type="button"
            onClick={() => setCoworking((v) => !v)}
            className={`btn-header${coworking ? " active" : ""}`}
          >
            {coworking ? "Tous les boards" : "Mes boards"}
          </button>

          <button type="button" onClick={createBoard} className="btn-header new-board">
            + Nouveau board
          </button>

          <button type="button" onClick={handleLogout} className="btn-header logout">
            Déconnexion
          </button>
        </div>
      </header>

      {boards.length > 0 && (
        <div className="board-tabs-section">
          <p className="board-tabs-label">Boards</p>
          <div className="board-tabs">
            {boards.map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={() => setSelectedBoard(b)}
                className={`board-tab${selectedBoard?.id === b.id ? " active" : ""}`}
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
        <div className="empty-state">
          <p className="empty-state-title">Aucun board pour l'instant</p>
          <p className="empty-state-sub">Créez votre premier board pour commencer</p>
        </div>
      )}
    </div>
  );
}