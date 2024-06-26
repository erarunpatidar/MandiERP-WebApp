import { FieldValues, useForm } from "react-hook-form";
import { Item } from "../../app/models/item";
import { useAppDispatch } from "../../app/store/configureStore";
import { useEffect, useState } from "react";
import api from "../../app/api/api";
import { setItem } from "./itemSlice";
import { LoadingButton, getDateRangePickerDayUtilityClass } from "@mui/lab";
import { Container, Typography, Box, Button, Alert, Snackbar, Grid } from "@mui/material";
import AppTextInput from "../../app/components/AppTextInput";

interface Props {
    item?: Item;
    cancelEdit: () => void;
}

export default function ItemForm({ item, cancelEdit }: Props) {
    const dispatch = useAppDispatch();
    const { control, reset, handleSubmit, watch, formState: { isSubmitting, isSubmitSuccessful } } = useForm();

    const [openAlert, setOpenAlert] = useState(false);

    useEffect(() => {
        if (item) {
            // console.log("village:", item);
            reset(item);
        }
    }, [item, reset]);

    async function onSubmit(data: FieldValues) {

        try {
            let response: Item;
            if (item) {
                // response = await api.Item.updateItem(item.itemTypeId, data);
                response = await api.Item.updateItem(item.id, data);
                console.log("onSubmit res: ", response);
            } else {
                response = await api.Item.createItem(data);
                console.log("onSubmit res: ", response);

            }
            dispatch(setItem(response));
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
        <Container maxWidth="sm" >
            <Typography variant="h4">Item Details</Typography>
            <form onSubmit={handleSubmit(onSubmit)} style={{ margin: 5, padding: 3 }} >
                <Grid container spacing={2}>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Item Name' name='itemName' required={true} defaultValue='' ></AppTextInput>
                    </Box>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Item Name (Hindi)' name='itemNameHindi' required={false} defaultValue='' ></AppTextInput>
                    </Box>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Rate of Unit (kg)' name='rateOfUnitinKgs' required={true} type="number" defaultValue={0} ></AppTextInput>
                    </Box>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Commission (%)' name='percentComission' required={true} type="number" defaultValue={0} ></AppTextInput>
                    </Box>
                    <Box display='flex' justifyContent='flex-end' sx={{ mt: 3, p: 1 }}>
                        <Button onClick={cancelEdit} variant='contained' color='inherit' sx={{ marginRight: 2 }}>Cancel</Button>
                        <LoadingButton loading={isSubmitting} type='submit' variant='contained' color='success'>Submit</LoadingButton>
                    </Box>
                    {/* {isSubmitSuccessful && (
                    <Alert variant="filled" severity="success" >
                        Item added succesfully!
                    </Alert>
                )} */}
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