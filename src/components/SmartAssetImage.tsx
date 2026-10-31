"use client";

import React, { useState } from "react";

interface SmartAssetImageProps {
  baseName: "pooya-fintech" | "quant-core";
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}

const CANDIDATE_PATHS = (name: string) => [
  `/aurapulse/assets/${name}.webp`,
  `/aurapulse/assets/${name}.png`,
  `/aurapulse/assets/${name}.jpg`,
  `/assets/${name}.webp`,
  `/assets/${name}.png`,
  `/assets/${name}.jpg`,
];

export default function SmartAssetImage({
  baseName,
  alt,
  className = "w-full h-full object-cover",
  fallback,
}: SmartAssetImageProps) {
  const paths = CANDIDATE_PATHS(baseName);
  const [idx, setIdx] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  if (failedAll) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={paths[idx]}
      alt={alt}
      className={className}
      onError={() => {
        if (idx + 1 < paths.length) {
          setIdx(idx + 1);
        } else {
          setFailedAll(true);
        }
      }}
    />
  );
}