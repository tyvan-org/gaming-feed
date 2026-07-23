"use client";

import { useEffect, useRef, useState } from "react";

type ArticleThumbnailProps = {
  fit?: "contain" | "cover";
  src: string | null;
  priority: boolean;
};

export function ArticleThumbnail({
  fit = "cover",
  src,
  priority,
}: ArticleThumbnailProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    const image = imageRef.current;

    if (!image?.complete) {
      return;
    }

    if (image.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setHasError(true);
    }
  }, [src]);

  return (
    <div className="mt-0.5 h-12 overflow-hidden rounded-md border border-line bg-thumb sm:h-16">
      {src && !hasError ? (
        <img
          ref={imageRef}
          src={src}
          alt=""
          className={`h-full w-full transition duration-300 group-hover:scale-[1.02] ${
            fit === "contain" ? "object-contain p-2" : "object-cover"
          } ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading={priority ? "eager" : "lazy"}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0) {
              setIsLoaded(true);
            } else {
              setHasError(true);
            }
          }}
          onError={() => setHasError(true)}
        />
      ) : null}
    </div>
  );
}
