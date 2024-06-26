import { IconButton, InputAdornment, InputProps, TextField } from "@mui/material";
import { type } from "os";
import { Control, useController, UseControllerProps } from "react-hook-form";
import { RootState, useAppSelector } from "../store/configureStore";
import { styled } from '@mui/system';
import { useState } from "react";

// Define your custom styles for TextField
// const CustomTextField = styled(TextField)({
//   '& .MuiInputBase-input': {
//     padding: '8px 8px',
//     // width: '100px',
//   },
  
// });

interface Props extends UseControllerProps {
  
  label: string,
  name: string,
  required: boolean,
  type?: 'text' | 'number',
  readOnly?: boolean,
  value?: number | 'text' | string,
  isEditable?: boolean,
  customOnChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; 
  showCalendarIcon?: boolean
}

export default function AppTextInput(props: Props) {
  const { fieldState, field } = useController({ ...props });

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Check if the value is a valid number greater than 0
    if (props.type === 'number' && !isNaN(Number(inputValue)) && Number(inputValue) <= 0) {
      return; // Ignore the change if the value is less than or equal to 0
    }

    // Call the customOnChange if provided
    if (props.customOnChange) {
      props.customOnChange(event);
    } else {
      field.onChange(event);
    }
  };

  const isEditable = props.isEditable !== false;
  const inputProps: InputProps = {
    readOnly: props.readOnly || !isEditable, // Use the prop value to set readOnly
    style: { cursor: (props.readOnly || !isEditable) ? 'not-allowed' : 'auto' }, // Set cursor style conditionally
  };


  return (
    <TextField
      style={{ padding: '4px'}}
      size='small'
      label={props.label}
      required={props.required}
      type={props.type}
      {...field}
      onChange={handleCustomChange}
      InputProps={inputProps}
      error={!!fieldState?.invalid}
      helperText={fieldState?.error?.message}
    />
  )
}

