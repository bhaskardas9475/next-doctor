"use client";

import { Select as AntSelect } from "antd";
import { useState } from "react";

type SelectOption = {
  label: string;
  value: string;
};

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  name,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  name?: string;
}) {
  const [selectedValue, setSelectedValue] = useState(value ?? "");

  return (
    <>
      <AntSelect
        className="antd-select"
        value={selectedValue || undefined}
        placeholder={placeholder}
        options={options}
        onChange={(next) => {
          setSelectedValue(next);
          onValueChange?.(next);
        }}
      />
      {name && <input type="hidden" name={name} value={selectedValue} />}
    </>
  );
}
