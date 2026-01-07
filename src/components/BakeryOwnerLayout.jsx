import BakeryOwnerNavbar from "./BakeryOwnerNavbar";
import { Container, Box } from "@mui/material";

export default function BakeryOwnerLayout({ children }) {
  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #E8F4F8 0%, #D6E9F5 100%)",
    }}>
      <BakeryOwnerNavbar />
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
