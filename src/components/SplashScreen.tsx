import { useEffect, useState } from "react";

const LOGO_URL = "/icons/icon-192.png";


export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 3200);
    const t2 = setTimeout(() => onDone(), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at center, #3a2418 0%, #1a0f0a 70%, #0c0603 100%)",
        opacity: leaving ? 0 : 1,
        transition: "opacity 600ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: 32,
          borderRadius: 28,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(6px)",
          animation: "splashPop 700ms cubic-bezier(.2,.9,.3,1.2) both",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 6,
            color: "#8b7ff0",
            fontWeight: 600,
          }}
        >
          SEJA BEM-VINDO
        </div>

        <img
          src={LOGO_URL}
          alt="PCifrasMusic"
          width={180}
          height={180}
          style={{
            borderRadius: 32,
            boxShadow: "0 20px 60px rgba(0,0,0,.6)",
            animation: "splashFloat 2.4s ease-in-out infinite",
          }}
        />

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}>
            PCifras<span style={{ color: "#22d3ee" }}>Music</span>
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 5,
              color: "#a89b8f",
              marginTop: 6,
            }}
          >
            CIFRAS & REPERTÓRIOS
          </div>
        </div>

        <div
          style={{
            width: 180,
            height: 4,
            borderRadius: 4,
            background: "rgba(255,255,255,.1)",
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: "40%",
              height: "100%",
              background: "linear-gradient(90deg,#22d3ee,#7c6df0)",
              animation: "splashBar 1.4s ease-in-out infinite",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "rgba(255,255,255,.4)",
            textAlign: "center",
          }}
        >
          Criado com carinho por<br />
          <span style={{ color: "rgba(255,255,255,.6)" }}>PauloC</span>
        </div>
      </div>

      <style>{`
        @keyframes splashPop {
          0% { transform: scale(.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes splashBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
