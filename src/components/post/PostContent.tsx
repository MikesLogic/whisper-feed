import { useState } from "react";
import { Link } from "react-router-dom";

interface PostContentProps {
  content: string;
  postId: string;
  mediaUrl?: string | null;
  isMuted?: boolean;
}

export const PostContent = ({ content, postId, mediaUrl, isMuted }: PostContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = content.split('\n');
  const shouldTruncate = lines.length > 4;
  
  const displayContent = shouldTruncate && !isExpanded
    ? lines.slice(0, 4).join('\n')
    : content;

  if (isMuted) {
    return <p className="text-gray-500 italic">Content hidden from muted user</p>;
  }

  return (
    <div className="space-y-3">
      <div className="whitespace-pre-wrap">
        {displayContent}
        {shouldTruncate && !isExpanded && (
          <div className="mt-2">
            <Link
              to={`/post/${postId}`}
              className="text-primary hover:text-primary-hover"
            >
              Read more...
            </Link>
          </div>
        )}
      </div>
      {mediaUrl && (
        <div className="mt-2">
          {mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img src={mediaUrl} alt="Post media" className="rounded-lg max-h-96 w-auto" />
          ) : mediaUrl.match(/\.(mp4|webm)$/i) ? (
            <video 
              controls 
              className="rounded-lg max-h-96 w-auto"
              src={mediaUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>
      )}
    </div>
  );
};