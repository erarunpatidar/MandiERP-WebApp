import { styled } from '@mui/system';
import { Table } from '@mui/material';

export const CustomTable = styled(Table)({
    '& .MuiTableCell-root': {
        padding: '3px',
        border: '1px solid #000',
        textAlign: 'center',
        margin: "10px"
        // width: '100px',
    },
    // '.element.style':{
    //     marginBottom: '20px'
    // }
});