import { createTheme } from "@mui/material";

// Brand colors are locked to the existing app's palette (src/theme.ts) — only
// typography/shape/component defaults differ for the v2 "spec-sheet" look.
export const v2Colors = {
  primary: '#bb0037',
  primaryTint: '#fbe6ea',
  secondary: '#3c9e09',
  secondaryTint: '#e6f4dd',
  info: '#007fff',
  infoTint: '#e2f0ff',
  amber: '#9a5b00',
  amberTint: '#fbead2',
  ink: '#1b2027',
  muted: '#5b6572',
  faint: '#8b94a0',
  line: '#dbe0e5',
  surface: '#ffffff',
  surface2: '#f7f8fa',
  bg: '#f1f3f5',
  sidebarBg: '#12161c',
  sidebarBg2: '#1a2029',
  sidebarLine: '#262d38',
  sidebarText: '#aab3c0',
  sidebarTextDim: '#6b7684',
};

export const v2Fonts = {
  display: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif",
  body: "'Trebuchet MS', 'Segoe UI', system-ui, sans-serif",
  mono: "Consolas, 'SFMono-Regular', ui-monospace, 'Courier New', monospace",
};

// Radius/shadow tokens lifted from ui-design-concept.html (--radius, --radius-lg, --shadow-*)
export const v2Radius = {
  sm: 5,
  lg: 8,
};

export const v2Shadows = {
  drawer: '-12px 0 32px rgba(15,18,22,0.18)',
  modal: '0 20px 48px rgba(15,18,22,0.28)',
  pop: '0 8px 20px rgba(15,18,22,0.10)',
};

// Recurring status color map used across Assembly / OrderDetail / Dashboard
// (kept as plain values, not MUI palette entries, since each page defines its
// own status -> color logic exactly as the existing pages do).
export const v2StatusColors: Record<string, string> = {
  Pending: v2Colors.muted,
  'Assembly In-Progress': v2Colors.info,
  'Ready to Assemble': v2Colors.amber,
  'Assembly Completed': v2Colors.secondary,
};

const v2Theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: v2Colors.primary },
    secondary: { main: v2Colors.secondary },
    background: { default: v2Colors.bg, paper: v2Colors.surface },
    text: { primary: v2Colors.ink, secondary: v2Colors.muted },
  },
  shape: {
    borderRadius: 5,
  },
  components: {
    MuiButton: {
      defaultProps: { disableRipple: false, color: 'secondary' },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: `1px solid ${v2Colors.line}`,
          borderRadius: v2Radius.lg,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: 'none',
          border: `1px solid ${v2Colors.line}`,
          borderRadius: v2Radius.lg,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: v2Radius.lg,
          boxShadow: v2Shadows.modal,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          fontSize: '13px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '13px',
          padding: '11px 16px',
          verticalAlign: 'middle',
          borderBottom: `1px solid ${v2Colors.line}`,
        },
        head: {
          textAlign: 'left',
          textTransform: 'uppercase',
          fontSize: '10.5px',
          letterSpacing: '0.07em',
          fontWeight: 700,
          color: v2Colors.muted,
          backgroundColor: v2Colors.surface2,
          padding: '10px 16px',
          whiteSpace: 'nowrap',
          borderBottom: `1px solid ${v2Colors.line}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td, &:last-child th': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
  },
  typography: {
    allVariants: {
      fontFamily: v2Fonts.body,
      textTransform: 'none',
    },
    h1: { fontFamily: v2Fonts.display, fontWeight: 700 },
    h2: { fontFamily: v2Fonts.display, fontWeight: 700 },
    h3: { fontFamily: v2Fonts.display, fontWeight: 700 },
    h4: { fontFamily: v2Fonts.display, fontWeight: 700 },
    h5: { fontFamily: v2Fonts.display, fontWeight: 700 },
    h6: { fontFamily: v2Fonts.display, fontWeight: 700 },
  },
});

export default v2Theme;
