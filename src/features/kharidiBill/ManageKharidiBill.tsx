import { Button, Grid, TextField, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import AppTextInput from "../../app/components/AppTextInput";
import AppDateComponent from "../../app/components/AppDateComponent";
import { FieldValues, FormProvider, Resolver, useForm, useFormState } from "react-hook-form";
import { format } from "date-fns";
import AppSelectList from "../../app/components/AppSelectList";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import AppSelect from "../../app/components/AppSelect";
import { fetchVillagesAsync } from "../village/villageSlice";
import api from "../../app/api/api";
import { fetchAccountsAsync } from "../account/accountSlice";
import BillDetails from "../mandiBill/BillDetails";
import ItemSaleDetails from "../mandiBill/ItemSaleDetails";
import { useEffect, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { fetchBillsAsync, setBill, setBillDetail, setDeletedBillDetailId } from "../mandiBill/billSlice";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Bill } from "../../app/models/bill";
import CustomDialog from "../../app/components/CustomDialog";

type CustomFields = Record<string, any>;

export default function ManageKharidiBill() {

    const dispatch = useAppDispatch();

    const { register, control, handleSubmit, watch, setValue, getValues,trigger, reset, formState:{isSubmitSuccessful, errors, isValid} } = useForm({
        mode: 'onTouched'
    });

    const formRef = useRef<HTMLFormElement>(null);

    const villages = useAppSelector(state => state.village.cities);
    const { selectedVillageId, villageLoaded } = useAppSelector(state => state.village);
    const { allAccounts, accountLoaded, selectedPurchaserId } = useAppSelector(state => state.account);
    const { totalQuantity, totalAmount, netAmount, commissionAmount, totalWeight,
        totalNetWeight, billId, billNo, billLoaded } = useAppSelector(state => state.bill);

    const { latestId, deletedBillDetailId, billDetailId, quantity, billGrossWeight, billNetWeight, billDetailcommissionAmount, actualTotalAmount, billRate, totalItemSaleQty, totalWeightCutting } = useAppSelector(state => state.billDetail);
    const { hammali, tulai } = useAppSelector(state => state.unit);
    const [isBillDetailFilled, setIsBillDetailFilled] = useState(false);
    const [isItemSaleDetailFilled, setIsItemSaleDetailFilled] = useState(false);

    const [isBillDetailsValid, setIsBillDetailsValid] = useState(false);
    const [isItemSaleDetailsValid, setIsItemSaleDetailsValid] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    // purchaser list
    const clients = allAccounts.filter((account) => account.fkAccountTypeId === 24);
    const clientNames = [...new Set(clients.map((client) => client.accountFirmName))];

    const currentDate = format(new Date(), 'MM-dd-yyyy');

    const formData = getValues();

    useEffect(() => {
        if (!billLoaded) {
            dispatch(fetchBillsAsync());
            // console.log("data:", bills)
        }
        dispatch(fetchVillagesAsync());
        dispatch(fetchAccountsAsync());
        // console.log("TQt:", totalQuantity);
        setValue('billNo', billNo);
        setValue('totalQuantity', totalQuantity);
        setValue('totalAmount', totalAmount);
        setValue('billTotalAmount', totalAmount + commissionAmount);
        setValue('actualTotalAmount', totalAmount);
        setValue('billGrossWeight', totalWeight);
        setValue('billNetWeight', totalNetWeight);
        setValue('commissionAmount', commissionAmount);

        //call updateBillDetails when ItemSaleDetail is submitted
        if (isItemSaleDetailFilled) {
            console.log("updateBillDetails is called");
            updateBillDetails();
        }
    }, [dispatch, totalQuantity, totalAmount, totalWeight, billNo])

    const addVillage = (data: { customFields: CustomFields }) => {
        console.log("newItem: ", data);
        const response = api.Village.createVillage({ villageName: data.customFields.villageName });
        // dispatch(setVillage(response));
        dispatch(fetchVillagesAsync());

    };

    const addPurchaser = (data: { customFields: CustomFields }) => {
        const accountSortName = data.customFields.accountFirmName;
        const accountFirmName = data.customFields.accountFirmName;
        const accountMobileNo = data.customFields.accountMobileNo;
        const accountCity = data.customFields.accountCity;

        const response = api.Account.createAccount({ accountName: accountFirmName, accountMobileNo: accountMobileNo, accountCity: accountCity, fkVillageId: selectedVillageId, fkAccountTypeId: 24, accountFirmName: accountFirmName, accountSortName: accountSortName });
        dispatch(fetchAccountsAsync());

    };

    //Submit Bill Data
    const onSubmit = async (data: FieldValues) => {
        if(data.villageName === ''){
            // alert("Select Village");
            setDialogMessage("Select Village");
            setIsDialogOpen(true);
            return
        }
        else if(data.fkAccount ===''){
            // alert("select purchaser");
            setDialogMessage("Select Purchaser");
            setIsDialogOpen(true);
            return
        }
        else if(!isBillDetailsValid || !isItemSaleDetailsValid){
            // alert("please fill Item and Purchaser details");
            setDialogMessage("Fill Item and Purchaser Details");
            setIsDialogOpen(true);
            return
        }
        else {
            console.log("data.billdate: ", data.billDate);

            //get billDetailData 
            const response = await api.BillDetail.getBillDetail();
            // console.log("billDetailData in func:", response);
            const billDetails = response.data;
            const updatedBillDetailData = [];

            for (const item of billDetails) {
                if (item.fkBillId === billId) {
                    console.log("item.fkBillDetailId", item.fkBillDetailId);
                    console.log("item: ", item);
                    updatedBillDetailData.push(item);

                }
            }

            const billFormData = {
                billNo: billNo,
                billId: billId,
                billDate: data.billDate,
                fkAccountId: selectedPurchaserId,
                isCompanyAccount: 1,
                villageName: data.villageName,
                // billRsvrPersonName: data.billRsvrPersonName,
                totalQuantity: data.totalQuantity,
                totalHammali: hammali * totalQuantity,
                totalTulai: tulai * totalQuantity,
                totalStationary: 0,
                totalDeduction: 0,
                totalAmount: data.totalAmount,
                netAmount: data.totalAmount,
                billDetails: updatedBillDetailData
            };

            try {
                console.log("billform:", billFormData);
                const billResponse = await api.Bill.createBill(billFormData);
                dispatch(setBill(billResponse));
                // reset();
            } catch (error) {
                console.log(error);
            }
            alert("bill saved");
        }
        // window.location.reload();
    };

    const handleButtonClick = () => {
        console.log("buttonClick1")
        if (formRef.current) {
            const submitEvent = new Event("submit", { cancelable: true });
            formRef.current.dispatchEvent(submitEvent);

            if (!submitEvent.defaultPrevented) {
                console.log("buttonClick2")
                // If the default action was not prevented (e.g., by validation errors), manually call onSubmit
                handleSubmit(onSubmit)();  // Manually call the submit function
            }
        }
        handleSubmit(onSubmit)();
    };

    //reset form
    const resetForm = () => {
        reset();
        // Reset other component states
    }

    function onSubmitBillDetailForm() {
        setIsBillDetailFilled(true);
        setIsBillDetailsValid(true);
    }

    //updateBillDetails when ItemSaleDetail is submitted
    async function updateBillDetails() {
        // console.log("qty,bGW, nWt, cAmt, tAmt in func: ", quantity, billGrossWeight, billNetWeight, billDetailcommissionAmount, actualTotalAmount);
        const billDetailData = {
            actualRate: billRate,
            billRate: billRate,
            totalWeightCutting: totalWeightCutting * totalItemSaleQty,
            totalHammali: hammali * totalItemSaleQty, //added from Bill ?
            totalTulai: tulai * totalItemSaleQty,
            billGrossWeight: billGrossWeight,
            billNetWeight: billNetWeight,
            commissionAmount: billDetailcommissionAmount,
            actualTotalAmount: actualTotalAmount,
            billTotalAmount: actualTotalAmount + billDetailcommissionAmount,
        };

        //update billDetail in latest id
        const billDetailResponse = await api.BillDetail.updatedBillDetail(latestId, billDetailData);
        dispatch(setBillDetail(billDetailResponse));
        setIsItemSaleDetailFilled(false);

    };

    //set deleted billDetail id 
    const handleBillDetailDelete = (deletedId: number) => {
        dispatch(setDeletedBillDetailId(deletedId));
        setIsBillDetailFilled(false);
        setIsBillDetailsValid(false);
    };

    //when item sale record is deleted
    const handleItemSaleDelete = async (deletedId: number) => {
        setIsBillDetailFilled(true);
        setIsItemSaleDetailsValid(false);

    }

    //Add ItemSaleDetail List to BillDetail table 
    async function onSubmitItemSaleDetailForm() {
        // console.log("gWt: ", totalWeight);
        const response = await api.ItemSaleDetail.getItemSaleDetail();
        const itemSaleDetailData = response.data;
        const updatedData = [];
        const id = billDetailId || 0;

        for (const item of itemSaleDetailData) {
            if (item.fkBillDetailId === billDetailId) {
                updatedData.push(item);

            }
        }
        if (updatedData.length > 0) {
            const billDetailResponse = await api.BillDetail.updatedBillDetail(id, { itemSaleDetails: updatedData });
            dispatch(setBillDetail(billDetailResponse));
        }
        // console.log("Updated Data: ", updatedData);
        setIsItemSaleDetailsValid(true);
        setIsItemSaleDetailFilled(true);
        setIsBillDetailFilled(false);
    }

    return (
        <Container>
            <Typography>Kharidi Bill</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={1} style={{ border: "1px solid #e0e0e0" }}>
                    <Grid item xs={3}>
                        <AppTextInput control={control} label="Bill No" name='billNo' required={true} type="number" isEditable={true} defaultValue={billNo} value={billNo}></AppTextInput>
                        {/* <TextField  label="Bill No"  required={true} type="number"
                        {...register('billNo', {required : true})}
                        error ={!!errors.billNo}
                        helperText = {errors.billNo?.message as string}
                        ></TextField> */}
                    </Grid>
                    <Grid item xs={3}>
                        <AppDateComponent control={control} label="Date" name="billDate" defaultValue={currentDate} required={true} />
                    </Grid>
                    <Grid item xs={3}>
                        <AppSelectList control={control} items={villages} label='Village' name='villageName' required={true} addItem={addVillage} isEditable={true} isLoadingItems={villageLoaded} />
                    </Grid>
                    <Grid item xs={3}>
                        <AppSelectList control={control} items={clientNames} label='Purchaser' name='fkAccount' required={true} addItem={addPurchaser} isEditable={true} isLoadingItems={accountLoaded} />
                    </Grid>
                </Grid>

            </form>

            <Grid container spacing={1} sx={{ marginTop: 0.5 }} >
                <Grid item xs={4}>
                    {/* BILL DETAILS */}
                    <BillDetails
                        onSubmit={onSubmitBillDetailForm} onBillDetailDelete={handleBillDetailDelete} isEditable={!isBillDetailFilled} isHTVisible={true} />
                </Grid>
                <Grid item xs={8} >
                    {/* ITEMSALE DETAILS */}
                    <ItemSaleDetails onSubmit={onSubmitItemSaleDetailForm} isEditable={isBillDetailFilled}
                        onDeleteBillDetail={handleBillDetailDelete}
                        onItemSaleDelete={handleItemSaleDelete} isHTVisible={true} />
                </Grid>
            </Grid >

            {/* Remaining Fields */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 5 }}>
            <Grid>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={1}>
                        <AppTextInput control={control} label="Total Qty" name='totalQuantity' required={true} type="number" defaultValue={totalQuantity} isEditable={false}></AppTextInput>
                    </Grid>
                    <Grid item xs={2}>
                        <AppTextInput control={control} label="Total Wt" name='billGrossWeight' required={true} type="number" defaultValue={totalWeight} isEditable={false}></AppTextInput>

                    </Grid>
                    <Grid item xs={1}>
                        <AppTextInput control={control} label="(-)Wt" name='' type="number" defaultValue={0} required={false}></AppTextInput>
                    </Grid>
                    <Grid item xs={2}>
                        <AppTextInput control={control} label="Net Wt" name='billNetWeight' required={false} type="number" defaultValue={totalNetWeight} isEditable={false}></AppTextInput>
                    </Grid>
                    <Grid item xs={2}>
                        <AppTextInput control={control} label="Total Amount" name='actualTotalAmount' required={false} type="number" defaultValue={totalAmount} isEditable={false}></AppTextInput>
                    </Grid>
                    <Grid item xs={2}>
                        <AppTextInput control={control} label="Comm" name='commissionAmount' required={false} type="number" defaultValue={commissionAmount} isEditable={false}></AppTextInput>
                    </Grid>
                    <Grid item xs={2}>
                        <AppTextInput control={control} label="Net Amount" name='billTotalAmount' required={false} type="number" defaultValue={netAmount} isEditable={false}></AppTextInput>
                    </Grid>

                </Grid>
                <Grid container item xs={12} spacing={1} alignItems="center">
                    <Box display='flex' justifyContent='space-between' sx={{ mt: 3, p: 1 }}>
                        <Button variant='contained' color='inherit' sx={{ marginRight: 2 }} onClick={resetForm}>Cancel</Button>
                        <Button type='submit' variant='contained' color='success' disabled={!isValid}
                            // onClick={handleButtonClick}/
                        >Submit</Button>
                    </Box>

                </Grid>
            </Grid>
            </form>

            <CustomDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                message={dialogMessage}
                onYesClick={() => setIsDialogOpen(false)}
            />
        </Container>
    )

}