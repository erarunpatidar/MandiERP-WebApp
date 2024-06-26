import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice, current, isAnyOf } from "@reduxjs/toolkit";
import api from "../../app/api/api";
import { RootState, useAppDispatch } from "../../app/store/configureStore";
import { Unit } from "../../app/models/unit";
import { stat } from "fs";

//interface for VillageState
interface UnitState {
    unit: Unit| null,
    status: string;
    unitLoaded:boolean,
    searchFilter:string,
    currentPage:number,
    rowsPerPage:5,
    unitList: string [],
    allUnits: Unit[], 
    //used in billDetails
    weightCutting: number,
    tulai:number,
    hammali: number,
    hammaliBillDetail: number,
    tulaiBillDetail: number,
    weightCuttingBillDetail: number,
}

//function that generates a set of prebuilt reducers and selectors for performing CRUD operations on item
const unitsAdapter = createEntityAdapter<Unit>();

export const fetchUnitsAsync = createAsyncThunk<Unit[], void,{state:RootState}>(
    'unit/fetchUnitsAsync',
    async () => {
        try {
            const response = await api.Unit.getUnit();
            const data = response.data;
            return data;
        } catch (error: any) {
            return error;
        }
    }
)

export const unitSlice = createSlice({
    name: 'unit',
    initialState: unitsAdapter.getInitialState<UnitState>({
        unit: null,
        status: 'idle',
        unitLoaded: false,
        searchFilter: '',
        currentPage: 1,
        rowsPerPage: 5,
        unitList: [],
        allUnits: [],
        weightCutting: 0,
        tulai: 0,
        hammali: 0,
        hammaliBillDetail: 0,
        tulaiBillDetail: 0,
        weightCuttingBillDetail: 0
    }),
    reducers: {
        setUnit: (state, action) => {
            unitsAdapter.upsertOne(state, action.payload);
            state.unitLoaded = false;
        },
        removeUnit: (state, action) => {
            unitsAdapter.removeOne(state, action.payload);
            state.unitLoaded = false;
        },
        setFilter: (state, action) => {
            state.searchFilter = action.payload;
        },
        setPageNumber: (state, action) => {
            state.unitLoaded = false;
            state.currentPage = action.payload;
        },
        setRowsPerPage: (state, action) => {
            state.unitLoaded = false;
            state.rowsPerPage = action.payload;
        },
        selectUnit: (state, action) => {
            const dispatch = action.payload.dispatch;
            const selectedName = action.payload;
            const selectedItem = state.allUnits.find((item) => item.itemUnit1 === selectedName);
            if (selectedItem) {
                // state.percentComission = commission
                state.weightCutting = selectedItem.weightCuttingPerUnit || 0;
                state.weightCuttingBillDetail = selectedItem.weightCuttingPerUnit || 0;
                state.tulai = selectedItem.tulaiPerUnit || 0;
                state.tulaiBillDetail = selectedItem.tulaiPerUnit || 0;
                state.hammali = selectedItem.hammaliPerUnit || 0;
                state.hammaliBillDetail =  selectedItem.hammaliPerUnit || 0;
                
            } else {
                console.log("Item not found with name:", selectedName);
            }

        },
        updateHammaliAndTulai: (state, action) => {
            const {hammali, tulai, weightCutting} = action.payload;
            state.hammali = hammali;
            state.tulai = tulai;
            state.weightCutting = weightCutting;
            // console.log("ham in slice:", state.hammali);
            // console.log("hamBill in slice:", state.hammaliBillDetail);
        },

    },
    //add extra reducers to set state afer action
    extraReducers: (builder => {
        builder.addCase(fetchUnitsAsync.pending, (state, action) => {
            state.status = 'loading';
            state.unitLoaded = true;
        });
        builder.addCase(fetchUnitsAsync.fulfilled, (state, action) => {
            unitsAdapter.setAll(state, action.payload);
            state.unitList = action.payload.map((item: Unit) => item.itemUnit1);
            state.allUnits = action.payload.map((item: Unit) => item);
            state.status = 'idle';
            state.unitLoaded = false;
            
        });
        builder.addCase(fetchUnitsAsync.rejected, (state, action) => {
            state.status = 'failed';
            state.unitLoaded = false;
        });
    })
})


export const unitSelectors = unitsAdapter.getSelectors((state:RootState) => state.unit);
export const {removeUnit, setUnit, setFilter, setPageNumber, setRowsPerPage, selectUnit, updateHammaliAndTulai} = unitSlice.actions;