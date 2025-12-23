import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Modules from "./pages/Modules";
import Profile from "./pages/Profile";
import ModuleJourney from "./pages/ModuleJourney";
import BookLessons from "./pages/BookLessons";
import BookLessonContent from "./pages/BookLessonContent";
import MasterclassLibrary from "./pages/MasterclassLibrary";
import MasterclassLesson from "./pages/MasterclassLesson";
import Certificate from "./pages/Certificate";
import NotFound from "./pages/NotFound";

// HotStepper Pages
import {
  HotstepperDashboard,
  HotstepperActiveSession,
  HotstepperLeaderboard,
  HotstepperProfile,
  HotstepperAudiobook,
  HotstepperProtocol,
  HotstepperSetup,
} from "./pages/hotstepper";

// Nutrition Pages
import {
  NutritionDashboard,
  NutritionScanner,
  NutritionLog,
  NutritionProtocol,
} from "./pages/nutrition";

// Garden Pages
import { QuizLibrary, QuizPlayer } from "./pages/garden";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/masterclasses" element={<MasterclassLibrary />} />
              <Route path="/module/:moduleName" element={<ModuleJourney />} />
              <Route path="/masterclass/:moduleName/:lessonId" element={<MasterclassLesson />} />
              <Route path="/book/:moduleName" element={<BookLessons />} />
              <Route path="/book/:moduleName/:lessonId" element={<BookLessonContent />} />
              <Route path="/certificate/:certificateId" element={<Certificate />} />
              
              {/* HotStepper Challenge Routes */}
              <Route path="/hotstepper" element={<HotstepperDashboard />} />
              <Route path="/hotstepper/setup" element={<HotstepperSetup />} />
              <Route path="/hotstepper/active" element={<HotstepperActiveSession />} />
              <Route path="/hotstepper/leaderboard" element={<HotstepperLeaderboard />} />
              <Route path="/hotstepper/audiobook" element={<HotstepperAudiobook />} />
              <Route path="/hotstepper/protocol" element={<HotstepperProtocol />} />
              <Route path="/hotstepper/profile" element={<HotstepperProfile />} />
              
              {/* Tactical Nutrition Routes */}
              <Route path="/nutrition" element={<NutritionDashboard />} />
              <Route path="/nutrition/scanner" element={<NutritionScanner />} />
              <Route path="/nutrition/log" element={<NutritionLog />} />
              <Route path="/nutrition/protocol" element={<NutritionProtocol />} />
              
              {/* Soul Garden Routes */}
              <Route path="/garden/quizzes" element={<QuizLibrary />} />
              <Route path="/garden/quizzes/:quizId" element={<QuizPlayer />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
