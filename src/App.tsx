import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import HashtagPage from "@/pages/HashtagPage";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Index />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/hashtag/:hashtag" element={<HashtagPage />} />
        </Routes>
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;