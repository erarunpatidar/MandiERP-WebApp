import { FieldValues, useForm } from "react-hook-form";
import AppTextInput from "../../app/components/AppTextInput";
import { useState, useEffect } from "react";
type CustomFields = Record<string, any>;

interface Props {
    onFieldsChange: (fields: CustomFields) => void;
}

export default function AddVillage({ onFieldsChange }: Props) {
    const { control, setValue, watch } = useForm();
    const villageName = watch('villageName');

    useEffect(() => {
        setValue('villageName',villageName);
        onFieldsChange({ villageName});
    },[villageName, onFieldsChange]);

    return (
        <div>
            <AppTextInput  control={control} name="villageName" label="Village" required={true} defaultValue=''  />
        </div>
    )
}