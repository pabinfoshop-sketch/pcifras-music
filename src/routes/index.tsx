import { createFileRoute } from "@tanstack/react-router";
// @ts-ignore - JSX legado do app original
import App from "../components/App.jsx";

export const Route = createFileRoute("/")({
  component: App,
});
