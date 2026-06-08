import { useRef, MouseEvent } from "react";
import { motion, useSpring } from "motion/react";

interface DeflectCardProps {
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
}

export function DeflectCard({ children, className = "", cardClassName = "" }: DeflectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  // Smooth spring motion values for natural physics
  const rotateX = useSpring(0, { stiffness: 180, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 22 });
  const scale = useSpring(1, { stiffness: 180, damping: 22 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    const centerX = width / 2;
    const centerY = height / 2;

    // Max tilt angle in degrees
    const maxTilt = 8;

    // Tilt the hovered edge away (inward)
    const rY = -((x - centerX) / centerX) * maxTilt;
    const rX = ((y - centerY) / centerY) * maxTilt;

    rotateX.set(rX);
    rotateY.set(rY);
    scale.set(1.015);

    // Create a dark overlay shadow centered on the cursor
    // Mix-blend-multiply on light mode / overlay on dark mode will naturally darken the area
    if (shadowRef.current) {
      shadowRef.current.style.background = `radial-gradient(circle 100px at ${x}px ${y}px, rgba(0, 0, 0, 0.16) 0%, transparent 80%)`;
    }
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <div className={className} style={{ perspective: "1000px" }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        className={`group relative h-full w-full cursor-pointer shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/10 ${cardClassName ? cardClassName : "rounded-xl bg-card"}`}
      >
        {children}
        <div
          ref={shadowRef}
          className="absolute inset-0 pointer-events-none rounded-[inherit] z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </motion.div>
    </div>
  );
}
