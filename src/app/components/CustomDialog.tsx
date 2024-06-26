// CustomDialog.js
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
  message: string;
  onYes?: boolean;
  onYesClick?: () => void;
}

const CustomDialog = ({ open, onClose, message, onYes, onYesClick }: CustomDialogProps) => {
 
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Alert</DialogTitle>
      <DialogContent>
        <p>{message}</p>
      </DialogContent>
      <DialogActions>
      {onYes === true ? (
          <Button onClick={onYesClick} color="primary">
            Yes
          </Button>
        ) : null}
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
