"use client";

import { Input as AntInput } from "antd";
import type { ComponentProps } from "react";

export function Input({ className = "", ...props }: ComponentProps<typeof AntInput>) {
  return <AntInput className={`input ${className}`} {...props} />;
}
