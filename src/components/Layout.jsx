import Navbar from "./Navbar";
import { Container, Box } from "@mui/material";

export default function Layout({ children }) {
  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)",
    }}>
      <Navbar />
      <Container maxWidth="lg">
        <Box sx={{ 
          py: 5,
          minHeight: "calc(100vh - 80px)",
        }}>
          {children}
        </Box>
      </Container>
    </Box>
  );
}
