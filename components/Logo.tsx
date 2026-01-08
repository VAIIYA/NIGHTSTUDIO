import { Rocket } from "lucide-react";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#9945FF] to-[#14F195] blur-lg opacity-50 rounded-full" />
      <div className="relative bg-background rounded-full p-2 border border-white/10">
        <Rocket className={`text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195] fill-current ${className}`} />
      </div>
      <span className="ml-3 text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
        NIGHTSTUDIO
      </span>
    </div>
  );
}
