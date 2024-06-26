import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice, current, isAnyOf } from "@reduxjs/toolkit";
import api from "../../app/api/api";
import { RootState, useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { Bill } from "../../app/models/bill";
import { format } from 'date-fns';
import { AccountBankDetail } from "../../app/models/accountBankDetail";
import { BillDetail } from "../../app/models/billDetails";
import { ItemSaleDetail } from "../../app/models/itemSaleDetail";
import { GadiMasters } from "../../app/models/gadiMasters";


interface BillState {
    bill: Bill | null,
    billId: number,
    status: string;
    billLoaded: boolean,
    date: string,
    isBhadaPaidList: string[],
    billTypes: string[],
    gadiBhada: number,
    isBhadaPaid: string,
    totalQuantity: number,
    totalAmount: number,
    netAmount: number,
    commissionAmount: number,
    totalWeight: number,
    totalNetWeight: number,
    billPaidStatusList: string[] //cash, Baki
    isBillPrintList: string[],
    billNo: number,
    totalStationary: number,
    totalDeduction: number

}

const billsAdapter = createEntityAdapter<Bill>();

export const fetchBillsAsync = createAsyncThunk<Bill[], void, { state: RootState }>(
    'bill/fetchBillsAsync',
    async () => {
        try {
            const response = await api.Bill.getBill();
            const data = response.data;
            return data;
        } catch (error: any) {
            return error;
        }
    }
)
const currentDate = format(new Date(), 'yyyy-MM-dd');

export const billSlice = createSlice({
    name: 'bill',
    initialState: billsAdapter.getInitialState<BillState>({
        status: 'idle',
        bill: null,
        date: currentDate,
        isBhadaPaidList: ['Yes', 'No'],
        billTypes: ['Fix', 'Net Fix', 'Avg', 'Net Avg'],
        billLoaded: false,
        gadiBhada: 0,
        isBhadaPaid: "No",
        totalQuantity: 0,
        totalAmount: 0,
        netAmount: 0,
        commissionAmount: 0,
        totalWeight: 0,
        totalNetWeight: 0,
        billPaidStatusList: ['Cash', 'Baki'],
        isBillPrintList: ['Print On Page'],
        billNo: 0,
        totalStationary: 2,
        totalDeduction: 0,
        billId: 0
    }),
    reducers: {
        setBillNo: (state, action) => {
            state.billNo = action.payload;
        },
        setBill: (state, action) => {
            billsAdapter.upsertOne(state, action.payload);
            state.billLoaded = false;
        },
        updateGadiBhada: (state, action) => {
            state.gadiBhada = action.payload;
        },
        removeBill: (state, action) => {
            billsAdapter.removeOne(state, action.payload);
            state.billLoaded = false;
        },
        updateBillValues: (state, action) => {
            const { totalQuantity, totalAmount, netAmount, commissionAmount, totalWeight, totalNetWeight } = action.payload;

            // Update the state properties
            state.totalQuantity = totalQuantity;
            state.totalAmount = totalAmount;
            state.netAmount = netAmount;
            state.commissionAmount = commissionAmount;
            state.totalWeight = totalWeight;
            state.totalNetWeight = totalNetWeight;
        },
        updateTotalDeduction: (state, action) => {
            state.totalDeduction = action.payload;
        },


    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchBillsAsync.pending, (state, action) => {
            // console.log(action);
            state.status = 'loading';
            state.billLoaded = true;
        });
        builder.addCase(fetchBillsAsync.fulfilled, (state, action) => {
            billsAdapter.setAll(state, action.payload);
            const no = Math.max(...action.payload.map(Bill => Bill.id), 0);
            state.billNo = no + 1;
            state.billId = no + 1;
            // console.log("billNo:", state.billNo);
            state.status = 'idle';
            state.billLoaded = false;

        });
        builder.addCase(fetchBillsAsync.rejected, (state, action) => {
            state.status = 'failed';
            state.billLoaded = false;
        });
    })
})


export const billSelectors = billsAdapter.getSelectors((state: RootState) => state.bill);
export const { removeBill, setBill, updateGadiBhada, updateBillValues, setBillNo, updateTotalDeduction } = billSlice.actions;



