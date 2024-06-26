import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice, current, isAnyOf } from "@reduxjs/toolkit";
import api from "../../app/api/api";
import { RootState, useAppDispatch } from "../../app/store/configureStore";
import { Account } from "../../app/models/account";

//interface for VillageState
interface AccountState {
    account: Account| null,
    status: string;
    accountLoaded:boolean,
    accountTypes: string[],
    searchFilter:string,
    currentPage:number,
    rowsPerPage:5,
    allAccounts: Account[],
    selectedFarmerId: number,
    selectedPurchaserId: number,
    contactNo: string
}

//function that generates a set of prebuilt reducers and selectors for performing CRUD operations on item
const accountsAdapter = createEntityAdapter<Account>();

export const fetchAccountsAsync = createAsyncThunk<Account[], void,{state:RootState}>(
    'account/fetchAccountsAsync',
    async () => {
        try {
            const response = await api.Account.getAccount();
            const data = response.data;
            // console.log("data:", response.data);
            return data;
        } catch (error: any) {
            return error;
        }
    }
)

export const accountSlice = createSlice({
    name: 'acount',
    initialState: accountsAdapter.getInitialState<AccountState>({
        status: 'idle',
        accountLoaded: false,
        account: null,
        accountTypes: ['Capital A/C', 'Bank A/C Balances', 'Expenses', 'Farmers', 'Client', 'Employee'],
        searchFilter: "",
        currentPage: 1,
        rowsPerPage: 5,
        allAccounts: [],
        selectedFarmerId: 0,
        selectedPurchaserId: 0,
        contactNo: "",
    }),
    reducers: {
        setAccount: (state, action) => {
            accountsAdapter.upsertOne(state, action.payload);
            state.accountLoaded = false;
            // state.cities = [action.payload.accountCity];
            // state.accountTypes = [action.payload.accountType];
            // console.log("cities: ", state.cities);
        },
        updateCities: (state, action:PayloadAction<Account[]>) => {
        },
        removeAccount: (state, action) => {
            accountsAdapter.removeOne(state, action.payload);
            state.accountLoaded = false;
        },
        setFilter: (state, action) => {
            state.searchFilter = action.payload;
        },
        setPageNumber: (state, action) => {
            state.accountLoaded = false;
            state.currentPage = action.payload;
        },
        setRowsPerPage: (state, action) => {
            state.accountLoaded = false;
            state.rowsPerPage = action.payload;
        },
        selectFarmer: (state, action) => {
            const selectedName = action.payload;
            const selectedItem = state.allAccounts.find((item) => item.accountName === selectedName);
            // console.log("selected farmer: ", selectedItem);
            if (selectedItem) {
                state.selectedFarmerId= selectedItem.id|| 0;
                state.contactNo = selectedItem.accountMobileNo;
                
            } else {
                console.log("Item not found with name:", selectedName);
            }

        },
        selectPurchaser: (state, action) => {
            const selectedName = action.payload;
            const selectedItem = state.allAccounts.find((item) => item.accountName === selectedName);
            console.log("selected purchaser: ", selectedItem);
            if (selectedItem) {
                state.selectedPurchaserId= selectedItem.id|| 0;                
            } else {
                console.log("purchaser not found with name:", selectedName);
            }

        },

    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchAccountsAsync.pending, (state, action) => {
            // console.log(action);
            state.status = 'loading';
            state.accountLoaded = true;
        });
        builder.addCase(fetchAccountsAsync.fulfilled, (state, action) => {

            accountsAdapter.setAll(state, action.payload);
            state.allAccounts= action.payload.map((item: Account) => item);
            state.status = 'idle';
            state.accountLoaded = false;
            
        });
        builder.addCase(fetchAccountsAsync.rejected, (state, action) => {
            state.status = 'failed';
            // console.log(action.payload);
            state.accountLoaded = false;
        });
    })
})


export const accountSelectors = accountsAdapter.getSelectors((state:RootState) => state.account);
export const {removeAccount, setAccount,setFilter, setPageNumber, setRowsPerPage, selectFarmer, selectPurchaser} = accountSlice.actions;