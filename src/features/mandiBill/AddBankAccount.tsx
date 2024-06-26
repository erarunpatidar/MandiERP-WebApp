import { FieldValues, useForm } from "react-hook-form";
import AppTextInput from "../../app/components/AppTextInput";
import { useState, useEffect } from "react";

type CustomFields = Record<string, any>;

interface Props {
    onFieldsChange: (fields: CustomFields) => void;
}

export default function AddBankAccount({ onFieldsChange }: Props) {
    const { control, setValue, watch } = useForm();
    const branchName = watch('branchName');
    const ifscCode = watch('ifscCode');
    const bankAccountNo = watch('bankAccountNo');
    const accountHolderName = watch('accountHolderName');
    useEffect(() => {
        setValue('branchName', branchName);
        setValue('ifscCode', ifscCode);
        setValue('bankAccountNo', bankAccountNo);
        setValue('accountHolderName', accountHolderName);
        onFieldsChange({branchName, ifscCode, bankAccountNo, accountHolderName});
       
    },[onFieldsChange]);

    return (
        <div>
            <AppTextInput control={control} label='Bank Name' name='branchName' required={true} defaultValue='' ></AppTextInput>
            <AppTextInput control={control} label='IFSC Code' name='ifscCode' required={false} defaultValue='' ></AppTextInput> 
            <AppTextInput control={control} label='Account No' name='bankAccountNo' required={false} defaultValue='' ></AppTextInput> 
            <AppTextInput control={control} label='Account Holder Name' name='accountHolderName' required={false} defaultValue='' ></AppTextInput> 
        </div>
    )
}