import Layout from "../components/Layout";
import { Typography, Box, Grid, Card, CardContent, alpha, useTheme } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RecommendIcon from "@mui/icons-material/Recommend";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const theme = useTheme();

  const quickLinks = [
    {
      title: "Bakeries",
      icon: <StorefrontIcon sx={{ fontSize: 48 }} />,
      description: "Discover local bakeries near you",
      path: "/bakeries",
      color: theme.palette.primary.main,
    },
    {
      title: "Surprise Bags",
      icon: <LocalOfferIcon sx={{ fontSize: 48 }} />,
      description: "Browse available surprise bags",
      path: "/bags",
      color: theme.palette.secondary.main,
    },
    {
      title: "My Orders",
      icon: <ReceiptLongIcon sx={{ fontSize: 48 }} />,
      description: "Track your order history",
      path: "/orders",
      color: theme.palette.success.main,
    },
    {
      title: "For You",
      icon: <RecommendIcon sx={{ fontSize: 48 }} />,
      description: "Personalized recommendations",
      path: "/recommendations",
      color: theme.palette.info.main,
    },
  ];

  return (
    <Layout>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome to Forni
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
          Your platform to explore bakeries, discover surprise bags, and reduce food waste together
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quickLinks.map((link, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              component={Link}
              to={link.path}
              sx={{
                textDecoration: "none",
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: `linear-gradient(135deg, ${alpha(link.color, 0.1)} 0%, ${alpha(link.color, 0.05)} 100%)`,
                borderTop: `4px solid ${link.color}`,
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: `0 12px 24px ${alpha(link.color, 0.2)}`,
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Box sx={{ color: link.color, mb: 2 }}>
                  {link.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {link.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {link.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 6,
          p: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🌍 Fighting Food Waste Together
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Every surprise bag you purchase helps reduce food waste and supports local bakeries. 
          Join our community in making a positive impact on the environment, one delicious treat at a time!
        </Typography>
      </Box>
    </Layout>
  );
}
