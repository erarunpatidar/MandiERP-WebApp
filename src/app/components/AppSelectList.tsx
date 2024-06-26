import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Button, DialogTitle, Dialog, DialogActions, DialogContent, TextField, Autocomplete, Grid, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useController, UseControllerProps } from "react-hook-form";
import { Add } from "@mui/icons-material";
import { Village } from "../models/village";
import { selectVillage } from "../../features/village/villageSlice";
import { useDispatch } from "react-redux";
import { selectFarmer, selectPurchaser } from "../../features/account/accountSlice";
import AddFarmer from "../../features/mandiBill/AddFarmer";
import AddGadiMasters from "../../features/mandiBill/AddGadiMasters";
import AddVillage from "../../features/account/AddVillage";
import AddBankAccount from "../../features/mandiBill/AddBankAccount";
import { useAppSelector } from "../store/configureStore";
import CustomDialog from "./CustomDialog";
import AddPurchaser from "../../features/mandiBill/AddPurchaser";

type CustomFields = Record<string, any>;

interface Props extends UseControllerProps {
    label: string,
    items: string[],
    required: boolean
    addItem: (data: { customFields: CustomFields }) => void;
    isEditable?: boolean;
    isLoadingItems?: boolean;
}

export default function AppSelectList(props: Props) {
    const { fieldState, field } = useController({ ...props, defaultValue: '' })
    const [newItem, setNewItem] = useState<string | null>(null); // State to store the new item
    const [isDialogOpen, setDialogOpen] = useState(false); // State to control the dialog
    const [isAutocompleteError, setAutocompleteError] = useState(false);
    const sortedItems = [...props.items].sort();
    const { selectedFarmerId } = useAppSelector(state => state.account);
    const [customFields, setCustomFields] = useState({});
    const [isCustomDialogOpen, setCustomDialogOpen] = useState(false);
    // const [isLoading, setLoading] = useState(false);
    const dispatch = useDispatch();


    const handleOpenDialog = () => {
        if (props.label === 'Bank Account' && selectedFarmerId === 0) {
            setCustomDialogOpen(true);
            return;
        }
        else {
            setDialogOpen(true);
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };
    const handleItemClick = async (event: any, selectedItem: string | null) => {
        // setLoading(true);
        // console.log("loading1: ", isLoading);
        try {
            // Call selectItem and pass the selected item

            if (props.label === 'Village' || props.label === 'City') {
                await dispatch(selectVillage(selectedItem));
            }
            if (props.label === 'Farmer Name') {
                await dispatch(selectFarmer(selectedItem));
            }
            if (props.label === 'Farmer Name') {
                await dispatch(selectFarmer(selectedItem));
            }
            if (props.label === 'Purchaser') {
                await dispatch(selectPurchaser(selectedItem));
            }
        } catch (error) {
            console.error('Error selecting item:', error);
        } finally {
            // setLoading(false);
            // console.log("loading2: ", isLoading);
        }
        field.onChange(selectedItem);
    };
    const handleAddItem = () => {
        // setLoading(true);
        console.log("handleAddItem called: fields", customFields);
        try {
            if (customFields !== null) {
                // console.log("newItem:", newItem)
                props.addItem({ customFields }); // Call the addItem function with the new item
                setNewItem(null); // Clear the input field
                setDialogOpen(false); // Close the dialog
                setAutocompleteError(false)
            }
            else {
                console.log("condition not matched");
                setAutocompleteError(true); // Display an error message
            }
        } catch (error) {
            console.error("Error adding item:", error);
        } finally {
            // setLoading(false);
        }

    };
    const handleCustomFieldsChange = (fields: CustomFields) => {
        setCustomFields(fields);
    };

    return (
        <>
            <FormControl fullWidth error={!!fieldState.error}>
                <Grid container alignItems="center">
                    <Grid item xs={10}>
                        {/* <InputLabel>{props.label}</InputLabel> */}
                        {props.isEditable !== false ? (
                            // <Select
                            //     style={{ width: "100%", height: "20%", padding: '2px' }}
                            //     size ='small'
                            //     value={field.value}
                            //     label={props.label}
                            //     onChange={field.onChange}
                            //     required={props.required}

                            // >
                            //     {sortedItems.map((item, index) => (
                            //         <MenuItem value={item} key={index} onClick={() => handleItemClick(item)}>
                            //             {item}
                            //         </MenuItem>
                            //     ))}
                            // </Select>
                            <Autocomplete
                                style={{ padding: '4px' }}
                                size="small"
                                value={field.value || null}
                                options={sortedItems}
                                loading={props.isLoadingItems}
                                onChange={(event, newValue) => handleItemClick(event, newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={props.label}
                                        required={props.required}

                                    />
                                )}
                            />
                        ) : (
                            <TextField
                                style={{ padding: '4px' }}
                                size='small'
                                label={props.label}
                                variant="outlined"
                                value={field.value}
                                disabled={!props.isEditable} // Add disabled prop here
                            />
                        )}
                        {isAutocompleteError && (
                            <FormHelperText error={true}>This field is required</FormHelperText>
                        )}
                    </Grid>
                    <Grid item xs={2}>
                        {props.isEditable !== false && (

                            // <Button onClick={handleOpenDialog} startIcon={<Add />}></Button>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {props.isLoadingItems ? <CircularProgress size={14} /> : <Button onClick={handleOpenDialog} startIcon={<Add />} />}
                            </div>

                        )}
                    </Grid>
                </Grid>

                {/* CustomDialog renders a Dialog when farmer is not selected in case of Bank Account */}
                {(props.label === 'Bank Account' && selectedFarmerId === 0) ? (
                    <CustomDialog
                        open={isCustomDialogOpen}
                        onClose={() => setCustomDialogOpen(false)}
                        message="Select farmer"
                    />
                ) : (
                    <>
                        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                            <DialogTitle>Add New {props.label}</DialogTitle>
                            <DialogContent>
                                {props.label === 'Gadi No' &&
                                    <AddGadiMasters onFieldsChange={handleCustomFieldsChange} />}

                                {props.label === 'Farmer Name' &&
                                    <AddFarmer onFieldsChange={handleCustomFieldsChange} />}
                                {(props.label === 'Village' || props.label === 'City Name') &&
                                    <AddVillage onFieldsChange={handleCustomFieldsChange} />}

                                {(props.label === 'Bank Account') &&
                                    <AddBankAccount onFieldsChange={handleCustomFieldsChange} />}

                                {props.label === 'Purchaser' &&
                                    <AddPurchaser onFieldsChange={handleCustomFieldsChange} />}

                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddItem} color="primary">
                                    Add
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>

                )}


            </FormControl></>
    )
}

