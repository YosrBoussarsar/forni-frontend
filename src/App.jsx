import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import BakeryOwnerDashboard from "./pages/BakeryOwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Bakeries from "./pages/Bakeries";
import SurplusBags from "./pages/SurplusBags";
import Recommendations from "./pages/Recommendations";
import BakeryDetails from "./pages/BakeryDetails";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import ManageBakery from "./pages/ManageBakery";
import ManageProducts from "./pages/ManageProducts";
import ManageSurplusBags from "./pages/ManageSurplusBags";
import Products from "./pages/Products";
import BakeryAnalytics from "./pages/BakeryAnalytics";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/bakery-dashboard" element={<BakeryOwnerDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/bakeries" element={<Bakeries />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/bags" element={<SurplusBags />} />
              <Route path="/surplus-bags" element={<SurplusBags />} />
              <Route path="/bakeries/:id" element={<BakeryDetails />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/products" element={<Products />} />
              
              {/* Bakery Owner routes */}
              <Route path="/manage-bakery" element={<ManageBakery />} />
              <Route path="/manage-products" element={<ManageProducts />} />
              <Route path="/manage-surplus-bags" element={<ManageSurplusBags />} />
              <Route path="/bakery-analytics" element={<BakeryAnalytics />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
