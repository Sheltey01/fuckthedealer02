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
            {"To start the game the dealer asks the person to their left what is the card on top of the deck. The dealer then checks to see if the guess was right. If the guess was right then the dealer has to take 10 drinks from their drink. If the first guess was wrong then the dealer tells the person guessing if the card is “Higher” or “Lower” than their guess."+
             " The player guessing then gets to guess again. If the person now guesses the correct card then the dealer has to take 5 drinks from their beer. If the second guess was also wrong then the person guessing has to drink as many drinks as the difference between their guess and the real value of the card. For example if on the second guess the person guessed a “4” and the real card is an '8'"+ 
             ", then they must take 4 drinks. Take the real card and place it on the table. After a few rounds you will be able to see what cards have already been used and it will help you in guessing."+
             " Game play then continues around the circle clockwise. If three consecutive players to not guess the right card then the person who is the dealer moves to the next person on the left of the dealer. The game plays until there are no more cards left in the deck."}
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