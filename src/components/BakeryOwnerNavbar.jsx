import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme, alpha, Container } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ListAltIcon from "@mui/icons-material/ListAlt";

export default function BakeryOwnerNavbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, #1976d2 0%, #1565c0 100%)`,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <BakeryDiningIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography 
              variant="h5" 
              component={Link}
              to="/bakery-dashboard"
              sx={{ 
                fontWeight: 700,
                background: "linear-gradient(45deg, #FFF 30%, #B3E5FC 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}
            >
              Forni Business
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/bakery-dashboard"
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/manage-bakery"
              startIcon={<AddBusinessIcon />}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              My Bakery
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/manage-products"
              startIcon={<InventoryIcon />}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              Products
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/manage-surplus-bags"
              startIcon={<ShoppingBagIcon />}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              Surplus Bags
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/orders"
              startIcon={<ListAltIcon />}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              Orders
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/bakery-analytics"
              startIcon={<AssessmentIcon />}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              Analytics
            </Button>
            
            <IconButton
              color="inherit"
              component={Link}
              to="/profile"
              sx={{ 
                ml: 1,
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              <AccountCircleIcon />
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
