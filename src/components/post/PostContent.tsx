import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface PostContentProps {
  content: string;
  mediaUrl?: string | null;
  isMuted?: boolean;
}

interface LinkPreviewProps {
  url: string;
}

const LinkPreview = ({ url }: LinkPreviewProps) => {
  const [preview, setPreview] = useState<{
    title?: string;
    description?: string;
    image?: string;
  }>({});

  // In a real implementation, you would fetch the preview data
  // from an API service like OpenGraph.io or your own backend

  return (
    <Card className="mt-2 p-4">
      <a href={url} target="_blank" rel="noopener noreferrer" className="no-underline">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{preview.title || url}</h3>
          {preview.description && (
            <p className="text-sm text-gray-500">{preview.description}</p>
          )}
          {preview.image && (
            <img src={preview.image} alt="Link preview" className="rounded-lg max-h-32 w-auto" />
          )}
        </div>
      </a>
    </Card>
  );
};

export const PostContent = ({ content, mediaUrl, isMuted }: PostContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = content.split('\n');
  const shouldTruncate = lines.length > 4;
  
  const displayContent = shouldTruncate && !isExpanded
    ? lines.slice(0, 4).join('\n')
    : content;

  if (isMuted) {
    return <p className="text-gray-500 italic">Content hidden from muted user</p>;
  }

  const renderContent = (text: string) => {
    // Split content into segments
    const segments = text.split(/(\s+)/);
    
    return segments.map((segment, index) => {
      // Handle hashtags
      if (segment.startsWith('#')) {
        return (
          <Link
            key={index}
            to={`/hashtag/${segment.slice(1)}`}
            className="text-primary hover:underline"
          >
            {segment}
          </Link>
        );
      }
      
      // Handle mentions
      if (segment.startsWith('@')) {
        return (
          <Link
            key={index}
            to={`/profile/${segment.slice(1)}`}
            className="text-primary hover:underline"
          >
            {segment}
          </Link>
        );
      }
      
      // Handle URLs
      if (segment.match(/^(https?:\/\/[^\s]+)/)) {
        return (
          <div key={index}>
            <a
              href={segment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {segment}
            </a>
            <LinkPreview url={segment} />
          </div>
        );
      }
      
      // Return regular text
      return segment;
    });
  };

  return (
    <div className="space-y-3">
      <div className="whitespace-pre-wrap">
        {renderContent(displayContent)}
        {shouldTruncate && !isExpanded && (
          <div className="mt-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-primary hover:text-primary-hover"
            >
              Read more...
            </button>
          </div>
        )}
      </div>
      {mediaUrl && (
        <div className="mt-2">
          {mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img 
              src={mediaUrl} 
              alt="Post media" 
              className="rounded-lg max-h-96 w-auto object-contain"
              loading="lazy"
            />
          ) : mediaUrl.match(/\.(mp4|webm)$/i) ? (
            <video 
              controls 
              className="rounded-lg max-h-96 w-auto"
              src={mediaUrl}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>
      )}
    </div>
  );
};