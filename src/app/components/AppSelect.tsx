import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Button, DialogTitle, Dialog, DialogActions, DialogContent, TextField, Autocomplete, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useController, UseControllerProps } from "react-hook-form";
import { Add } from "@mui/icons-material";
import { Village } from "../models/village";
import { useDispatch } from "react-redux";
import { fetchItemsAsync, selectItem } from "../../features/item/itemSlice";
import { selectUnit } from "../../features/unit/unitSlice";
import { selectVillage } from "../../features/village/villageSlice";


interface Props extends UseControllerProps {
    label: string,
    items: string[],
    required: boolean,
    isEditable?: boolean,
    isLoadingItems?: boolean;
}

export default function AppSelectList(props: Props) {
    const { fieldState, field } = useController({ ...props })
    const [isAutocompleteError, setAutocompleteError] = useState(false);
    const sortedItems = [...props.items].sort();
    // sortedItems.push('');

    const dispatch = useDispatch();

    const handleItemClick = (event: any, selectedItem: string) => {
        field.onChange(selectedItem);
        // console.log(selectedItem);
        // Call selectItem and pass the selected item
        if (selectedItem !== null && selectedItem !== '') {
            if (props.label === 'Item') {
                // console.log("set item");
                dispatch(selectItem(selectedItem));
            }
            if (props.label === 'Unit') {
                console.log("set unit");
                dispatch(selectUnit(selectedItem));
            }
            if (props.label === 'Village') {
                dispatch(selectVillage(selectedItem));
            }
        }

    };

    return (
        <FormControl fullWidth error={!!fieldState.error}>
            {/* <InputLabel>{props.label}</InputLabel> */}
            {props.isEditable !== false ? (
                // <Select
                //     style={{ padding: '2px'}}
                //     size='small'
                //     value={field.value}
                //     label={props.label}
                //     onChange={field.onChange}
                //     required={props.required}


                // // {...props}
                // // {...field}
                // >
                //     {props.isLoadingItems ? (
                //         <CircularProgress size={14} />
                //     ) : (
                //         sortedItems.map((item, index) => (
                //             <MenuItem value={item} key={index} onClick={() => handleItemClick(item)}>
                //                 {item}
                //             </MenuItem>
                //         ))
                //     )}

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
                    // value={field.value}
                    disabled={!props.isEditable} // Add disabled prop here
                />
            )}
            {/* {isAutocompleteError && (
            <FormHelperText error = {true}>This field is required</FormHelperText>
            )} */}
        </FormControl>
    )
}