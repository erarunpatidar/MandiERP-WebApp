// import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Pages, Search, Add, Clear } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Village } from '../../app/models/village';
import React, { useState, useEffect } from 'react';

import VillageForm from "./VillageForm";
import api from "../../app/api/api";
import AppPagination from "../../app/components/AppPagination";
import { RootState, useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { fetchVillagesAsync, removeVillage, setFilter, setPageNumber, setRowsPerPage, setSearchTerm, setVillage, villageSelectors } from "./villageSlice";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Input, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { GridColDef, GridCellParams, DataGrid, GridToolbar } from "@mui/x-data-grid";

export default function ManageVillage() {
    const dispatch = useAppDispatch();

    const villages = useAppSelector(villageSelectors.selectAll);
    const { villageLoaded, pageSize, totalItems, currentPage, rowsPerPage } = useAppSelector(state => state.village);
    const filters = useAppSelector((state: RootState) => state.village.searchFilter);

    //hooks for data, edit data  and pagination  
    // const [data, setData] = useState([{ id: 0, name: "", type: "" }]);
    const [editMode, setEditMode] = useState(false);
    const [selectedVillage, setSelectedVillage] = useState<Village | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [villageToDelete, setVillageToDelete] = useState<Village | null>(null);


    const itemCount = Math.ceil(villages.length / rowsPerPage);

    useEffect(() => {
        // fetchData();
        if (!villageLoaded) {
            dispatch(fetchVillagesAsync());
            // console.log("data:", villages);
        }
    }, [villageLoaded, villages, dispatch]);

    function handleSelectVillage(village: Village) {
        setSelectedVillage(village);
        setEditMode(true);
    }

    function cancelEdit() {
        if (selectedVillage) setSelectedVillage(undefined);
        setEditMode(false);
    }

    // delete record

    const handleDelete = (village: Village) => {
        setVillageToDelete(village);
        setDeleteConfirmationOpen(true);
    };

    const handleDeleteConfirmed = () => {
        if (villageToDelete) {
            setLoading(true);
            api.Village.deleteVillage(villageToDelete.id)
                .then(() => {
                    dispatch(removeVillage(villageToDelete.id));
                })
                .catch((error) => console.error('Error deleting data:', error))
                .finally(() => setLoading(false));
        }
        setDeleteConfirmationOpen(false);
    };

    const handleDeleteCanceled = () => {
        setDeleteConfirmationOpen(false);
    };

    //Search record
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
        dispatch(setPageNumber(1));


    };

    const filteredData = villages.filter((record) => {
        return Object.values(record).some((value) =>
            value.toString().toLowerCase().includes(filters.toLowerCase())
        );
    });

    const onSearch = () => {
        dispatch(setVillage(filteredData));
    }

    const handleClearSearch = () => {
        dispatch(setFilter(''));
    };
    const handlePageChange = async (event: any, newPage: number) => {
        dispatch(setPageNumber(newPage));
    };

    //call VillageForm component for edit or create record
    if (editMode) return <VillageForm village={selectedVillage} cancelEdit={cancelEdit} />

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', type: 'number', headerClassName: 'super-app-theme--header bold-header', cellClassName: 'super-app-theme--cell', align: "left", headerAlign: "left", width: 100 },
        { field: 'villageName', headerName: 'Village Name', headerClassName: 'super-app-theme--header bold-header', type: 'string', width: 400, editable: true },
        { field: 'villageNameHindi', headerName: 'Village Name (Hindi)', headerClassName: 'super-app-theme--header bold-header', width: 400, editable: true, },
        {
            field: 'Action', headerName: 'Action', align: "center", headerClassName: 'super-app-theme--header bold-header', headerAlign: "center", width: 250,
            renderCell: (params: GridCellParams) => {
                return (
                    <div>
                        <Button onClick={() => handleSelectVillage(params.row)} startIcon={<Edit />} />
                        <LoadingButton loading={loading} onClick={() => handleDelete(params.row)} startIcon={<Delete />} color='error' />
                    </div>
                )
            }
        },
    ];

    return (
        <>
            <Typography variant="h4">Village</Typography>
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Box display="flex" alignItems="center" margin="10px">
                        <TextField
                            style={{ padding: 4, width: 150 }}
                            size="small"
                            label="Search Village"
                            variant="outlined"
                            value={filters}
                            onChange={handleSearch}
                        />
                        <Button onClick={onSearch} startIcon={<Search />} />
                        <Button onClick={handleClearSearch} startIcon={<Clear />} />
                    </Box>
                </Grid>
                <Grid item>
                    <Box display="flex" justifyContent="flex-end" margin="10px">
                        <Button onClick={() => setEditMode(true)} startIcon={<Add />}>
                            Create Village
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <DataGrid sx={{
                '& .super-app-theme--header': {
                    backgroundColor: '#4c5667',
                },
                '& .bold-header': {
                    fontWeight: 'bold',
                    color: '#ffffff'
                },
            }}
                editMode="row" rows={filteredData}
                columns={columns}
                slots={{ toolbar: GridToolbar }}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: rowsPerPage, page: 0 },

                    },
                }}
            // checkboxSelection
            // disableRowSelectionOnClick
            />
            {/* </Box> */}

            <Dialog open={isDeleteConfirmationOpen}
                onClose={handleDeleteCanceled}
                aria-labelledby="delete-confirmation-title"
                aria-describedby="delete-confirmation-description">
                <DialogTitle id="delete-confirmation-title">Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-confirmation-description">
                        Are you sure you want to delete the village "{villageToDelete?.villageName}"?
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
            {/* <Pagination count={itemCount} page={currentPage} onChange={handlePageChange} color="primary" defaultPage={currentPage}/> */}
            {/* <AppPagination currentPage = {currentPage} totalPages={itemCount} /> */}



        </>
    )
}


