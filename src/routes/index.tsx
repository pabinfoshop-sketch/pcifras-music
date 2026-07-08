import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import SplashScreen from "../components/SplashScreen";
// @ts-ignore - JSX legado do app original
import App from "../components/App.jsx";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Pula splash se já viu nesta sessão OU se já existe um usuário salvo (login persistido)
    // OU se estamos voltando de um OAuth callback (hash com access_token / query com code)
    if (sessionStorage.getItem("splash_seen")) { setShowSplash(false); return; }
    const h = window.location.hash || "";
    const s = window.location.search || "";
    if (h.includes("access_token") || h.includes("id_token") || /[?&]code=/.test(s)) {
      sessionStorage.setItem("splash_seen", "1");
      setShowSplash(false);
      return;
    }
    try {
      const raw = localStorage.getItem("cifras_user");
      if (raw && raw !== "null") setShowSplash(false);
    } catch {}
    // Também detecta sessão Supabase já persistida no localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        if (k.startsWith("sb-") && k.endsWith("-auth-token")) {
          setShowSplash(false);
          break;
        }
      }
    } catch {}
  }, []);

  const handleDone = () => {
    sessionStorage.setItem("splash_seen", "1");
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={handleDone} />}
      <App />
    </>
  );
}
