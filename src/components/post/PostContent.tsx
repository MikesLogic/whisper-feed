interface PostContentProps {
  content: string;
  mediaUrl?: string | null;
  isMuted?: boolean;
}

export const PostContent = ({ content, mediaUrl, isMuted }: PostContentProps) => {
  if (isMuted) {
    return <p className="mt-2 text-gray-500 italic">Content hidden from muted user</p>;
  }

  return (
    <>
      <p className="mt-2 text-gray-700">{content}</p>
      {mediaUrl && (
        <div className="mt-3">
          {mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img 
              src={mediaUrl} 
              alt="Post attachment" 
              className="rounded-lg max-h-96 w-auto"
            />
          ) : mediaUrl.match(/\.(mp4|webm)$/i) ? (
            <video 
              src={mediaUrl} 
              controls 
              className="rounded-lg max-h-96 w-auto"
            />
          ) : null}
        </div>
      )}
    </>
  );
};