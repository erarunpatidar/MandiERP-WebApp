import { LoadingButton } from "@mui/lab";
import { Container, Typography, Box, Button, Snackbar, TextField, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment } from "@mui/material";
import AppSelectList from "../../app/components/AppSelectList";
import AppTextInput from "../../app/components/AppTextInput";
import AppSelect from "../../app/components/AppSelect";
import { Controller, FieldValues, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { useEffect, useState } from "react";
import { fetchVillagesAsync } from "../village/villageSlice";
import { fetchAccountsAsync } from "../account/accountSlice";
import { format, parseISO } from "date-fns";
import { fetchAccountBankDetailsAsync, fetchBillsAsync, fetchGadiMastersAsync, fetchItemSaleDetailsAsync, setBill, setBillDetail, setDeletedBillDetailId, updateGadiBhada, updateTotalDeduction } from "./billSlice";
import api from "../../app/api/api";
import BillDetails from "./BillDetails";
import ItemSaleDetails from "./ItemSaleDetails";
import { Delete } from "@mui/icons-material";
import { CustomTable } from "./styles";
import AppDateComponent from "../../app/components/AppDateComponent";

type CustomFields = Record<string, any>;

export default function ManageMandiBill() {
    // const methods = useForm();
    const { control, handleSubmit, watch, setValue, reset, formState: { isSubmitting, isSubmitSuccessful } } = useForm();
    const villages = useAppSelector(state => state.village.cities);
    const { selectedVillageId, villageLoaded } = useAppSelector(state => state.village);
    const { allAccounts, selectedFarmerId, contactNo, accountLoaded } = useAppSelector(state => state.account);
    const { allBankAccounts, accountBankDetailLoaded } = useAppSelector(state => state.accountBankDetail);
    const { isBhadaPaidList, billTypes, isBhadaPaid, gadiBhada, billLoaded, totalQuantity, totalAmount, netAmount, commissionAmount, totalWeight,
        totalNetWeight, billPaidStatusList, isBillPrintList, billNo, totalStationary, totalDeduction, billId } = useAppSelector(state => state.bill);
    const { hammali, tulai } = useAppSelector(state => state.unit);
    const { latestId, deletedBillDetailId, billDetailId, quantity, billGrossWeight, billNetWeight, billDetailcommissionAmount, actualTotalAmount, billRate, totalItemSaleQty, totalWeightCutting } = useAppSelector(state => state.billDetail);
    const { gadiNoList, gadiMastersLoaded } = useAppSelector(state => state.gadiMasters);

    const [isBillDetailFilled, setIsBillDetailFilled] = useState(false);
    const [isItemSaleDetailFilled, setIsItemSaleDetailFilled] = useState(false);
    // const [deletedBillDetailId, setDeletedBillDetailId] = useState<number | null>(null);  //track deleted record

    const dispatch = useAppDispatch();
    const isBhadaPaidValue = watch('isBhadaPaid');
    const gadiBhadaValue = watch('gadiBhada');

    // falrmers List
    const farmers = allAccounts.filter((account) => account.fkVillageId === selectedVillageId && account.fkAccountTypeId === 7);
    const farmerNames = [...new Set(farmers.map((farmer) => farmer.accountFirmName))];

    // bankAccount List
    const accounts = allBankAccounts.filter((account) => account.fkAccountId === selectedFarmerId);
    const accountBanks: string[] = accounts.map((detail) => `${detail.branchName} - ${detail.bankAccountNo}`);
    // console.log("itemSaleData:", allItemSaleDetailData);
    const currentDate = format(new Date(), 'MM-dd-yyyy');

    useEffect(() => {

        // setDeletedBillDetailId(deletedBillDetailId);
        if (!billLoaded) {
            dispatch(fetchBillsAsync());
            // console.log("data:", bills)
        }

        dispatch(fetchVillagesAsync());
        dispatch(fetchAccountsAsync());
        dispatch(fetchAccountBankDetailsAsync());
        dispatch(fetchGadiMastersAsync());
        // dispatch(fetchItemSaleDetailsAsync());
        if (isBhadaPaidValue === 'No') {
            dispatch(updateGadiBhada(0));
            setValue('gadiBhada', 0);
            // console.log("paid:", isBhadaPaid)
        }
        else {
            dispatch(updateGadiBhada(gadiBhadaValue));
            setValue('gadiBhada', gadiBhadaValue);
        }
        setValue('billNo', billNo);
        setValue('billRsvrPhoneNo', contactNo);
        setValue('totalQuantity', totalQuantity);
        setValue('totalAmount', totalAmount);
        setValue('billTotalAmount', totalAmount + commissionAmount);
        setValue('actualTotalAmount', totalAmount);
        // if (!isBillDetailFilled) {
        const calculatedTotalDeduction = (hammali * totalQuantity) + (tulai * totalQuantity) + parseInt(gadiBhadaValue) + totalStationary;
        dispatch(updateTotalDeduction(calculatedTotalDeduction));
        setValue('totalDeduction', calculatedTotalDeduction);
        const calculatedNetAmount = totalAmount - calculatedTotalDeduction;
        setValue('netAmount', calculatedNetAmount);
        // }
        setValue('billGrossWeight', totalWeight);
        setValue('billNetWeight', totalNetWeight);
        setValue('commissionAmount', commissionAmount);
        dispatch(setDeletedBillDetailId(deletedBillDetailId));
        // console.log("tWT:", totalWeight)
        if (isItemSaleDetailFilled) {
            console.log("updateBillDetails is called");
            updateBillDetails();
        }

    }, [deletedBillDetailId, isBhadaPaid, dispatch, isBhadaPaidValue, setValue, totalQuantity, billNo, contactNo, gadiBhadaValue, totalWeight, billNo, netAmount]);
    // console.log("tWT outside func:", totalWeight)

    // Functions to add item in AppSelectList

    const addBankAcccount = (data: { customFields: CustomFields }) => {
        const branchName = data.customFields.branchName;
        const ifscCode = data.customFields.ifscCode;
        const bankAccountNo = data.customFields.bankAccountNo;
        const accountHolderName = data.customFields.accountHolderName;
        const response = api.AccountBankDetail.createAccountBankDetail({ branchName: branchName, ifscCode: ifscCode, bankAccountNo: bankAccountNo, accountHolderName: accountHolderName, fkAccountId: selectedFarmerId });
        dispatch(fetchAccountBankDetailsAsync());
    };

    const addVillage = (data: { customFields: CustomFields }) => {
        console.log("newItem: ", data);
        const response = api.Village.createVillage({ villageName: data.customFields.villageName });
        // dispatch(setVillage(response));
        dispatch(fetchVillagesAsync());

    };

    const addGadiNo = (data: { customFields: CustomFields }) => {
        const gadiNo = data.customFields.gadiNo;
        const mobileNo = data.customFields.mobileNo;
        const city = data.customFields.city;
        const response = api.GadiMasters.createGadiMasters({ gadiNo: gadiNo, mobileNo: mobileNo, city: city });
        dispatch(fetchGadiMastersAsync());
    };

    const addFarmer = (data: { customFields: CustomFields }) => {
        const accountName = data.customFields.accountName;
        const accountMobileNo = data.customFields.accountMobileNo;
        const accountCity = data.customFields.accountCity;

        const response = api.Account.createAccount({ accountName: accountName, accountMobileNo: accountMobileNo, accountCity: accountCity, fkVillageId: selectedVillageId, fkAccountTypeId: 7, accountFirmName: accountName });
        dispatch(fetchAccountsAsync());
    };


    const onSubmit = async (data: FieldValues) => {
        console.log("data.billdate: ", data.billDate);
        const response = await api.BillDetail.getBillDetail();
        // console.log("billDetailData in func:", response);
        const billDetails = response.data;
        const updatedBillDetailData = [];
        // const id =  billDetails.fkBillId|| 0;

        for (const item of billDetails) {
            if (item.fkBillId === billId) {
                console.log("item.fkBillDetailId", item.fkBillDetailId);
                console.log("item: ", item);
                updatedBillDetailData.push(item);

            }
        }
        
        //Submit Bill Data
        const billFormData = {
            billNo: billNo,
            billId: billId,
            billDate: data.billDate,
            fkAccountId: selectedFarmerId,
            fkAccount: data.fkAccount,
            isCompanyAccount: 0,
            gadiNo: data.gadiNo,
            isBhadaPaid: data.isBhadaPaid,
            gadiBhada: data.gadiBhada,
            billType: data.billType,
            villageName: data.villageName,
            billRsvrPersonName: data.billRsvrPersonName,
            billRsvrPhoneNo: data.billRsvrPhoneNo,
            isBillPrint: data.isBillPrint,
            billPaidStatus: data.billPaidStatus,
            totalQuantity: data.totalQuantity,
            totalHammali: hammali * totalQuantity,
            totalTulai: tulai * totalQuantity,
            totalStationary: totalStationary,
            totalDeduction: totalDeduction,
            totalAmount: data.totalAmount,
            netAmount: data.netAmount,
            billDetails: updatedBillDetailData
        };

        try {
            const billResponse = await api.Bill.createBill(billFormData);
            dispatch(setBill(billResponse));
            reset();
        } catch (error) {
            console.log(error);
        }
        alert("bill saved");
        // window.location.reload();
    };
    const resetForm = () => {
        reset();

        // Reset other component states
    }

    async function onSubmitBillDetailForm() {
        setIsBillDetailFilled(true);
    };

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

    //Add ItemSaleDetail List to BillDetail table 
    async function onSubmitItemSaleDetailForm() {
        // console.log("gWt: ", totalWeight);
        // updateBillDetails();
        setIsItemSaleDetailFilled(true);
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
        // console.log("Updated Data: ", updatedData);/

        setIsBillDetailFilled(false);
    }
    const handleBillDetailDelete = (deletedId: number) => {

        dispatch(setDeletedBillDetailId(deletedId));
        setIsBillDetailFilled(false);
    };

    const handleItemSaleDelete = async (deletedId: number) => {
        //Delete BillDetail record corresponding to that of ItemSaleDetail record
        console.log("deleted itemsale  id: ", deletedId);
        // const response = await api.BillDetail.getBillDetail();
        // const billDetailData = response.data;
        // const updatedData = []
        // try {
        //     for (const item of billDetailData) {

        //         for (const itemSale of item.itemSaleDetails) {
        //             console.log("itemSale: ", item);
        //             if (itemSale.id === deletedId) {
        //                 console.log("itemsale id: ", itemSale.id);
        //                 console.log("deletedId: ", deletedId);


        //                 //remove that itemsale record from billlDetails
        //             }
        //         }
        //     }
        //     console.log('Data deleted on the server');
        // } catch (error) {
        //     console.error('Error in onItemSaleDelete:', error);
        // }

        setIsBillDetailFilled(true);
    }

    return (
        <Container >
            {/* <Typography variant="h6">Bill Form</Typography> */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={1} style={{ border: "1px solid #e0e0e0" }}>
                    <Grid container spacing={1}>
                        <Grid item xs={1}>
                            <AppTextInput control={control} label="Bill No" name='billNo' required={false} type="number" defaultValue={billNo} value={billNo} isEditable={false}></AppTextInput>

                            {/* <TextField aria-readonly label="Bill No" name='billNo' type="number" value={billNo}></TextField> */}
                        </Grid>
                        <Grid item xs={2}>
                            {/* <AppTextInput control={control} label='Date' name='billDate' required={false} defaultValue={currentDate} showCalendarIcon={true}></AppTextInput> */}
                            {/* <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} /> */}
                            <AppDateComponent control={control} label="Date" name="billDate" defaultValue={currentDate} required={false} />
                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label='Transport' name='transPortName' required={false}  ></AppTextInput>
                        </Grid>
                        <Grid item xs={3}>
                            <AppSelectList control={control} items={gadiNoList} label='Gadi No' name='gadiNo' required={false} isEditable={true} addItem={addGadiNo} isLoadingItems={gadiMastersLoaded} />
                        </Grid>
                        <Grid item xs={2}>
                            <AppSelect control={control} items={isBhadaPaidList} label='isBhadaPaid' name='isBhadaPaid' required={false} defaultValue={isBhadaPaid} />

                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label='Gadi Bhada' name='gadiBhada' required={false} type="number" defaultValue={gadiBhada} ></AppTextInput>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid item xs={2}>
                            <AppSelect control={control} items={billTypes} label='Bill Type' name='billType' required={true} />
                        </Grid>

                        <Grid item xs={2.5}>
                            <AppSelectList control={control} items={villages} label='Village' name='villageName' required={true} addItem={addVillage} isEditable={true} isLoadingItems={villageLoaded} />
                        </Grid>
                        <Grid item xs={2.5}>
                            <AppSelectList control={control} items={farmerNames} label='Farmer Name' name='billRsvrPersonName' required={true} addItem={addFarmer} isEditable={true} isLoadingItems={accountLoaded} />
                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label='Contact No' name='billRsvrPhoneNo' required={false} defaultValue={contactNo}  ></AppTextInput>
                        </Grid>
                        <Grid item xs={3}>
                            <AppSelectList control={control} items={accountBanks} label='Bank Account' name='fkAccount' defaultValue='' required={false} addItem={addBankAcccount} isEditable={true} isLoadingItems={accountBankDetailLoaded} />
                        </Grid>
                    </Grid>

                </Grid>
            </form>

            <Grid container spacing={1} sx={{ marginTop: 0.5 }} >
                <Grid item xs={4}>
                    {/* BILL DETAILS */}
                    <BillDetails 
                        onSubmit={onSubmitBillDetailForm} onBillDetailDelete={handleBillDetailDelete} isEditable={!isBillDetailFilled} isHTVisible={false} />
                </Grid>
                <Grid item xs={8} >
                    {/* ITEMSALE DETAILS */}
                    <ItemSaleDetails onSubmit={onSubmitItemSaleDetailForm} isEditable={isBillDetailFilled}
                    onDeleteBillDetail={handleBillDetailDelete}
                    onItemSaleDelete={handleItemSaleDelete} isHTVisible={false} />
                </Grid>
            </Grid >

            {/* Remaining Bill fields */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '5px' }} >
                <Grid container spacing={1}>
                    <Grid container item xs={12} spacing={1}>
                        <Grid item xs={1}>
                            <AppTextInput control={control} label="Total Qty" name='totalQuantity' required={false} type="number" defaultValue={totalQuantity} isEditable={false}></AppTextInput>
                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label="Total Wt" name='billGrossWeight' required={false} type="number" defaultValue={totalWeight} isEditable={false}></AppTextInput>

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
                    <Grid container item xs={12} spacing={2} alignItems="center">
                        <Grid item xs={6}>
                            <Typography style={{ fontSize: '15px', fontWeight: 'bold' }}>Expense Details</Typography>
                            <TableContainer >
                                <CustomTable>
                                    <TableHead >
                                        <TableRow>
                                            <TableCell>Hammali</TableCell>
                                            <TableCell>Tuali</TableCell>
                                            <TableCell>Stationary</TableCell>
                                            <TableCell>Cash/Advance/Other</TableCell>
                                            <TableCell>Gadi Bhada</TableCell>
                                            <TableCell>Total</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        <TableRow>
                                            <TableCell>{hammali && totalQuantity ? hammali * totalQuantity : 0}</TableCell>
                                            <TableCell>{tulai && totalQuantity ? tulai * totalQuantity : 0}</TableCell>
                                            <TableCell>{totalStationary ? totalStationary : 0}</TableCell>
                                            <TableCell>{0}</TableCell>
                                            <TableCell>{gadiBhada ? gadiBhada : 0}</TableCell>
                                            <TableCell>{totalDeduction ? totalDeduction : 0}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </CustomTable>
                            </TableContainer>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography style={{ fontSize: '15px', fontWeight: 'bold' }}>Amount Details</Typography>
                            <CustomTable>
                                <TableHead >
                                    <TableRow>
                                        <TableCell>Total Amount</TableCell>
                                        <TableCell>Total Expense</TableCell>
                                        <TableCell>Bill Total Amount</TableCell>
                                        <TableCell>Amount (in Words)</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    <TableRow>
                                        <TableCell>{totalAmount ? totalAmount : 0}</TableCell>
                                        <TableCell>{totalDeduction ? totalDeduction : 0}</TableCell>
                                        <TableCell>{totalAmount && totalDeduction ? totalAmount - totalDeduction : 0}</TableCell>
                                        <TableCell>{totalAmount && totalDeduction ? totalAmount - totalDeduction : 0}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </CustomTable>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={1} alignItems="center">
                        <Grid item xs={3} >
                            <AppSelect control={control} items={isBillPrintList} label='Bill On' name='isBillPrint' required={true} defaultValue='Print On Page' />
                        </Grid>
                        <Grid item xs={3}>
                            <AppSelect control={control} items={billPaidStatusList} label='Pay' name='billPaidStatus' required={true} defaultValue='Cash' />
                        </Grid>
                        <Grid item xs={3} >
                            <Button onClick={resetForm} variant='contained' color='inherit'>Cancel</Button>
                        </Grid>
                        <Grid item xs={3}>
                            <LoadingButton loading={isSubmitting} type='submit' variant='contained' color='success'>Submit</LoadingButton>
                        </Grid>
                        
                        </Grid>
                    </Grid>

            </form>

        </Container >
    )
}