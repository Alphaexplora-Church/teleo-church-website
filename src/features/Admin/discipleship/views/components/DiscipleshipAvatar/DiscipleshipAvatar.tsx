import { useState } from "react";
import { User } from "lucide-react";
import {
  type DiscipleshipAvatarSize,
  avatarBaseContainerStyle,
  avatarFallbackStyle,
  avatarIconSizes,
  avatarSizeStyles,
} from "./discipleshipAvatar.styles";

export type { DiscipleshipAvatarSize };

export interface DiscipleshipAvatarProps {
  src?: string | null;
  alt: string;
  size?: DiscipleshipAvatarSize;
  className?: string;
}

export function DiscipleshipAvatar({
  src,
  alt,
  size = "sm",
  className = "",
}: DiscipleshipAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const containerSize = avatarSizeStyles[size] || avatarSizeStyles.sm;
  const iconSize = avatarIconSizes[size] || avatarIconSizes.sm;

  const hasValidImage = Boolean(src && src.trim() && !imgError);

  return (
    <div
      className={`${avatarBaseContainerStyle} ${containerSize} ${className}`.trim()}
    >
      {hasValidImage ? (
        <img
          src={src!}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={avatarFallbackStyle}>
          <User className={iconSize} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default DiscipleshipAvatar;

