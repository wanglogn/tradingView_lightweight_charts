import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

// Empty component
export function Empty({ onClick }: { onClick?: () => void }) {
  // 使用useTheme hook获取主题状态
  const { isDark } = useTheme();
  
  return (
    <div 
      className={cn(
        "flex h-64 items-center justify-center rounded-12 border border-dashed",
        isDark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"
      )} 
      onClick={onClick || (() => toast('Coming soon'))}
    >
      Empty
    </div>
  );
}