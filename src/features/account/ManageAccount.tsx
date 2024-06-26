import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { accountSelectors, fetchAccountsAsync, removeAccount, setAccount, setFilter, setPageNumber } from "./accountSlice";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Pagination } from "@mui/material";
import { Account } from "../../app/models/account";
import AccountForm from "./AccountForm";
import { fetchVillagesAsync } from "../village/villageSlice";
import { Edit, Delete } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import api from "../../app/api/api";

export default function ManageAccount() {
    const dispatch = useAppDispatch();

    const accounts = useAppSelector(accountSelectors.selectAll);
    const { accountLoaded, searchFilter, currentPage, rowsPerPage } = useAppSelector(state => state.account);

     //hooks for data, edit data  and pagination  
     const [editMode, setEditMode] = useState(false);
     const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
     const [loading, setLoading] = useState(false);
     const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<Account| null>(null);

    const itemCount = Math.ceil(accounts.length / rowsPerPage);

    useEffect(() => {
        // fetchData()
        if (!accountLoaded) {
            dispatch(fetchAccountsAsync());
        }

    }, [accountLoaded, accounts, dispatch]);
    

    function handleSelectAccount(account: Account) {
        setSelectedAccount(account);
        setEditMode(true);
    }

    function cancelEdit() {
        if (selectedAccount) setSelectedAccount(undefined);
        setEditMode(false);
    }

    // delete record
    const handleDelete = (account: Account) => {
        setAccountToDelete(account);
        setDeleteConfirmationOpen(true);
    };

    const handleDeleteConfirmed = () => {
        if(accountToDelete){
            setLoading(true);
            api.Account.deleteAccount(accountToDelete.id)
                .then(() => {
                    dispatch(removeAccount(accountToDelete.id));
                })
                .catch((error) => console.error('Error deleting data:', error))
                .finally(() => setLoading(false));
        }
        setDeleteConfirmationOpen(false);
    };

    const handleDeleteCanceled = () => {
        setDeleteConfirmationOpen(false);
    };

    //search record
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
        dispatch(setPageNumber(1));

    };

    const filteredData = accounts.filter((record) => {
        return Object.values(record).some((value) =>
            value.toString().toLowerCase().includes(searchFilter.toLowerCase())
        );
    });
    
    const onSearch = () => {
        dispatch(setAccount(filteredData));
    }

    const handleClearSearch = () => {
        dispatch(setFilter(''));
    };

    // Get current page
    const handlePageChange = async (event: any, newPage: number) => {
        dispatch(setPageNumber(newPage));
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', type:'number', width: 70 },
        { field: 'accountCity', headerName: 'City Name', width: 150,editable: true },
        { field: 'accountName', headerName: 'Account Name', width: 150,editable: true },
        { field: 'accountNameHindi', headerName: 'Account Name (Hindi)', width: 150,editable: true  },
        { field: 'accountType', headerName: 'Account Type', width: 150,editable: true },
        { field: 'accountFirmName', headerName: 'Firm Name', width: 150,editable: true },
        { field: 'accountFirmName(Hindi)', headerName: 'Firm Name (Hindi)', width: 150,editable: true },
        { field: 'accountSortName', headerName: 'Sort Name', width: 150,editable: true },
        { field: 'emailId', headerName: 'Email Id', width: 150,editable: true },
        { field: 'accountMobileNo', headerName: 'Mobile No.', width: 150,editable: true },
        { field: 'accountAddress1', headerName: 'Address 1', width: 150,editable: true },
        { field: 'accountAddress2', headerName: 'Address 2', width: 150,editable: true },
        { field: 'License No', headerName: 'License No', width: 150,editable: true },
        { field: 'Action', headerName: 'Action', width: 150,
        renderCell:(params:GridCellParams) => {
            return(
                <div>
                <Button onClick={() => handleSelectAccount(params.row)} startIcon={<Edit />} />
                <LoadingButton loading={loading} onClick={() => handleDelete(params.row)} startIcon={<Delete />} color='error' />
                </div>
            )
        }
     },
    ];

    if (editMode) return <AccountForm account={selectedAccount} cancelEdit={cancelEdit} />

    return (
        <><Box>
        <Typography variant="h4">Account</Typography>
        <Button onClick={() => setEditMode(true)}>Create</Button>
    </Box>
        <TextField
            label="Search Account"
            variant="outlined"
            value={searchFilter}
            onChange={handleSearch}
        />
        <Button onClick={onSearch}>Search Account</Button>
        <Button onClick={handleClearSearch}>Clear Search</Button>
        <DataGrid editMode="row" rows={filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)} columns={columns} 
    // components={{Toolbar: () => (<div><GridToolbar /></div> ),}}
    
        pagination components={{Pagination: () => (<Pagination count={itemCount} page={currentPage} onChange={handlePageChange} color="secondary" defaultPage={currentPage}/>)}}
    />
    <Dialog open={isDeleteConfirmationOpen}
                onClose={handleDeleteCanceled}
                aria-labelledby="delete-confirmation-title"
                aria-describedby="delete-confirmation-description">
                <DialogTitle id="delete-confirmation-title">Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-confirmation-description">
                        Are you sure you want to delete the account "{accountToDelete?.accountName}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCanceled} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirmed} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

    </>
    )

}