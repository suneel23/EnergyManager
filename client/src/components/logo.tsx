import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center", className)}>
      <svg 
        className={cn(sizeClasses[size], "text-primary-600")} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" 
          stroke="currentColor" 
          strokeWidth="2" 
        />
        <path 
          d="M7 9L12 6L17 9L12 12L7 9Z" 
          fill="currentColor" 
          stroke="currentColor" 
          strokeWidth="0.5" 
        />
        <path 
          d="M7 15L12 12L17 15L12 18L7 15Z" 
          fill="currentColor" 
          stroke="currentColor" 
          strokeWidth="0.5" 
        />
        <path 
          d="M14.5 7.5V16.5" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M9.5 7.5V16.5" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
      </svg>
      
      {showText && (
        <span className={cn("ml-2 font-medium text-primary-800", textSizeClasses[size])}>
          Energy Management System
        </span>
      )}
    </div>
  );
}
