"use client";

import { Button as AntButton } from "antd";
import type { ComponentProps } from "react";

export function Button({ className = "", ...props }: ComponentProps<typeof AntButton>) {
  return <AntButton className={`base-button ${className}`} {...props} />;
}
