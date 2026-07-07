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
    if (sessionStorage.getItem("splash_seen")) { setShowSplash(false); return; }
    try {
      const raw = localStorage.getItem("cifras_user");
      if (raw && raw !== "null") setShowSplash(false);
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
