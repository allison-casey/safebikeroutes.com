import { MenuItem, Select } from "@mui/material";
import {
  type Control,
  Controller,
  type FieldPathValue,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

interface InputProps<T extends FieldValues> {
  control: Control<T>;
  fieldName: Path<T>;
  options: { label: string; value: FieldPathValue<T, Path<T>> }[];
  label?: string;
  error?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  multiline?: boolean;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
}

export const ControlledSelectField = <T extends FieldValues>({
  control,
  fieldName,
  label,
  disabled,
  required,
  className,
  rules,
  options,
}: InputProps<T>) => {
  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{ ...rules, required: required && "Field is required" }}
      render={({ field: { onChange, value } }) => (
        <Select
          disabled={disabled}
          className={className}
          label={label}
          onChange={onChange}
          value={value}
          fullWidth
        >
          {options.map((option) => (
            <MenuItem value={value} key={value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
  );
};
