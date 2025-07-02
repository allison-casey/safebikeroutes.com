import { TextField } from "@mui/material";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

interface InputProps<T extends FieldValues> {
  control: Control<T>;
  label?: string;
  fieldName: Path<T>;
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

export const ControlledTextField = <T extends FieldValues>({
  control,
  fieldName,
  label,
  disabled,
  required,
  className,
  multiline,
  rules,
}: InputProps<T>) => {
  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{ ...rules, required: required && "Field is required" }}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => {
        return (
          <TextField
            multiline={multiline}
            error={!!error}
            helperText={!!error && error.message}
            label={label}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={className}
          />
        );
      }}
    />
  );
};
