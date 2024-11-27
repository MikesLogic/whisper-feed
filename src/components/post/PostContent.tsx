import { useState } from "react";
import { Link } from "react-router-dom";

interface PostContentProps {
  content: string;
  postId: string;
}

export const PostContent = ({ content, postId }: PostContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = content.split('\n');
  const shouldTruncate = lines.length > 4;
  
  const displayContent = shouldTruncate && !isExpanded
    ? lines.slice(0, 4).join('\n')
    : content;

  return (
    <div className="whitespace-pre-wrap mb-3">
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
  );
};