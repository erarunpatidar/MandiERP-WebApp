import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../../App";
import ManageVillage from "../../features/village/ManageVillage";
import HomePage from "../../features/home/HomePage";
import ManageItem from "../../features/item/ManageItem";
import ManageUnit from "../../features/unit/ManageUnit";
import ManageAccount from "../../features/account/ManageAccount";
import ManageMandiBill from "../../features/mandiBill/ManageMandiBill";
import ManageKharidiBill from "../../features/kharidiBill/ManageKharidiBill";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: '', element: <HomePage /> },
            { path: 'village', element: <ManageVillage /> },
            { path: 'item', element: <ManageItem /> },
            { path: 'unit', element: <ManageUnit /> },
            { path: 'account', element: <ManageAccount /> },
            { path: 'mandiBill', element: <ManageMandiBill /> },
            { path: 'kharidiBill', element: <ManageKharidiBill /> },
            { path: '*', element: <Navigate replace to='/not-found' /> }
        ]
    }
])