import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { fetchUnitsAsync, removeUnit, setFilter, setPageNumber, setUnit, unitSelectors } from "./unitSlice";
import { DataGrid, GridCellParams, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Pagination, TextField, Toolbar, Typography } from "@mui/material";
import api from "../../app/api/api";
import { LoadingButton } from "@mui/lab";
import { Delete, Edit } from "@mui/icons-material";
import { Unit } from "../../app/models/unit";
import UnitForm from "./UnitForm";

export default function ManageUnit() {
    const dispatch = useAppDispatch();
    const units = useAppSelector(unitSelectors.selectAll);
    const { unitLoaded } = useAppSelector(state => state.unit);
    const filters = useAppSelector(state => state.unit.searchFilter);
    const { currentPage, rowsPerPage } = useAppSelector(state => state.unit);

    //hooks for data, edit data  and pagination  
    const [editMode, setEditMode] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit| undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

    const itemCount = Math.ceil(units.length / rowsPerPage);

    useEffect(() => {
        if (!unitLoaded) {
            dispatch(fetchUnitsAsync());
        }
    }, [unitLoaded, units, dispatch]);

    function handleSelectUnit(unit: Unit) {
        setSelectedUnit(unit);
        setEditMode(true);
    }

    function cancelEdit() {
        if (selectedUnit) setSelectedUnit(undefined);
        setEditMode(false);
    }

    // delete record
    const handleDelete = (unit: Unit) => {
        setUnitToDelete(unit);
        setDeleteConfirmationOpen(true);
    };

    const handleDeleteConfirmed = () => {
        if (unitToDelete) {
            setLoading(true);
            api.Unit.deleteUnit(unitToDelete.id)
                .then(() => {
                    dispatch(removeUnit(unitToDelete.id));
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

    const filteredData = units.filter((record) => {
        return Object.values(record).some((value) =>
            value.toString().toLowerCase().includes(filters.toLowerCase())
        );
    });
    
    const onSearch = () => {
        dispatch(setUnit(filteredData));
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
        { field: 'itemUnit1', headerName: 'Unit Name', type:'string', width: 150,editable: true },
        { field: 'itemUnit(Hindi)', headerName: 'Unit Name (Hindi)', width: 150,editable: true  },
        { field: 'weightCuttingPerUnit', headerName: 'Weight Cutting PerUnit',type:'number', width: 150,editable: true },
        { field: 'hammaliPerUnit', headerName: 'Hammali PerUnit',type:'number', width: 150,editable: true },
        { field: 'tulaiPerUnit', headerName: 'Tulai PerUnit',type:'number', width: 150,editable: true },
        { field: 'khadiKariPerUnit', headerName: 'KhadiKari PerUnit',type:'number', width: 150,editable: true },
        { field: 'Action', headerName: 'Action', width: 150,
        renderCell:(params:GridCellParams) => {
            return(
                <div>
                <Button onClick={() => handleSelectUnit(params.row)} startIcon={<Edit />} />
                <LoadingButton loading={loading} onClick={() => handleDelete(params.row)} startIcon={<Delete />} color='error' />
                </div>
            )
        }
     },
    ];

    if (editMode) return <UnitForm unit={selectedUnit} cancelEdit={cancelEdit} />

    return (
        <><Box>
            <Typography variant="h4">Unit</Typography>
            <Button onClick={() => setEditMode(true)}>Create</Button>
        </Box>
        <TextField
                label="Search Unit"
                variant="outlined"
                value={filters}
                onChange={handleSearch}
        />
        <Button onClick={onSearch}>Search Unit</Button>
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
                        Are you sure you want to delete the unit "{unitToDelete?.itemUnit1}"?
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