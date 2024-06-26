import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice, current, isAnyOf } from "@reduxjs/toolkit";
import api from "../../app/api/api";
import { Item } from "../../app/models/item";
import { RootState, store, useAppDispatch } from "../../app/store/configureStore";
import { billDetailSlice, updateCommission } from "../mandiBill/billSlice";
import { useDispatch } from "react-redux";

interface ItemState {
    item: Item | null,
    status: string;
    itemLoaded: boolean,
    searchFilter: string,
    currentPage: number,
    rowsPerPage: 5,
    itemList: string[],
    allItems: Item[]

    //used in billDetails and itemSaleDetails
    percentComission: number
}

//function that generates a set of prebuilt reducers and selectors for performing CRUD operations on item
const itemsAdapter = createEntityAdapter<Item>();

export const fetchItemsAsync = createAsyncThunk<Item[], void, { state: RootState }>(
    'item/fetchItemesAsync',
    async () => {
        try {
            const response = await api.Item.getItem();
            const data = response.data;
            return data;
        } catch (error: any) {
            return error;
        }
    }
)

export const itemSlice = createSlice({
    name: 'item',
    initialState: itemsAdapter.getInitialState<ItemState>({
        status: 'idle',
        itemLoaded: false,
        item: null,
        currentPage: 1,
        searchFilter: '',
        rowsPerPage: 5,
        itemList: [],
        allItems: [],
        percentComission: 0
    }),

    reducers: {
        setPageNumber: (state, action) => {
            state.itemLoaded = false;
            state.currentPage = action.payload;
        },
        setItem: (state, action) => {
            itemsAdapter.upsertOne(state, action.payload);
            state.itemLoaded = false;
        },
        setFilter: (state, action) => {
            state.searchFilter = action.payload;
        },
        setRowsPerPage: (state, action) => {
            state.itemLoaded = false;
            state.rowsPerPage = action.payload;
        },
        removeItem: (state, action) => {
            itemsAdapter.removeOne(state, action.payload);
            state.itemLoaded = false;
        },
        selectItem: (state, action) => {
            const selectedName = action.payload;
            const selectedItem = state.allItems.find((item) => item.itemName === selectedName);
            if (selectedItem) {
                const commission = selectedItem.percentComission || 0;
                // store.dispatch(updateCommission(commission));

                state.percentComission = commission
            } else {
                console.log("Item not found with name:", selectedName);
            }

        },
        
    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchItemsAsync.pending, (state, action) => {
            state.status = 'loading';
            state.itemLoaded = true;
        });
        builder.addCase(fetchItemsAsync.fulfilled, (state, action) => {
            itemsAdapter.setAll(state, action.payload);
            state.itemList = action.payload.map((item: Item) => item.itemName);
            state.allItems = action.payload.map((item: Item) => item);
            state.status = 'idle';
            state.itemLoaded = false;

        });
        builder.addCase(fetchItemsAsync.rejected, (state, action) => {
            state.status = 'failed';
            state.itemLoaded = false;
        });

    })
})


export const itemSelectors = itemsAdapter.getSelectors((state: RootState) => state.item);
export const { removeItem, setItem, setFilter, setPageNumber, selectItem } = itemSlice.actions;

