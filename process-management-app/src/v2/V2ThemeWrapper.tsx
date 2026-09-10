import { ThemeProvider } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import v2Theme from "./theme";

// Scopes the v2 design system to everything under /v2/* without touching the
// app-wide ThemeProvider in src/index.tsx.
export default function V2ThemeWrapper() {
  return (
    <ThemeProvider theme={v2Theme}>
      <Outlet />
    </ThemeProvider>
  );
}
