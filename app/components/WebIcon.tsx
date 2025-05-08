// this component is a wrapper for font awesome icons
// it makes it easy to use icons with consistent styling across the web app

import React from "react";

// props for the icon component
interface WebIconProps {
  name: string; // font awesome icon name
  size?: number; // icon size in pixels
  color?: string; // icon color
  style?: React.CSSProperties; // additional css styles
}

export default function WebIcon({
  name,
  size = 16,
  color = "currentColor",
  style = {},
}: WebIconProps) {
  return (
    <i
      className={`fa fa-${name}`}
      style={{
        fontSize: `${size}px`,
        color,
        display: "inline-block",
        ...style,
      }}
    />
  );
}
