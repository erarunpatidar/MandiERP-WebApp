import { FieldValues, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { LoadingButton, getDateRangePickerDayUtilityClass } from "@mui/lab";
import { Container, Typography, Box, Button, Alert, Snackbar, Select, Grid } from "@mui/material";
import AppTextInput from "../../app/components/AppTextInput";
import { setAccount } from "./accountSlice";
import { Account } from "../../app/models/account";
import AppSelectList from "../../app/components/AppSelectList";
import { fetchVillagesAsync, setVillage } from "../village/villageSlice";
import AppSelect from "../../app/components/AppSelect";

type CustomFields = Record<string, any>;

interface Props {
    account?: Account;
    cancelEdit: () => void;
}

export default function AccountForm({ account, cancelEdit }: Props) {
    const dispatch = useAppDispatch();
    const { control, reset, handleSubmit, watch, formState: { isSubmitting, isSubmitSuccessful } } = useForm();

    const [openAlert, setOpenAlert] = useState(false);
    const { cities, villageLoaded } = useAppSelector(state => state.village);
    const { accountTypes } = useAppSelector(state => state.account);

    useEffect(() => {
        if (account) {
            reset(account);
        }
        dispatch(fetchVillagesAsync());
    }, [account, reset]);

    const addVillage = (data: {customFields: CustomFields }) => {
        console.log("newItem: ",data);
        const response = api.Village.createVillage({villageName: data.customFields.villageName});
        // dispatch(setVillage(response));
        dispatch(fetchVillagesAsync());
        
    };

    async function onSubmit(data: FieldValues) {
        console.log("formdata:", data);
        try {
            let response: Account;
            if (account) {
                // response = await api.Item.updateItem(item.itemTypeId, data);
                response = await api.Account.updateAccount(account.id, data);
                console.log("onSubmit res: ", response);
            } else {
                response = await api.Account.createAccount(data);
                console.log("onSubmit res: ", response);

            }
            dispatch(setAccount(response));
            setOpenAlert(true);
            setTimeout(function () {
                window.location.reload();
            }, 2000);
            // cancelEdit();
        } catch (error) {
            console.log(error);
        }

        // cancelEdit();

    }

    return (
        <Container maxWidth="sm"  >
            <Typography variant="h4">Create Account</Typography>
            <form onSubmit={handleSubmit(onSubmit)}  >
                <Grid container spacing={2}>
                    <AppSelectList control={control} items={cities} name="accountCity" label="City Name" required={true} addItem={addVillage} isLoadingItems = {villageLoaded}/>
                    <AppTextInput  control={control} label='Account Name' name='accountName' required={true} defaultValue='' ></AppTextInput>
                    <AppTextInput control={control} label='Account Name (Hindi)' name='accountNameHindi' required={false} defaultValue='' ></AppTextInput>
                    <AppSelect control={control} items={accountTypes} label='Account Type' name='accountType' required = {true} defaultValue='' />
                    <AppTextInput control={control} label='Firm Name' name='accountFirmName' required={true} defaultValue='' ></AppTextInput>
                    <AppTextInput control={control} label='Firm Name (Hindi)' name='accountFirmName(Hindi)' required={false}  defaultValue=''></AppTextInput>
                    <AppTextInput control={control} label='Account Sort Name' name='accountSortName' required={false} defaultValue='' ></AppTextInput>
                    <AppTextInput control={control} label='Email Id' name='emailId' required={true} defaultValue='' ></AppTextInput>
                    <AppTextInput control={control} label='Mobile No' name='accountMobileNo' required={true} defaultValue='' ></AppTextInput>
                    <AppTextInput control={control} label='Address1' name='accountAddress1' required={true} defaultValue='' ></AppTextInput>
                    <AppTextInput control={control} label='Address2' name='accountAddress2' required={false}  defaultValue=''></AppTextInput>
                    <AppTextInput control={control} label='License No' name='licenceNo' required={false} defaultValue='' ></AppTextInput>
                    <Box display='flex' justifyContent='flex-end' sx={{ mt: 3, p: 1 }}>
                        <Button onClick={cancelEdit} variant='contained' color='inherit' sx={{ marginRight: 2 }}>Cancel</Button>
                        <LoadingButton  loading={isSubmitting} type='submit' variant='contained' color='success'>Submit</LoadingButton>
                    </Box>
                </Grid>
            </form>

            {/* Snackbar to show the alert */}
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={openAlert}
                autoHideDuration={3000} // Adjust the duration as needed
                onClose={() => setOpenAlert(false)}
                message="Form submitted successfully."
            />

        </Container>
    )
}