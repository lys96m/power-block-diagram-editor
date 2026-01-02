import { useEffect, useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

type Props = Omit<TextFieldProps, "value" | "onChange"> & {
  value: string | number | null | undefined;
  onCommit: (value: string) => void;
  delay?: number;
};

/**
 * Controlled TextField that debounces outbound change notifications.
 * The input value updates immediately while parent updates are throttled.
 */
const DebouncedTextField = ({ value, onCommit, delay = 300, ...rest }: Props) => {
  const stringValue = useMemo(() => (value ?? "").toString(), [value]);
  const [localValue, setLocalValue] = useState(stringValue);

  useEffect(() => {
    setLocalValue(stringValue);
  }, [stringValue]);

  useEffect(() => {
    if (localValue === stringValue) return;
    const handle = setTimeout(() => {
      onCommit(localValue);
    }, delay);
    return () => clearTimeout(handle);
  }, [localValue, stringValue, delay, onCommit]);

  return (
    <TextField
      {...rest}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onCommit(localValue)}
    />
  );
};

export default DebouncedTextField;
