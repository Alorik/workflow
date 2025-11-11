"use client";
import React, { useEffect, useRef, useState } from "react";

type Item = {
  quote: string;
  name: string;
  title: string;
};
type Props = {
  items: Item[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
};
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: Props) => {};

export default function InfiniteMovingCards({ items, ...props }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  function addAnimations() {
    if (containerRef.current && scrollerRef) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicateItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });
      setStart(true);
    }
  }

  useEffect(() => {
    addAnimation();
  },[])

  return (
    <div ref={containerRef}>
      <ul ref={scrollerRef} className={start ? "animate-scroll" : ""}>
        {items.map((item) => (
          <li key={item.name}>
            <p>{item.quote}</p>
            <p>{item.name}</p>
            <p>{item.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
