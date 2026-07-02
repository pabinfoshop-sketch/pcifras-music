import { createFileRoute, Link } from "@tanstack/react-router";
// @ts-ignore
import Tuner from "../components/Tuner.jsx";

function TunerPage() {
  return (
    <div className="app-layout">
      <div className="tuner-page-wrapper" style={{ padding: 16 }}>
        <Link to="/" className="btn" style={{ marginBottom: 12, display: "inline-block" }}>
          ← Voltar
        </Link>
        <Tuner onClose={() => history.back()} />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/tuner")({
  component: TunerPage,
});
