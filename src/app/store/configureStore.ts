import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { villageSlice } from "../../features/village/villageSlice";
import { itemSlice } from "../../features/item/itemSlice";
import { unitSlice } from "../../features/unit/unitSlice";
import { accountSlice } from "../../features/account/accountSlice";
import { accountBankDetailSlice, billDetailSlice, billSlice, gadiMastersSlice, itemSaleDetailSlice } from "../../features/mandiBill/billSlice";


// manage application's state
export const store = configureStore({
    reducer: {
        village: villageSlice.reducer,
        item: itemSlice.reducer,
        unit: unitSlice.reducer,
        account: accountSlice.reducer,
        bill: billSlice.reducer,
        accountBankDetail:accountBankDetailSlice.reducer,
        billDetail: billDetailSlice.reducer,
        itemSaleDetail: itemSaleDetailSlice.reducer,
        gadiMasters: gadiMastersSlice.reducer
    }
})

export type RootState = ReturnType<typeof store.getState>;  //return types of getState method
export type AppDispatch = typeof store.dispatch;            // type of the dispatch method .

export const useAppDispatch = () => useDispatch<AppDispatch>();     //custom hook for AppDispatch method (send actions to the store, which then trigger changes in the state of your application)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; //custom hook for useSelector hook ( used to select and access specific parts of the Redux store's state.)
