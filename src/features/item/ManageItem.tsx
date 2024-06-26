import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { fetchItemsAsync, itemSelectors, removeItem, setFilter, setItem, setPageNumber } from "./itemSlice";
import { Edit, Delete } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Box, Typography, TextField, Pagination, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Item } from "../../app/models/item";
import api from "../../app/api/api";
import ItemForm from "./ItemForm";
import AppPagination from "../../app/components/AppPagination";
import { GridColDef, GridCellParams, DataGrid } from "@mui/x-data-grid";

export default function ManageItem() {

    const dispatch = useAppDispatch();

    const items = useAppSelector(itemSelectors.selectAll);
    const { itemLoaded } = useAppSelector(state => state.item);
    const { currentPage, rowsPerPage } = useAppSelector(state => state.item);
    const filters = useAppSelector(state => state.item.searchFilter);

    //hooks for data, edit data  and pagination  
    const [editMode, setEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

    // console.log("data:", items);
    const itemCount = Math.ceil(items.length / rowsPerPage);
    const totalCount = items.length;
    useEffect(() => {
        // fetchData();
        if (!itemLoaded) {
            dispatch(fetchItemsAsync());
        }
    }, [itemLoaded, items, dispatch]);

    function handleSelectItem(item: Item) {
        setSelectedItem(item);
        setEditMode(true);
    }

    function cancelEdit() {
        if (selectedItem) setSelectedItem(undefined);
        setEditMode(false);
    }

    // delete record
    const handleDelete = (item: Item) => {
        setItemToDelete(item);
        setDeleteConfirmationOpen(true);
    };

    const handleDeleteConfirmed = () => {
        if (itemToDelete) {
            setLoading(true);
            api.Item.deleteItem(itemToDelete.id)
                .then(() => {
                    dispatch(removeItem(itemToDelete.id));
                })
                .catch((error) => console.error('Error deleting data:', error))
                .finally(() => setLoading(false));
        }
        setDeleteConfirmationOpen(false);
    };

    const handleDeleteCanceled = () => {
        setDeleteConfirmationOpen(false);
    };


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
        dispatch(setPageNumber(1));

    };

    const filteredData = items.filter((record) => {
        return Object.values(record).some((value) =>
            value.toString().toLowerCase().includes(filters.toLowerCase())
        );
    });


    const onSearch = () => {
        dispatch(setItem(filteredData));
    }

    const handleClearSearch = () => {
        dispatch(setFilter(''));
    };

    // Get current page
    const handlePageChange = async (event: any, newPage: number) => {
        dispatch(setPageNumber(newPage));
    };

    if (editMode) return <ItemForm item={selectedItem} cancelEdit={cancelEdit} />

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', type:'number', width: 70 },
        { field: 'itemName', headerName: 'Item Name', type:'string', width: 150,editable: true },
        { field: 'itemNameHindi (Hindi)', headerName: 'Item Name (Hindi)', width: 150,editable: true  },
        { field: 'rateOfUnitinKgs', headerName: 'Rate of Unit (kg)',type:'number', width: 150,editable: true },
        { field: 'percentComission', headerName: 'Commission (%)',type:'number', width: 150,editable: true },
        { field: 'Action', headerName: 'Action', width: 150,
        renderCell:(params:GridCellParams) => {
            return(
                <div>
                <Button onClick={() => handleSelectItem(params.row)} startIcon={<Edit />} />
                <LoadingButton loading={loading} onClick={() => handleDelete(params.row)} startIcon={<Delete />} color='error' />
                </div>
            )
        }
     },
    ];

    return (
        <><Box>
            <Typography variant="h4">Item</Typography>
            <Button onClick={() => setEditMode(true)}>Create</Button>
        </Box>
            <TextField
                label="Search Item"
                variant="outlined"
                value={filters}
                onChange={handleSearch}
            />
            <Button onClick={onSearch}>Search Item</Button>
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
                        Are you sure you want to delete the item "{itemToDelete?.itemName}"?
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
            {/* <Pagination count={itemCount} page={currentPage} onChange={handlePageChange} color="secondary" defaultPage={currentPage} /> */}
            {/* <AppPagination totalPages={itemCount} currentPage={currentPage} /> */}

        
        </>
    )
}