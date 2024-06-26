import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice, current, isAnyOf } from "@reduxjs/toolkit";
import api from "../../app/api/api";
import { Village} from "../../app/models/village";
import { RootState, useAppDispatch } from "../../app/store/configureStore";
import { act } from "react-dom/test-utils";
import { Dispatch } from "react";
import { accountSlice } from "../account/accountSlice";
import { Account } from "../../app/models/account";

//thunk is special type of function that returns a function from a function, (make async function)


//interface for VillageState
interface VillageState {
    village: Village | null,
    status: string;
    villageLoaded:boolean,
    currentPage:number,
    pageSize:number,
    totalItems:0,
    searchTerm: string,
    searchFilter:string,
    rowsPerPage:5,
    cities: string[],
    allVillages: Village[],
    selectedVillageId: number
}

//function that generates a set of prebuilt reducers and selectors for performing CRUD operations on Village
const villagesAdapter = createEntityAdapter<Village>();


export const fetchVillagesAsync = createAsyncThunk<Village[], void,{state:RootState}>(
    'village/fetchVillagesAsync',
    async (_, {dispatch}) => {
        try {
            const response = await api.Village.getVillage();
            const totalItems =parseInt((await response).headers['x-total-count'], 10) || 0;
            const data = response.data;
            return data;
        } catch (error: any) {
            return error;
        }
    }
)


//create village slice and add reducer functions 
export const villageSlice = createSlice({
    name: 'village',
    initialState: villagesAdapter.getInitialState<VillageState>({
        status: 'idle',
        villageLoaded: false,
        village: null,
        currentPage: 1,
        pageSize: 6,
        totalItems: 0,
        searchTerm: '',
        // filter:{columnId:'', value:''},
        searchFilter: '',
        rowsPerPage: 5,
        cities: [],
        allVillages: [],
        selectedVillageId: 0
    }),
    reducers: {
        setPageNumber: (state, action) => {
            state.villageLoaded = false;
            state.currentPage = action.payload;
        },
        setTotalItems:(state, action)=>{
            state.totalItems = action.payload;
        },
        // updateCities:(state, action)=>{
        //     state.cities = [action.payload.name];
        // },
        setSearchTerm:(state, action) => {
            state.searchTerm = action.payload;
        },
        setVillage: (state, action) => {
            villagesAdapter.upsertOne(state, action.payload);
            // state.cities = [action.payload.name]
            state.villageLoaded = false;
        },
        setFilter: (state, action) => {
            state.searchFilter = action.payload;
            // const{columnId, value} = action.payload;
            // state.filter[columnId] = value;

        },
        setRowsPerPage: (state, action) => {
            state.villageLoaded = false;
            state.rowsPerPage = action.payload;
        },
        removeVillage: (state, action) => {
            villagesAdapter.removeOne(state, action.payload);
            state.villageLoaded = false;
        },
        selectVillage: (state, action) => {
            const selectedName = action.payload;
            const selectedItem = state.allVillages.find((item) => item.villageName === selectedName);
            if (selectedItem) {
                state.selectedVillageId= selectedItem.id|| 0;
                console.log("id , villageName:", selectedName, state.selectedVillageId);
                
            } else {
                console.log("Item not found with name:", selectedName);
            }

        },
    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchVillagesAsync.pending, (state, action) => {
            // console.log(action);
            state.status = 'loading';
            state.villageLoaded = true;
        });
        builder.addCase(fetchVillagesAsync.fulfilled, (state, action) => {
            villagesAdapter.setAll(state, action.payload);
            state.cities = action.payload.map((item: Village) => item.villageName);
            // state.cities = action.payload;
            state.allVillages = action.payload.map((item: Village) => item);
            state.status = 'idle';
            state.villageLoaded = false;
            
        });
        builder.addCase(fetchVillagesAsync.rejected, (state, action) => {
            state.status = 'failed';
            state.villageLoaded = false;
        });
    })
})


export const villageSelectors = villagesAdapter.getSelectors((state:RootState) => state.village);
export const { setPageNumber,removeVillage, setVillage, setTotalItems, setSearchTerm, setFilter,setRowsPerPage, selectVillage} = villageSlice.actions;



