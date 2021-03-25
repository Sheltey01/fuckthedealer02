import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid'

export default function ScrollDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <Grid item xs={12} align="center">
      <Button color="default" variant="contained" onClick={handleClickOpen}>
          User manual
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">User manual</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {"Before you start the Fuck the Dealer drinking game,"+
            " the dealer asks the first player (typically whoever is to their left) to guess the card from the"+
            " top of the deck's suit (Hearts / Diamonds / Spades / Clubs). Should they guess right, "+
            "the dealer drinks (10) and the next player's turn begins."+
            " If the first guess of the card's suit was incorrect,"+
            " the same player must now guess what the value of the next card pulled will be."+
            " Should they guess correctly, their turn ends and the dealer drinks (5)"+
            " If the guesser didn't get the value of the card right in their second guess, the guesser drink the difference of the first and the second guess."+
            " After that the player next to him is now the guesser."+
            " You can add variable rules such as 2 players in a row must guess incorrectly all 3 times in order for dealer to change"+
            " if you want, or you can remove any one of the three questions that you see fit."+
            " If the dealer doesn't change before all cards in the deck are used, a new dealer begins with the new deck."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}