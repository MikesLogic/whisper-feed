import { useParams, useNavigate } from "react-router-dom";
import { PostFeed } from "@/components/post/PostFeed";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const HashtagPage = () => {
  const { hashtag } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-primary z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:text-white/80"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-white">#{hashtag}</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="pt-20 px-4 pb-20 max-w-2xl mx-auto">
        <PostFeed hashtag={hashtag} />
      </main>
    </div>
  );
};

export default HashtagPage;