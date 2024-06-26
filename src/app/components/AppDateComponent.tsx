import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Box, InputAdornment } from '@mui/material';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { Controller, UseControllerProps, useController } from 'react-hook-form';
import { format } from 'date-fns';
import { style } from '@mui/system';

interface Props extends UseControllerProps {
    label: string,
    name: string,
    required: boolean,
    type?: 'text' | 'number',
    readOnly?: boolean,
    value?: number | 'text' | string,
    isEditable?: boolean,
}

export default function AppDateComponent(props: Props) {
    const { fieldState, field } = useController({ ...props });
    const [startDate, setStartDate] = useState<Date | null>(new Date());


    return (
   
        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            >
            <MobileDatePicker
                {...field}
                label={props.label}
                value={startDate}
                onChange = {(date) => {
                    console.log("date:", date);
                    field.onChange(date);

                }}
                slotProps={{
                    textField: {
                        style: {padding: '4x', marginTop: '4px'},
                        size: 'small',
                        InputProps: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CalendarTodayIcon />
                                </InputAdornment>
                            ),
                        },
                    },
                }}
            />
        </LocalizationProvider>
    )
}