{/* SLICE FOR AccountBankDetails */ }

interface AccountBankDetailsState {
    accountBankDetail: AccountBankDetail | null,
    status: string;
    accountBankDetailLoaded: boolean,
    allBankAccounts: AccountBankDetail[],

}

const accountBankDetailsAdapter = createEntityAdapter<AccountBankDetail>();

export const fetchAccountBankDetailsAsync = createAsyncThunk<AccountBankDetail[], void, { state: RootState }>(
    'accountBankDetail/fetchAccountBankDetailsAsync',
    async () => {
        try {
            const response = await api.AccountBankDetail.getAccountBankDetail();
            const data = response.data;
            // console.log("data:", response.data);
            return data;
        } catch (error: any) {
            return error;
        }
    }
)


export const accountBankDetailSlice = createSlice({
    name: 'accountBankDetail',
    initialState: accountBankDetailsAdapter.getInitialState<AccountBankDetailsState>({
        status: 'idle',
        accountBankDetail: null,
        accountBankDetailLoaded: false,
        allBankAccounts: [],
    }),
    reducers: {
        setAccountBankDetail: (state, action) => {
            accountBankDetailsAdapter.upsertOne(state, action.payload);
            state.accountBankDetailLoaded = false;
        },
        removeAccountBankDetail: (state, action) => {
            accountBankDetailsAdapter.removeOne(state, action.payload);
            state.accountBankDetailLoaded = false;
        }
    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchAccountBankDetailsAsync.pending, (state, action) => {
            // console.log(action);
            state.status = 'loading';
            state.accountBankDetailLoaded = true;
        });
        builder.addCase(fetchAccountBankDetailsAsync.fulfilled, (state, action) => {
            accountBankDetailsAdapter.setAll(state, action.payload);

            state.allBankAccounts = action.payload.map((item: AccountBankDetail) => item);
            // if (Array.isArray(action.payload)) {
            //     accountBankDetailsAdapter.setAll(state, action.payload);
            //     state.allBankAccounts = action.payload.map((item: AccountBankDetail) => item);
            // } else {
            //     // Handle the case where the payload is not an array
            //     // You might want to set state.gadiNoList to an empty array or handle it differently
            //     state.allBankAccounts = [];
            // }
            state.status = 'idle';
            state.accountBankDetailLoaded = false;

        });
        builder.addCase(fetchAccountBankDetailsAsync.rejected, (state, action) => {
            state.status = 'failed';
            // console.log(action.payload);
            state.accountBankDetailLoaded = false;
        });
    })
})


// export const billSelectors = billsAdapter.getSelectors((state:RootState) => state.bill);
export const { removeAccountBankDetail, setAccountBankDetail } = accountBankDetailSlice.actions;



{/* SLICE FOR BillDetails */ }
interface BillDetailsState {
    billDetails: BillDetail | null,
    status: string;
    billDetailLoaded: boolean,
    // unitTypes:string[],
    commissionPercent: number
    totalWeightCutting: number
    itemName: string,
    latestId: number,
    quantity: number,
    billDetailId: number | null
    deletedBillDetailId: number | null,

    billGrossWeight: number,
    billNetWeight: number,
    billDetailcommissionAmount: number,
    actualTotalAmount: number,
    billRate: number,
    totalItemSaleQty: number,
}

const billDetailsAdapter = createEntityAdapter<BillDetail>();

export const fetchBillDetailsAsync = createAsyncThunk<BillDetail[], void, { state: RootState }>(
    'billDetail/fetchBillDetailsAsync',
    async () => {
        try {
            const response = await api.BillDetail.getBillDetail();
            const data = response.data;
            // console.log("data:", response.data);
            return data;
        } catch (error: any) {
            return error;
        }
    }
)

