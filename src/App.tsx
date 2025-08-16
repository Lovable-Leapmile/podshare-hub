import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import SiteAdminDashboard from "./pages/SiteAdminDashboard";
import SiteSecurityDashboard from "./pages/SiteSecurityDashboard";
import Locations from "./pages/Locations";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Reservation from "./pages/Reservation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/site-admin-dashboard" element={<SiteAdminDashboard />} />
          <Route path="/site-security-dashboard" element={<SiteSecurityDashboard />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<Support />} />
          <Route path="/reservation" element={<Reservation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
