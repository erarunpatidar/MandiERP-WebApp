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

export default function AddFarmer({ onFieldsChange }: Props) {
    const dispatch = useAppDispatch();
    const { control, setValue, watch } = useForm();
    const { cities } = useAppSelector(state => state.village);
    const accountName = watch('accountName');
    const accountMobileNo = watch('accountMobileNo');
    const accountCity = watch('accountCity');
    useEffect(() => {
        setValue('accountName', accountName);
        setValue('mobileNo', accountMobileNo);
        setValue('city', accountCity);
        onFieldsChange({ accountName, accountMobileNo, accountCity});
       
    },[accountName, accountMobileNo, onFieldsChange]);

    return (
        <div>
            <AppSelect control={control} items={cities} name="accountCity" label="Village" required={true} />
            <AppTextInput control={control} label='Farmer Name' name='accountName' required={true} defaultValue='' ></AppTextInput>
            <AppTextInput control={control} label='Mobile No' name='accountMobileNo' required={false} defaultValue='' ></AppTextInput> 
        </div>
    )
}