export const billDetailSlice = createSlice({
    name: 'billDetail',
    initialState: billDetailsAdapter.getInitialState<BillDetailsState>({
        status: 'idle',
        billDetails: null,
        billDetailLoaded: false,
        commissionPercent: 0,
        totalWeightCutting: 0,
        itemName: "",
        latestId: 0,
        quantity: 0,
        billDetailId: null,
        deletedBillDetailId: null,
        billGrossWeight: 0,
        billNetWeight: 0,
        billDetailcommissionAmount: 0,
        actualTotalAmount: 0,
        billRate: 0,
        totalItemSaleQty: 0
    }),
    reducers: {
        setLatestId: (state, action) => {
            state.latestId = action.payload;
            // console.log("latestId:", state.latestId);
        },
        setBillDetail: (state, action) => {
            billDetailsAdapter.upsertOne(state, action.payload);
            state.billDetailLoaded = false;
        },
        updateCommission: (state, action) => {
            state.commissionPercent = action.payload;
        },
        updateWeightCutting: (state, action) => {
            const { totalWeightCutting, quantity } = action.payload;
            state.totalWeightCutting = totalWeightCutting;
            state.quantity = quantity;
        },
        removeBillDetail: (state, action) => {
            billDetailsAdapter.removeOne(state, action.payload);
            state.billDetailLoaded = false;
        },
        setBillDetailId: (state, action) => {
            state.billDetailId = action.payload
        },
        setDeletedBillDetailId: (state, action) => {
            state.deletedBillDetailId = action.payload
        },
        updateBillDetailValues: (state, action) => {
            const { billGrossWeight, billNetWeight, commissionAmount, actualTotalAmount, billRate, totalItemSaleQty } = action.payload;
            state.billGrossWeight = billGrossWeight;
            state.billNetWeight = billNetWeight;
            state.billDetailcommissionAmount = commissionAmount;
            state.actualTotalAmount = actualTotalAmount;
            state.billRate = billRate;
            state.totalItemSaleQty = totalItemSaleQty;
        },

    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchBillDetailsAsync.pending, (state, action) => {
            // console.log(action);
            state.status = 'loading';
            state.billDetailLoaded = true;
        });
        builder.addCase(fetchBillDetailsAsync.fulfilled, (state, action) => {
            billDetailsAdapter.setAll(state, action.payload);
            // state.cities = action.payload.map((item: Account) => item.accountCity);

            state.status = 'idle';
            state.billDetailLoaded = false;

        });
        builder.addCase(fetchBillDetailsAsync.rejected, (state, action) => {
            state.status = 'failed';
            // console.log(action.payload);
            state.billDetailLoaded = false
        });
    })
})


export const billDetailSelectors = billDetailsAdapter.getSelectors((state: RootState) => state.billDetail);
export const { setBillDetail, updateCommission, removeBillDetail, setLatestId, updateWeightCutting, setBillDetailId, setDeletedBillDetailId, updateBillDetailValues } = billDetailSlice.actions;


{/* SLICE FOR ItemSaleDetails */ }
interface ItemSaleDetailsState {
    itemSaleDetails: ItemSaleDetail | null,
    status: string;
    itemSaleDetailLoaded: boolean,
    commissionPercent: number
    saleTypeList: string[],
    isCommissionTypeList: string[],
    isCommission: string,
    grossWeight: number,
    netWeight: number,

}

const itemSaleDetailsAdapter = createEntityAdapter<ItemSaleDetail>();

export const fetchItemSaleDetailsAsync = createAsyncThunk<ItemSaleDetail[], void, { state: RootState }>(
    'itemSaleDetail/fetchItemSaleDetailsAsync',
    async () => {
        try {
            const response = await api.ItemSaleDetail.getItemSaleDetail();
            const data = response.data;
            // console.log("data:", response.data);
            return data;
        } catch (error: any) {
            return error;
        }
    }
)

// Import necessary dependencies and existing code


