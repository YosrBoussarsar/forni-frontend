import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#D35400",
      light: "#E67E22",
      dark: "#BA4A00",
      contrastText: "#fff",
    },
    secondary: {
      main: "#6D4C41",
      light: "#8D6E63",
      dark: "#5D4037",
      contrastText: "#fff",
    },
    background: {
      default: "#FFF8F0",
      paper: "#FFFFFF",
    },
    success: {
      main: "#27AE60",
      light: "#2ECC71",
    },
    error: {
      main: "#E74C3C",
    },
    warning: {
      main: "#F39C12",
    },
    info: {
      main: "#3498DB",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#7F8C8D",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', 'Roboto', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0,0,0,0.05)",
    "0px 4px 8px rgba(0,0,0,0.08)",
    "0px 6px 12px rgba(0,0,0,0.1)",
    "0px 8px 16px rgba(0,0,0,0.12)",
    "0px 12px 24px rgba(0,0,0,0.15)",
    "0px 16px 32px rgba(0,0,0,0.18)",
    "0px 20px 40px rgba(0,0,0,0.2)",
    "0px 24px 48px rgba(0,0,0,0.22)",
    ...Array(16).fill("0px 24px 48px rgba(0,0,0,0.22)"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: "0.95rem",
          boxShadow: "none",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0px 6px 16px rgba(211, 84, 0, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
