import { Control, Controller, FieldValues, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { LoadingButton } from "@mui/lab";
import { Box, Button, Checkbox, FormControlLabel, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import AppSelect from "../../app/components/AppSelect";
import AppTextInput from "../../app/components/AppTextInput";
import { ChangeEvent, useEffect, useState } from "react";
import { fetchItemsAsync } from "../item/itemSlice";
import { fetchUnitsAsync,  updateHammaliAndTulai } from "../unit/unitSlice";
import { removeBillDetail, setBillDetail, setBillDetailId, setLatestId, updateWeightCutting } from "./billSlice";
import api from "../../app/api/api";
import { Delete } from "@mui/icons-material";
import { CustomTable } from "./styles";
import { Container } from "@mui/system";

interface Props {
    onSubmit: () => void;
    onBillDetailDelete: (id: number) => void;
    isEditable: boolean;
    isHTVisible: boolean,
}

export default function BillDetails({ onSubmit, onBillDetailDelete, isEditable, isHTVisible }: Props) {
    const dispatch = useAppDispatch();
    const { control, setValue, reset, handleSubmit, watch, formState: { isSubmitting } } = useForm();
    const { itemList, allItems, percentComission, itemLoaded } = useAppSelector(state => state.item);
    const { unitList, weightCutting, tulai, hammali, unitLoaded, hammaliBillDetail, tulaiBillDetail, weightCuttingBillDetail } = useAppSelector(state => state.unit);
    const { totalWeightCutting, quantity } = useAppSelector(state => state.billDetail);
    const { billId } = useAppSelector(state => state.bill);
    const [tableData, setTableData] = useState<FieldValues[]>([]);
    const quantityValue = watch('quantity');
    const HTValue = watch('H+T');

    useEffect(() => {
        dispatch(fetchItemsAsync());
        dispatch(fetchUnitsAsync());

        dispatch(updateWeightCutting({ totalWeightCutting: weightCutting, quantity: parseInt(quantityValue) }));
        setValue('totalWeightCutting', totalWeightCutting);
      
        if(HTValue === 'No'){
            dispatch( updateHammaliAndTulai({hammali:0, tulai:0, weightCutting:0}));
        }
        else{
            dispatch( updateHammaliAndTulai({hammali: hammaliBillDetail, tulai:tulaiBillDetail, weightCutting: weightCuttingBillDetail}));
            // console.log("ham if yes", hammali);
        }
        

    }, [weightCutting, totalWeightCutting, quantity, quantityValue, hammali, HTValue, hammaliBillDetail])

    async function handleFormSubmit(data: FieldValues) {
        const billDetailData = {
            ...data,
            fkBillId: billId,
            quantity: parseInt(data.quantity)
        }
        try {
            const billDetailResponse = await api.BillDetail.createBillDetail(billDetailData);
            dispatch(setBillDetail(billDetailResponse));
            dispatch(setLatestId(billDetailResponse.id));
            dispatch(setBillDetailId(billDetailResponse.id));
            setTableData((prevData) => [...prevData, { ...data, id: billDetailResponse.id }]);
            // reset();
            onSubmit();
            // reset();
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleDelete = (id: number) => {
        if (tableData.length > 0) {
            const lastRecordId = tableData[tableData.length - 1].id;

            if (id === lastRecordId) {
                // onBillDetailDelete(id);
                api.BillDetail.deleteBillDetails(lastRecordId)
                    .then(() => {
                        dispatch(removeBillDetail(lastRecordId));
                        const updatedTableData = tableData.slice(0, -1); // Remove the last record
                        setTableData(updatedTableData);
                        // console.log("delete id in billDetail: ", id);
                        onBillDetailDelete(id); // Notify ManageMandiBill component about the deleted record
                    })
                    .catch((error) => console.error('Error deleting data:', error));
            } else {
                alert('You can only delete the last record.');
            }
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(handleFormSubmit)}>

                <Grid container spacing={1} style={{ border: "1px solid #e0e0e0", }}>
                    <Grid container item xs={12} spacing={1}>
                        <Grid item sm={6}>
                            <AppSelect control={control} items={itemList} label='Item' name='itemName' required={true} defaultValue='' isEditable={isEditable} isLoadingItems={itemLoaded} />
                        </Grid>
                        <Grid item sm={6}>
                            <AppTextInput control={control} label='Quantity' name='quantity' required={false} type="number" defaultValue={0} isEditable={isEditable} ></AppTextInput>
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} spacing={1}>
                        <Grid item sm={6}>
                            <AppSelect control={control} items={unitList} label='Unit' name='itemUnit' required={true} defaultValue='' isEditable={isEditable} isLoadingItems={unitLoaded} />
                        </Grid>
                        <Grid item sm={6}>
                            <AppTextInput control={control} label='Marca' name='itemMarca' required={false} type="number" isEditable={isEditable} ></AppTextInput>
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} spacing={1} >
                        <Grid item sm={6} >
                            {/* <Controller name="totalWeightCutting" control={control} defaultValue={totalWeightCutting} render={({ field }) => ( */}
                            <Typography style={{fontSize:'14px'}}>Weight Ded = {totalWeightCutting}</Typography>
                        </Grid>
                        <Grid item sm={3}>
                            <Typography style={{fontSize:'14px'}}>Tulai = {tulai} </Typography>
                        </Grid>
                        <Grid item sm={3}>
                            <Box display="flex" justifyContent="space-between">
                                <Button size="small" type="submit" variant="contained" color="info" disabled={!isEditable}> Add </Button></Box>
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} alignItems="center" spacing={1}>
                        <Grid item sm={4}>
                            <Typography style={{fontSize:'14px'}}>Hamali = {hammali} </Typography>
                        </Grid>
                        <Grid item sm={4}>
                            <Typography style={{fontSize:'14px'}}>comm = {percentComission} </Typography>
                        </Grid>
                        {isHTVisible && (
                        <Grid item sm={4}>
                            <AppSelect control={control} label="H+T" items={["Yes", "No"]} defaultValue='Yes' required={false} name="H+T"/>
                            {/* <FormControlLabel control={<Checkbox checked={isChecked} onChange={handleCheckboxChange} />} label="H+T" /> */}
                        </Grid>
                        )}
                    </Grid>

                </Grid>

            </form>
            {/* Render the table with tableData */}
            <TableContainer style={{ backgroundColor: 'lightgrey', border: '1px solid #000', height: '180px', marginBottom:'4px' }}>
                <CustomTable >
                    <TableHead style={{backgroundColor: 'white'}}>
                        <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Marca</TableCell>
                            <TableCell>Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((rowData) => (
                            <TableRow key={rowData.id}>
                                <TableCell>{rowData.itemName}</TableCell>
                                <TableCell>{rowData.quantity}</TableCell>
                                <TableCell>{rowData.itemUnit}</TableCell>
                                <TableCell>{rowData.itemMarca}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleDelete(rowData.id)} startIcon={<Delete />} color='error' />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </CustomTable>
            </TableContainer>
        </>

    )
}