export const itemSaleDetailSlice = createSlice({
    name: 'ItemSaleDetail',
    initialState: itemSaleDetailsAdapter.getInitialState<ItemSaleDetailsState>({
        status: 'idle',
        itemSaleDetails: null,
        itemSaleDetailLoaded: false,
        commissionPercent: 0,
        saleTypeList: ['U', 'W'],
        isCommissionTypeList: ['Yes', 'No'],
        isCommission: "Yes",
        grossWeight: 0,
        netWeight: 0,

    }),
    reducers: {
        setItemSaleDetail: (state, action) => {
            itemSaleDetailsAdapter.upsertOne(state, action.payload);
            state.itemSaleDetailLoaded = false;
        },
        setCommissionPercent: (state, action) => {
            state.commissionPercent = action.payload
        },
        updateNetWeight: (state, action) => {
            state.netWeight = action.payload;
            // console.log("nwt: ", state.netWeight)
        },
        updateItemSaleCommission: (state, action) => {
            state.commissionPercent = action.payload;
        },
        removeItemSaleDetail: (state, action) => {
            itemSaleDetailsAdapter.removeOne(state, action.payload);
            state.itemSaleDetailLoaded = false;
        },

    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchItemSaleDetailsAsync.pending, (state, action) => {
            // console.log(action);
            state.status = 'loading';
            state.itemSaleDetailLoaded = true;
        });
        builder.addCase(fetchItemSaleDetailsAsync.fulfilled, (state, action) => {
            itemSaleDetailsAdapter.setAll(state, action.payload);
            state.status = 'idle';
            state.itemSaleDetailLoaded = false;

        });
        builder.addCase(fetchItemSaleDetailsAsync.rejected, (state, action) => {
            state.status = 'failed';
            // console.log(action.payload);
            state.itemSaleDetailLoaded = false;
        });
    })
})


export const itemSaleDetailSelectors = itemSaleDetailsAdapter.getSelectors((state: RootState) => state.itemSaleDetail);
export const { setItemSaleDetail, updateItemSaleCommission, setCommissionPercent, updateNetWeight, removeItemSaleDetail, } = itemSaleDetailSlice.actions;


{/* SLICE FOR GadiMasters */ }
interface GadiMastersState {
    gadiMasters: GadiMasters | null,
    gadiNoList: string[],
    gadiMastersLoaded: boolean,
    status: string;
}

const gadiMastersAdapter = createEntityAdapter<GadiMasters>();

export const fetchGadiMastersAsync = createAsyncThunk<GadiMasters[], void, { state: RootState }>(
    'gadiMasters/fetchGadiMastersAsync',
    async () => {
        try {
            const response = await api.GadiMasters.getGadiMasters();
            const data = response.data;
            // console.log("data:", response.data);
            return data;
        } catch (error: any) {
            return error;
        }
    }
)


export const gadiMastersSlice = createSlice({
    name: 'GadiMasters',
    initialState: gadiMastersAdapter.getInitialState<GadiMastersState>({
        gadiMasters: null,
        gadiNoList: [],
        gadiMastersLoaded: false,
        status: "idle"
    }),
    reducers: {
        setGadiMasters: (state, action) => {
            gadiMastersAdapter.upsertOne(state, action.payload);
            state.gadiMastersLoaded = false;
        }

    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchGadiMastersAsync.pending, (state, action) => {
            // console.log(action);
            state.status = 'loading';
            state.gadiMastersLoaded = true;
        });
        builder.addCase(fetchGadiMastersAsync.fulfilled, (state, action) => {
            gadiMastersAdapter.setAll(state, action.payload);
            state.gadiNoList = action.payload.map((item: GadiMasters) => item.gadiNo);
            // if (Array.isArray(action.payload)) {
            //     gadiMastersAdapter.setAll(state, action.payload);
            //     state.gadiNoList = action.payload.map((item: GadiMasters) => item.gadiNo);
            // } else {
            //     // Handle the case where the payload is not an array
            //     // You might want to set state.gadiNoList to an empty array or handle it differently
            //     state.gadiNoList = [];
            // }
            state.status = 'idle';
            state.gadiMastersLoaded = false;

        });
        builder.addCase(fetchGadiMastersAsync.rejected, (state, action) => {
            state.status = 'failed';
            state.gadiMastersLoaded = false;
        });
    })
})


export const gadiMastersSelectors = gadiMastersAdapter.getSelectors((state: RootState) => state.gadiMasters);
export const { setGadiMasters } = gadiMastersSlice.actions;
