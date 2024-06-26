import { FieldValues, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import api from "../../app/api/api";
import { fetchGadiMastersAsync, setGadiMasters } from "./billSlice";
import AppTextInput from "../../app/components/AppTextInput";
import { Button, Grid, TextField } from "@mui/material";
import AppSelectList from "../../app/components/AppSelectList";
import AppSelect from "../../app/components/AppSelect";
import { useState, useEffect } from "react";
type CustomFields = Record<string, any>;

interface Props {
    onFieldsChange: (fields: CustomFields) => void;
}

export default function AddGadiMasters({ onFieldsChange }: Props) {
    const dispatch = useAppDispatch();
    const { control, reset,setValue, handleSubmit, watch, formState: { isSubmitting, isSubmitSuccessful } } = useForm();
    const { cities } = useAppSelector(state => state.village);
    const gadiNo = watch('gadiNo');
    const mobileNo = watch('mobileNo');
    const city = watch('city');
    useEffect(() => {
        setValue('gadiNo', gadiNo);
        setValue('mobileNo', mobileNo);
        setValue('city', city);
        onFieldsChange({ gadiNo, mobileNo, city});
       
    },[gadiNo, mobileNo, onFieldsChange]);

    return (
        <div>
            <AppSelect control={control} items={cities} name="city" label="Village" required={true} defaultValue=''   />
            <AppTextInput control={control} label='Gadi No' name='gadiNo' required={true} defaultValue='' ></AppTextInput>
            <AppTextInput control={control} label='Mobile No' name='mobileNo' required={false} defaultValue='' ></AppTextInput> 
        </div>
    )
}