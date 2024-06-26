import { FieldValues, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import api from "../../app/api/api"
import AppTextInput from "../../app/components/AppTextInput";
import { useAppDispatch } from "../../app/store/configureStore";
import { Box, Typography, Grid, Button, TextField, Container, Alert, AlertTitle, Snackbar } from "@mui/material";
import { Unit } from "../../app/models/unit";
import { setUnit } from "./unitSlice";


interface Props {
    unit?: Unit;
    cancelEdit: () => void;
}

function UnitForm({ unit, cancelEdit }: Props) {
    const dispatch = useAppDispatch();
    const { control, reset, handleSubmit, watch, formState: { isSubmitting } } = useForm();
    const [openAlert, setOpenAlert] = useState(false);

    useEffect(() => {
        if (unit) {
            reset(unit);
        }
    }, [unit, reset]);

    async function onSubmit(data: FieldValues) {
        try {
            let response: Unit;
            if (unit) {
                response = await api.Unit.updateUnit(unit.id, data);
            } else {
                response = await api.Unit.createUnit(data);

            }
            dispatch(setUnit(response));
            setOpenAlert(true);
            // cancelEdit();
        } catch (error) {
            console.log(error);
        }
        // e.preventDefault();
        // window.location.reload();
        setTimeout(function () {
            window.location.reload();
        }, 2000);


    }
    return (
        <Container maxWidth="sm" >
            <Typography variant="h4">Unit Details</Typography>
            <form onSubmit={handleSubmit(onSubmit)} style={{ margin: 5, padding: 3 }} >
                <Grid container spacing={2}>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Unit name' name='itemUnit1' required={true} defaultValue='' ></AppTextInput>
                    </Box>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Unit name (Hindi)' name='itemUnit(Hindi)' required={false} defaultValue='' ></AppTextInput>
                    </Box>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Weight Cutting PerUnit' name='weightCuttingPerUnit' required={false} type="number" defaultValue={0} ></AppTextInput>
                    </Box>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Hammali PerUnit' name='hammaliPerUnit' required={false} type="number" defaultValue={0} ></AppTextInput>
                    </Box>
                    <Box mb={2}>
                        <AppTextInput control={control} label='Tulai PerUnit' name='tulaiPerUnit' required={false} type="number" defaultValue={0} ></AppTextInput>
                    </Box>
                    <Box mb={2}>
                        <AppTextInput control={control} label='KhadiKari PerUnit' name='khadiKariPerUnit' required={false} type="number" defaultValue={0}></AppTextInput>
                    </Box>
                    <Box display='flex' justifyContent='flex-end' sx={{ mt: 3, p: 1 }}>
                        <Button onClick={cancelEdit} variant='contained' color='inherit' sx={{ marginRight: 2 }}>Cancel</Button>
                        <LoadingButton loading={isSubmitting} type='submit' variant='contained' color='success'>Submit</LoadingButton>
                    </Box>
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
                </Grid>
            </form>

        </Container>
    )
}

export default UnitForm;


