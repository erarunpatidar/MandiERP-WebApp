import { FieldValues, useForm } from "react-hook-form";
import AppTextInput from "../../app/components/AppTextInput";
import { useState, useEffect } from "react";
import AppSelectList from "../../app/components/AppSelectList";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import api from "../../app/api/api";
import { fetchVillagesAsync } from "../village/villageSlice";

type CustomFields = Record<string, any>;

interface Props {
    onFieldsChange: (fields: CustomFields) => void;
}

export default function AddPurchaser({ onFieldsChange }: Props) {
    const dispatch = useAppDispatch();
    const { control, setValue, watch } = useForm();
    const { cities } = useAppSelector(state => state.village);
    const accountSortName = watch('accountSortName');
    const accountFirmName = watch('accountFirmName');
    const accountCity = watch('accountCity');
    const accountMobileNo = watch('accountMobileNo');
    useEffect(() => {
        setValue('accountSortName', accountSortName);
        setValue('accountFirmName', accountFirmName);
        setValue('accountCity', accountCity);
        setValue('accountMobileNo', accountMobileNo);
        onFieldsChange({accountSortName, accountFirmName, accountCity, accountMobileNo});
       
    },[onFieldsChange]);

    const addVillage = (data: {customFields: CustomFields }) => {
        console.log("newItem: ",data);
        const response = api.Village.createVillage({villageName: data.customFields.villageName});
        dispatch(fetchVillagesAsync());
        
    };

    return (
        <div>
            <AppTextInput control={control} label='Short Name' name='accountSortName' required={true} defaultValue='' ></AppTextInput>
            <AppTextInput control={control} label='Firm Name' name='accountFirmName' required={false} defaultValue='' ></AppTextInput> 
            <AppTextInput control={control} label='Party Name' name='party name' required={false} defaultValue='' ></AppTextInput> 
            <AppSelectList control={control} items={cities} label='City' name='accountCity' required={false} addItem={addVillage}  />
            <AppTextInput control={control} label='Mobile No' name='accountMobileNo' required={false} defaultValue='' ></AppTextInput> 
        </div>
    )
}