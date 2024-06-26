import { FieldValues, useForm } from "react-hook-form";
import { Village } from "../../app/models/village";
import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import api from "../../app/api/api"
import AppTextInput from "../../app/components/AppTextInput";
import { useAppDispatch } from "../../app/store/configureStore";
import { setVillage } from "./villageSlice";
import { Box, Typography, Grid, Button, TextField, Container, Alert, AlertTitle, Snackbar } from "@mui/material";


interface Props {
    village?: Village;
    cancelEdit: () => void;
}

function VillageForm({ village, cancelEdit }: Props) {
    const dispatch = useAppDispatch();
    // const [formData, setFormData] = useState<Village>();
    const { control, reset, handleSubmit, watch, formState: { isSubmitting } } = useForm();
    const [openAlert, setOpenAlert] = useState(false);
    useEffect(() => {
        if (village) {
            console.log("village:", village);
            reset(village);
            // console.log("data:", villages);
        }
        // api.Village.getVillage()
        //     .then(formData => setFormData(formData.data))
        //     .catch(error => console.log(error))
    }, [village, reset]);

    async function onSubmit(data: FieldValues) {
        try {
            let response: Village;
            if (village) {
                response = await api.Village.updateVillage(village.id, data);
            } else {
                response = await api.Village.createVillage(data);

            }
            dispatch(setVillage(response));
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
            <Typography variant="h4">Village Details</Typography>
            <form onSubmit={handleSubmit(onSubmit)} style={{ margin: 5, padding: 3 }} >
                <Grid container spacing={2}>
                    <Box  mb={2}>
                        <AppTextInput control={control} label='Village name' name='villageName' required={true} defaultValue='' ></AppTextInput>
                    </Box>
                    <Box  mb={2}>
                        <AppTextInput control={control} label='village Name(Hindi)' name='villageNameHindi' required={false} defaultValue='' ></AppTextInput>
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

export default VillageForm;


