import React, { useState, useEffect } from 'react';

const iconCache = new Map<string, string>();

interface Props {
  path: string | null;
  isDir: boolean;
  name?: string;
  size?: number;
  iconPath?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

export function SystemIcon({ path: filePath, isDir, name, size = 20, iconPath, className, style }: Props) {
  const [src, setSrc] = useState<string | null>(() => {
    if (iconPath) return iconPath;
    if (filePath && iconCache.has(filePath)) return iconCache.get(filePath)!;
    return null;
  });

  useEffect(() => {
    if (iconPath) {
      setSrc(iconPath);
      if (filePath) iconCache.set(filePath, iconPath);
      return;
    }
    if (!filePath) { setSrc(null); return; }
    if (iconCache.has(filePath)) {
      setSrc(iconCache.get(filePath)!);
      return;
    }

    let cancelled = false;
    window.api.resolveIcon(filePath, isDir).then(icon => {
      if (cancelled) return;
      if (icon) {
        iconCache.set(filePath, icon);
        setSrc(icon);
      }
    });
    return () => { cancelled = true; };
  }, [filePath, isDir, iconPath]);

  if (!src) {
    return (
      <span style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.8, flexShrink: 0, ...style }} className={className}>
        {isDir ? '📁' : '📄'}
      </span>
    );
  }

  return (
    <img
      src={`file://${src}`}
      width={size}
      height={size}
      className={`icon-img ${className || ''}`}
      style={{ ...style, width: size, height: size }}
      draggable={false}
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}
