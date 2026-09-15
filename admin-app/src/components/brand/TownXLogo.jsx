import { cn } from "@/utils/cn";
import townXLogo from "@/assets/town-x-logo.png";

export const APP_NAME = "TOWN-X";

export function TownXLogo({ size = 40, variant = "full", className }) {
  const dimension = variant === "mark" ? size : undefined;

  return (
    <img
      src={townXLogo}
      alt={APP_NAME}
      className={cn("shrink-0 object-contain", className)}
      style={{
        height: size,
        width: dimension ?? "auto",
        maxWidth: variant === "full" ? size * 1.35 : dimension,
      }}
      draggable={false}
    />
  );
}
