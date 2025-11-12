import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import SubjectSelection from "./pages/SubjectSelection";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CommercialRoute } from "./components/CommercialRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import CommercialLayout from "./pages/commercial/CommercialLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CommercialDashboard from "./pages/commercial/CommercialDashboard";
import CreateUser from "./pages/commercial/CreateUser";
import Revenues from "./pages/commercial/Revenues";
import CommercialSettings from "./pages/commercial/Settings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSales from "./pages/admin/AdminSales";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminChapters from "./pages/admin/AdminChapters";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminAICredits from "./pages/admin/AdminAICredits";
import AdminNotifications from "./pages/admin/AdminNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Subject Selection - Entry Point */}
          <Route path="/" element={<SubjectSelection />} />
          
          {/* Public routes with Navbar */}
          <Route path="/home" element={<><Navbar /><Index /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Navbar /><Courses /></ProtectedRoute>} />
          <Route path="/course/:id" element={<ProtectedRoute><Navbar /><CourseDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
          <Route path="/blog" element={<><Navbar /><Blog /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /></>} />
          <Route path="/faq" element={<><Navbar /><FAQ /></>} />
          
          {/* Admin routes with separate layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="chapters" element={<AdminChapters />} />
            <Route path="documents" element={<AdminCourses />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="ai-credits" element={<AdminAICredits />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>

          {/* Commercial routes with separate layout */}
          <Route path="/commercial" element={<CommercialRoute><CommercialLayout /></CommercialRoute>}>
            <Route index element={<CommercialDashboard />} />
            <Route path="revenues" element={<Revenues />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="settings" element={<CommercialSettings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
