import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GradientPageProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GradientPage: React.FC<GradientPageProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("min-h-screen w-screen bg-black relative overflow-hidden", className)} {...props}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-purple-300/20 blur-[60px]" animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }} />
      <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-purple-400/20 blur-[60px]" animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GradientPage;


