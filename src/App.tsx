import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Chatbot } from "./components/Chatbot";
import SubjectSelection from "./pages/SubjectSelection";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OrientationTest from "./pages/OrientationTest";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import StudentCourseDetail from "./pages/StudentCourseDetail";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import DevicesPage from "./pages/Devices";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CommercialRoute } from "./components/CommercialRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import CommercialLayout from "./pages/commercial/CommercialLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CommercialDashboard from "./pages/commercial/CommercialDashboard";
import CreateUser from "./pages/commercial/CreateUser";
import MyUsers from "./pages/commercial/MyUsers";
import CommercialSettings from "./pages/commercial/Settings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSales from "./pages/admin/AdminSales";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminChapters from "./pages/admin/AdminChapters";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminDirectPayments from "./pages/admin/AdminDirectPayments";
import AdminAICredits from "./pages/admin/AdminAICredits";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Global Chatbot - appears on all pages for authenticated users */}
        <Chatbot />
        <Routes>
          {/* Subject Selection - Entry Point */}
          <Route path="/" element={<SubjectSelection />} />

          {/* Public routes with Navbar */}
          <Route path="/home" element={<><Navbar /><Index /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/orientation-test" element={<ProtectedRoute><OrientationTest /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Navbar /><Documents /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Navbar /><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><Navbar /><CourseDetail /></ProtectedRoute>} />
          <Route path="/course/:id" element={<ProtectedRoute><Navbar /><CourseDetail /></ProtectedRoute>} />
          <Route path="/learn/:courseId" element={<ProtectedRoute><Navbar /><StudentCourseDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Navbar /><Messages /></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><Navbar /><DevicesPage /></ProtectedRoute>} />
          <Route path="/blog" element={<><Navbar /><Blog /></>} />
          <Route path="/faq" element={<><Navbar /><FAQ /></>} />

          {/* Admin routes with separate layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/:courseId/chapters" element={<AdminChapters />} />
            <Route path="chapters" element={<AdminChapters />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="direct-payments" element={<AdminDirectPayments />} />
            <Route path="ai-credits" element={<AdminAICredits />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Commercial routes with separate layout */}
          <Route path="/commercial" element={<CommercialRoute><CommercialLayout /></CommercialRoute>}>
            <Route index element={<CommercialDashboard />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="my-users" element={<MyUsers />} />
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
