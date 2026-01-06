import { useEffect, useState } from "react";
import { recommendationsApi } from "../api/recommendationsApi";
import Layout from "../components/Layout";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

export default function Recommendations() {
  const [bags, setBags] = useState([]);

  useEffect(() => {
  recommendationsApi
    .list()
    .then((res) => setBags(res.data))
    .catch((err) => {
      console.error("Error loading recommendations:", err);
      if (err.response?.status === 401 || err.response?.status === 422) {
        alert("Please log in to see recommendations.");
      }
    });
  }, []);


  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Recommended Surprise Bags
      </Typography>

      <Grid container spacing={3}>
        {bags.map((bag) => (
          <Grid item xs={12} md={4} key={bag.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{bag.title}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Price: {bag.sale_price} TND
                </Typography>

                <Button variant="contained">Order Now</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}
