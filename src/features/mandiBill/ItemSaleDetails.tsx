import { FieldValues, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { SetStateAction, useEffect, useState } from "react";
import { Grid, Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, TextField, Container } from "@mui/material";
import AppSelect from "../../app/components/AppSelect";
import AppTextInput from "../../app/components/AppTextInput";
import AppSelectList from "../../app/components/AppSelectList";
import { itemSaleDetailSelectors, removeItemSaleDetail, setCommissionPercent, setDeletedBillDetailId, setItemSaleDetail, updateBillDetailValues, updateBillValues, updateItemSaleCommission, updateNetWeight } from "./billSlice";
import { Delete } from "@mui/icons-material";
import { ItemSaleDetail } from "../../app/models/itemSaleDetail";
import api from "../../app/api/api";
import CustomDialog from "../../app/components/CustomDialog";
import { fetchAccountsAsync } from "../account/accountSlice";
import { CustomTable } from "./styles";

type CustomFields = Record<string, any>;

interface Props {
    onSubmit: () => void;
    isEditable: boolean;
    onDeleteBillDetail: (deletedId: number) => void;
    onItemSaleDelete: (deletedId: number) => void;
    isHTVisible: boolean

}

export default function ItemSaleDetails({ onSubmit, isEditable, onDeleteBillDetail, onItemSaleDelete, isHTVisible }: Props) {
    const dispatch = useAppDispatch();
    const { control, reset, setValue, handleSubmit, watch, formState: { isSubmitting } } = useForm();
    const { percentComission } = useAppSelector(state => state.item);
    const { totalWeightCutting, quantity, billDetailId, deletedBillDetailId } = useAppSelector(state => state.billDetail);
    const { selectedVillageId } = useAppSelector(state => state.village);
    const { saleTypeList, isCommissionTypeList, isCommission, commissionPercent, grossWeight, netWeight } = useAppSelector(state => state.itemSaleDetail);
    const { allAccounts, accountLoaded } = useAppSelector(state => state.account);
    const itemSaleDetailData = useAppSelector(itemSaleDetailSelectors.selectAll);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [OnYes, setOnYes] = useState(false);

    const [tableData, setTableData] = useState<FieldValues[]>([]);
    const isCommissionValue = watch('isCommission');
    const gWtValue = watch('grossWeight');
    const quantityValue = watch('quantity');

    const [itemTotalQuantity, setItemTotalQuantity] = useState<number>(0);
    // purchaser list
    const clients = allAccounts.filter((account) => account.fkAccountTypeId === 24);
    const clientNames = [...new Set(clients.map((client) => client.accountFirmName))];

    useEffect(() => {
        if (deletedBillDetailId !== null) {
            // Implement the logic to delete the corresponding record in ItemSaleDetails
            console.log(`Deleting record with ID ${deletedBillDetailId} in ItemSaleDetails`);

            // Reset the deletedBillDetailId after processing
            onBillDetailDelete(deletedBillDetailId);
            dispatch(setDeletedBillDetailId(null));
        }
        else { console.log("delete id not found") }
        dispatch(setCommissionPercent(percentComission));
        setValue('commissionPercent', commissionPercent);
        setValue('weightCut', totalWeightCutting);
        if (gWtValue) {
            // console.log("wc", totalWeightCutting)

            const netWt = gWtValue - (totalWeightCutting) * quantityValue;
            // console.log("netWt: ", netWt)
            dispatch(updateNetWeight(netWt))
            setValue('netWeight', netWt);
        }
        if (isCommissionValue === 'No') {
            dispatch(updateItemSaleCommission(0));
            setValue('commissionPercent', 0);
        }
        calculateColumnTotals();

    }, [isCommission, dispatch, isCommissionValue, setValue, commissionPercent, percentComission, netWeight, gWtValue, tableData, quantityValue, deletedBillDetailId, totalWeightCutting])

    async function handleFormSubmit(data: FieldValues) {
        const updatedData = {
            ...data,
            fkBillDetailId: billDetailId,
            quantity: parseInt(data.quantity),
            grossWeight: parseInt(data.grossWeight),
            rate: parseFloat(data.rate),
            commissionPercent: parseInt(data.commissionPercent),
            netWeight: parseFloat(data.netWeight),
            totalAmount: Math.round(data.rate * data.netWeight),
            commissionAmount: Math.round((commissionPercent / 100) * (data.rate * data.netWeight)),
            netAmount: Math.round(data.rate * data.netWeight + Math.round(((commissionPercent / 100) * (data.rate * data.netWeight)))),
        };

        try {
            const updatedQuantity = itemTotalQuantity + parseInt(data.quantity);
            if (updatedQuantity > quantity) {
                setDialogMessage(`Sale and Purchaser Qty do not match: ${quantity - updatedQuantity}`);
                setIsDialogOpen(true);
                return;
            }

            const itemSaleDetailResponse = await api.ItemSaleDetail.createItemSaleDetail(updatedData);
            dispatch(setItemSaleDetail(itemSaleDetailResponse));
            setItemTotalQuantity(updatedQuantity);
            setTableData((prevData) => [...prevData, { ...updatedData, id: itemSaleDetailResponse.id }]);
            isEditable = true;

            if (updatedQuantity === quantity) {
                console.log("same");
                setItemTotalQuantity(0);
                setOnYes(true);
                setDialogMessage("Want to add new Item?");
                setIsDialogOpen(true);
                isEditable = false;

                onSubmit();
            }


        } catch (error) {
            console.log(error);
        }


    }

    // Function to calculate the total values of each column
    const calculateColumnTotals = () => {
        // console.log("itemSaleData: ", itemSaleDetailData);
        // console.log("tableData: ", tableData);

        //calculate totals of itemSaleDetails corrosponding to that of billDetailId
        const totals = {
            billGrossWeight: 0,
            billNetWeight: 0,
            commissionAmount: 0,
            actualTotalAmount: 0,
            totalItemSaleQuantity: 0,
            billRate: 0,
        };

        itemSaleDetailData.forEach((rowData) => {
            if (rowData.fkBillDetailId === billDetailId) {
                totals.billGrossWeight += rowData.grossWeight || 0;
                totals.billNetWeight += rowData.netWeight || 0;
                totals.commissionAmount += rowData.commissionAmount || 0;
                totals.actualTotalAmount += rowData.totalAmount || 0;
                totals.totalItemSaleQuantity += rowData.quantity || 0;
                totals.billRate = rowData.rate || 0;
            }
        });
        dispatch(updateBillDetailValues({
            billGrossWeight: totals.billGrossWeight, billNetWeight: totals.billNetWeight, commissionAmount: totals.commissionAmount,
            actualTotalAmount: totals.actualTotalAmount, billRate: totals.billRate, totalItemSaleQty: totals.totalItemSaleQuantity
        }))


        // calculate totals of tableData
        const columnTotals = {
            quantity: 0,
            grossWeight: 0,
            netWeight: 0,
            amount: 0,
            netAmount: 0,
            commissionAmount: 0,
            rate: 0,
        };

        // Iterate through each row in the table data
        tableData.forEach((rowData) => {
            columnTotals.quantity += parseInt(rowData.quantity) || 0;
            columnTotals.grossWeight += parseInt(rowData.grossWeight) || 0;
            columnTotals.netWeight += rowData.netWeight || 0;
            columnTotals.amount += rowData.totalAmount || 0;
            columnTotals.netAmount += rowData.netAmount || 0;
            columnTotals.commissionAmount += rowData.commissionAmount || 0;
        });

        dispatch(updateBillValues({
            totalQuantity: columnTotals.quantity,
            totalAmount: columnTotals.amount,
            netAmount: columnTotals.netAmount,
            commissionAmount: columnTotals.commissionAmount,
            totalWeight: columnTotals.grossWeight,
            totalNetWeight: columnTotals.netWeight,
        }));
    };

    const addPurchaser = (data: { customFields: CustomFields }) => {
        const accountSortName = data.customFields.accountFirmName;
        const accountFirmName = data.customFields.accountFirmName;
        const accountMobileNo = data.customFields.accountMobileNo;
        const accountCity = data.customFields.accountCity;

        const response = api.Account.createAccount({ accountName: accountFirmName, accountMobileNo: accountMobileNo, accountCity: accountCity, fkVillageId: selectedVillageId, fkAccountTypeId: 24, accountFirmName: accountFirmName, accountSortName: accountSortName });
        dispatch(fetchAccountsAsync());

    };
    // delete record

    const onBillDetailDelete = async (id: number) => {
        try {
            // Create an array of promises for each deletion operation
            const deletionPromises = itemSaleDetailData
                .filter(item => item.fkBillDetailId === id)
                .map(item => api.ItemSaleDetail.deleteItemSaleDetail(item.id).then(() => dispatch(removeItemSaleDetail(item.id))));

            // console.log('Deletion promises:', deletionPromises);

            // Wait for all deletion operations to complete
            await Promise.all(deletionPromises);

            // console.log('After deletion: itemSaleDetailData', itemSaleDetailData);

            // After all deletions are done, update the state
            setTableData(prevData => {
                const updatedTableData = prevData.filter(item => item.fkBillDetailId !== id);
                return updatedTableData;
            });

            console.log('Data deleted on the server');
        } catch (error) {
            console.error('Error in onBillDetailDelete:', error);
        }
    };

    const handleDelete = (id: number) => {
        console.log("billdetail del id:", id);
        if (tableData.length > 0) {
            const lastRecordId = tableData[tableData.length - 1].id;
            console.log("lastRecord: ", lastRecordId);

            if (id === lastRecordId) {
                api.ItemSaleDetail.deleteItemSaleDetail(lastRecordId)
                    .then(() => {
                        dispatch(removeItemSaleDetail(lastRecordId));
                        const updatedTableData = tableData.slice(0, -1); // Remove the last record

                        setTableData(updatedTableData);
                        onItemSaleDelete(id);
                    })
                    .catch((error) => console.error('Error deleting data:', error));
            } else {
                alert('You can only delete the last record.');
            }
        }


    };


    return (
        <>
            <form onSubmit={handleSubmit(handleFormSubmit)} >

                <Grid container spacing={1}>
                    <Grid container item xs={12} spacing={1}>
                        <Grid item sm={4}>
                            <AppSelectList control={control} items={clientNames} label='Purchaser' name='fkAccount' required={true} addItem={addPurchaser} isEditable={isEditable} isLoadingItems={accountLoaded} />
                        </Grid>
                        <Grid item sm={4}>
                            <AppTextInput control={control} label='Quantity' name='quantity' required={false} type="number" defaultValue={0} isEditable={isEditable}></AppTextInput>
                        </Grid>
                        <Grid item sm={4}>
                            <AppTextInput control={control} label='Rate' name='rate' required={false} type="number" defaultValue={0} isEditable={isEditable}></AppTextInput>
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} spacing={1}>
                        <Grid item sm={3}>
                            <AppSelect control={control} items={saleTypeList} label='Sale Type' name='saleTypeFixOrWeightBased' required={true} isEditable={isEditable} />
                        </Grid>
                        <Grid item sm={3}>
                            <AppTextInput control={control} label='GWt' name='grossWeight' required={true} defaultValue={grossWeight} type="number" isEditable={isEditable}></AppTextInput>
                        </Grid>
                        <Grid item sm={3}>
                            <AppTextInput control={control} label='WeightCut' name='' required={true} defaultValue={totalWeightCutting} type="number" isEditable={isEditable}></AppTextInput>
                        </Grid>
                        <Grid item sm={3}>
                            <AppTextInput control={control} label='NetWt' name='netWeight' required={false} defaultValue={netWeight} value={netWeight} isEditable={false}  ></AppTextInput>
                            {/* <TextField aria-readonly label='NetWt' name='netWeight' required={false} type="number" value={netWeight}  ></TextField> */}
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} spacing={1}>
                        <Grid item sm={3}>
                            <AppTextInput control={control} label='Weight Details' name='weightDetails' required={false} isEditable={isEditable} ></AppTextInput>
                        </Grid>
                        <Grid item sm={3}>
                            <AppSelect control={control} items={isCommissionTypeList} label='Is Commission' name='isCommission' required={true} defaultValue={isCommission} isEditable={isEditable} />
                        </Grid>
                        <Grid item sm={2}>
                            <AppTextInput control={control} label='Remark' name='remark' required={false} defaultValue='' isEditable={isEditable}></AppTextInput>
                        </Grid>
                        <Grid item sm={2}>
                            <AppTextInput control={control} label='commission' name='commissionPercent' required={false} type="number" defaultValue={commissionPercent} value={commissionPercent} isEditable={false}></AppTextInput>
                        </Grid>
                        <Grid item sm={2}>
                            <Box display="flex" justifyContent="space-between" sx={{ mt: 0.5 }}>
                                <Button size="small" type="submit" variant="contained" color="info" disabled={!isEditable} > Add </Button></Box>
                        </Grid>
                    </Grid>

                </Grid>

            </form>
            <CustomDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                message={dialogMessage}
                onYes={OnYes}
                onYesClick={() => setIsDialogOpen(false)}
            />
            {/* Render the table with tableData */}
            <TableContainer
                // style={{ backgroundColor: 'lightgrey', border: '1px solid #000', height: '180px',
                // marginTop: '10px', marginBottom:'10px', }}
                style={isHTVisible ?
                    { backgroundColor: 'lightgrey', border: '1px solid #000', height: '180px', marginTop: '40px', marginBottom: '10px' }
                    : { backgroundColor: 'lightgrey', border: '1px solid #000', height: '180px', marginTop: '12px', marginBottom: '10px' }
                }
            >
                <CustomTable>
                    <TableHead style={{ backgroundColor: 'white' }} >
                        <TableRow>
                            <TableCell>Party Name</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Rate</TableCell>
                            <TableCell>G.wt</TableCell>
                            <TableCell>N.wt</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>NetAmount</TableCell>
                            <TableCell>ComAmt</TableCell>
                            <TableCell>Com%</TableCell>
                            <TableCell>Delete</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {tableData.map((rowData) => (
                            <TableRow key={rowData.id}>
                                <TableCell>{rowData.fkAccount}</TableCell>
                                <TableCell>{rowData.quantity}</TableCell>
                                <TableCell>{rowData.rate}</TableCell>
                                <TableCell>{rowData.grossWeight}</TableCell>
                                <TableCell>{rowData.netWeight}</TableCell>
                                <TableCell>{rowData.totalAmount}</TableCell>
                                <TableCell>{rowData.netAmount}</TableCell>
                                <TableCell>{rowData.commissionAmount}</TableCell>
                                <TableCell>{rowData.commissionPercent}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleDelete(rowData.id)} startIcon={<Delete />} color='error' />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </CustomTable>
            </TableContainer>
            
            {/* <Grid container item xs={12} spacing={1}>
                        <Grid item xs={1}>
                            <AppTextInput control={control} label="Total Qty" name='totalQuantity' required={false} type="number" defaultValue isEditable={false}></AppTextInput>
                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label="Total Wt" name='billGrossWeight' required={false} type="number" defaultValue isEditable={false}></AppTextInput>

                        </Grid>
                        <Grid item xs={1}>
                            <AppTextInput control={control} label="(-)Wt" name='' type="number" defaultValue={0} required={false}></AppTextInput>
                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label="Net Wt" name='billNetWeight' required={false} type="number" defaultValue isEditable={false}></AppTextInput>
                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label="Total Amount" name='actualTotalAmount' required={false} type="number" defaultValue isEditable={false}></AppTextInput>
                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label="Comm" name='commissionAmount' required={false} type="number" defaultValue isEditable={false}></AppTextInput>
                        </Grid>
                        <Grid item xs={2}>
                            <AppTextInput control={control} label="Net Amount" name='billTotalAmount' required={false} type="number" defaultValue isEditable={false}></AppTextInput>
                        </Grid>

                    </Grid> */}

        </>

    )

}