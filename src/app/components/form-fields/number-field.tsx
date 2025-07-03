import { TextField } from "@mui/material";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { NumericFormat } from "react-number-format";

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

export const ControlledNumberField = <T extends FieldValues>({
  control,
  fieldName,
  label,
  disabled,
  required,
  rules,
}: InputProps<T>) => {
  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{
        ...rules,
        required: required && "Field is required",
      }}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        return (
          <NumericFormat
            size="small"
            error={!!error}
            helperText={!!error && error.message}
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(+event.target.value)}
            customInput={TextField}
            valueIsNumericString
            variant="standard"
            label={label}
          />
        );
      }}
    />
  );
};
