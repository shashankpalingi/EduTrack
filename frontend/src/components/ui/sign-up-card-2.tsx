import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function CardInput({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className
      )}
      {...props}
    />
  );
}

export interface SignUpCard2Props {
  onSubmit?: (email: string, password: string, role: "student" | "teacher") => Promise<void> | void;
  isLoading?: boolean;
}

export default function SignUpCard2({ onSubmit, isLoading: externalLoading }: SignUpCard2Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [isLoading, setIsLoading] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const loading = externalLoading ?? isLoading;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (externalLoading === undefined) setIsLoading(true);
    try {
      await onSubmit?.(email, password, role);
    } finally {
      if (externalLoading === undefined) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-purple-300/20 blur-[60px]" animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }} />
      <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-purple-400/20 blur-[60px]" animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-sm relative z-10" style={{ perspective: 1500 }}>
        <motion.div className="relative" style={{ rotateX, rotateY }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <div className="relative group">
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
              <div className="text-center space-y-1 mb-5">
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                  Create Account
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-xs">
                  Join EduTrack in seconds
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative flex items-center overflow-hidden rounded-lg">
                  <Mail className="absolute left-3 w-4 h-4 text-white/60" />
                  <CardInput type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/50 h-10 pl-10 pr-3" />
                </div>
                <div className="relative flex items-center overflow-hidden rounded-lg">
                  <Lock className="absolute left-3 w-4 h-4 text-white/60" />
                  <CardInput type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/50 h-10 pl-10 pr-3" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRole("student")} className={cn("h-10 rounded-lg border text-sm", role === "student" ? "bg-white text-black" : "border-white/20 text-white/80 bg-white/5 hover:bg-white/10")}>Student</button>
                  <button type="button" onClick={() => setRole("teacher")} className={cn("h-10 rounded-lg border text-sm", role === "teacher" ? "bg-white text-black" : "border-white/20 text-white/80 bg-white/5 hover:bg-white/10")}>Teacher</button>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full relative group/button mt-2">
                  <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                  <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-black/70 border-top-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span key="button-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1 text-sm font-medium">
                          Create Account
                          <ArrowRight className="w-3 h-3" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


