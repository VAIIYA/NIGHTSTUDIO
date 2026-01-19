import Image from "next/image";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className="relative flex items-center">
      <div className="relative">
        <Image
          src="/logo.jpg"
          alt="NightStudio Logo"
          width={32}
          height={32}
          className={`${className} rounded-lg`}
        />
      </div>
      <span className="ml-3 text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
        NIGHTSTUDIO
      </span>
    </div>
  );
}
