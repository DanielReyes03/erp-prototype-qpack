"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import {
  TextField,
  TextArea as HeroTextArea,
  NumberField,
  Select,
  ListBox,
  Label,
  Description,
  FieldError,
  Input,
  Switch,
  DateField,
  Calendar,
  DatePicker,
} from "@heroui/react";
import { cn } from "@/lib/cn";
import { toDateValue, fromDateValue } from "@/lib/date-value";

interface BaseProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function FormTextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  isDisabled,
  className,
  placeholder,
  type = "text",
}: BaseProps<TFieldValues> & { placeholder?: string; type?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          className={cn("flex flex-col gap-1", className)}
          value={(field.value as string) ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isRequired={isRequired}
          isDisabled={isDisabled}
          isInvalid={!!fieldState.error}
          type={type}
        >
          <Label>{label}</Label>
          <Input placeholder={placeholder} />
          {description ? <Description>{description}</Description> : null}
          <FieldError>{fieldState.error?.message}</FieldError>
        </TextField>
      )}
    />
  );
}

export function FormTextArea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  isDisabled,
  className,
  placeholder,
  rows = 3,
}: BaseProps<TFieldValues> & { placeholder?: string; rows?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("flex flex-col gap-1", className)}>
          <Label>
            {label}
            {isRequired ? <span className="text-danger"> *</span> : null}
          </Label>
          <HeroTextArea
            value={(field.value as string) ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            placeholder={placeholder}
            rows={rows}
            disabled={isDisabled}
            fullWidth
          />
          {description ? <Description>{description}</Description> : null}
          {fieldState.error ? (
            <p className="text-xs text-danger">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

export function FormNumberField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  isDisabled,
  className,
  minValue,
  maxValue,
  formatOptions,
}: BaseProps<TFieldValues> & {
  minValue?: number;
  maxValue?: number;
  formatOptions?: Intl.NumberFormatOptions;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <NumberField
          className={cn("flex flex-col gap-1", className)}
          value={field.value as number}
          onChange={(v) => field.onChange(v ?? null)}
          onBlur={field.onBlur}
          isRequired={isRequired}
          isDisabled={isDisabled}
          isInvalid={!!fieldState.error}
          minValue={minValue}
          maxValue={maxValue}
          formatOptions={formatOptions}
        >
          <Label>{label}</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
          {description ? <Description>{description}</Description> : null}
          <FieldError>{fieldState.error?.message}</FieldError>
        </NumberField>
      )}
    />
  );
}

export interface FormSelectOption {
  id: string;
  label: string;
  description?: string;
}

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  isDisabled,
  className,
  options,
  placeholder = "Seleccionar…",
}: BaseProps<TFieldValues> & { options: FormSelectOption[]; placeholder?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select
          className={cn("flex flex-col gap-1", className)}
          placeholder={placeholder}
          value={(field.value as string) ?? null}
          onChange={(key) => field.onChange(key ?? null)}
          isRequired={isRequired}
          isDisabled={isDisabled}
          isInvalid={!!fieldState.error}
        >
          <Label>{label}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {options.map((opt) => (
                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                  <div className="flex flex-col">
                    <Label>{opt.label}</Label>
                    {opt.description ? <Description>{opt.description}</Description> : null}
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
          {description ? <Description>{description}</Description> : null}
          <FieldError>{fieldState.error?.message}</FieldError>
        </Select>
      )}
    />
  );
}

export function FormSwitch<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  isDisabled,
  className,
}: BaseProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Switch
          className={className}
          isSelected={!!field.value}
          onChange={field.onChange}
          isDisabled={isDisabled}
        >
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <div className="flex flex-col">
              <span>{label}</span>
              {description ? (
                <span className="text-xs font-normal text-slate-500">{description}</span>
              ) : null}
            </div>
          </Switch.Content>
        </Switch>
      )}
    />
  );
}

export function FormDatePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  isDisabled,
  className,
}: BaseProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DatePicker
          className={cn("flex flex-col gap-1", className)}
          value={toDateValue(field.value as string)}
          onChange={(v) => field.onChange(fromDateValue(v) ? new Date(fromDateValue(v)!).toISOString() : null)}
          isRequired={isRequired}
          isDisabled={isDisabled}
          isInvalid={!!fieldState.error}
        >
          <Label>{label}</Label>
          <DateField.Group fullWidth>
            <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DatePicker.Popover>
            <Calendar aria-label={label}>
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
              </Calendar.Grid>
            </Calendar>
          </DatePicker.Popover>
          {description ? <Description>{description}</Description> : null}
          <FieldError>{fieldState.error?.message}</FieldError>
        </DatePicker>
      )}
    />
  );
}
