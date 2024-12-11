import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import HashtagPage from "@/pages/HashtagPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Index />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/hashtag/:hashtag" element={<HashtagPage />} />
    </Routes>
  );
}

export default App;