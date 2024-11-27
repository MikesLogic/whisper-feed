import { useParams } from "react-router-dom";
import { PostFeed } from "@/components/post/PostFeed";

const HashtagPage = () => {
  const { hashtag } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-primary z-50 shadow-md">
        <div className="flex items-center justify-center px-4 h-14">
          <h1 className="text-xl font-semibold text-white">#{hashtag}</h1>
        </div>
      </header>

      <main className="pt-20 px-4 pb-20 max-w-2xl mx-auto">
        <PostFeed hashtag={hashtag} />
      </main>
    </div>
  );
};

export default HashtagPage;