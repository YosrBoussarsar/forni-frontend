import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme, alpha, Container, Badge } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import RecommendIcon from "@mui/icons-material/Recommend";

export default function CustomerNavbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const { getCartCount, clearCartOnLogout } = useContext(CartContext);

  const handleLogout = () => {
    clearCartOnLogout();
    logout();
    navigate("/");
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <StorefrontIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography 
              variant="h5" 
              component={Link}
              to="/customer-dashboard"
              sx={{ 
                fontWeight: 700,
                background: "linear-gradient(45deg, #FFF 30%, #FFE5CC 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}
            >
              Forni
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/customer-dashboard"
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              Home
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/bakeries"
              startIcon={<StorefrontIcon />}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              Bakeries
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/surplus-bags"
              startIcon={<ShoppingBagIcon />}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              Surprise Bags
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/recommendations"
              startIcon={<RecommendIcon />}
              sx={{ 
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              For You
            </Button>
            
            <IconButton
              color="inherit"
              component={Link}
              to="/cart"
              sx={{ 
                ml: 1,
                "&:hover": { 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                }
              }}
            >
              <Badge badgeContent={getCartCount()} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              color="inherit"
              component={Link}
              to="/profile"
              sx={{ 
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
