import React from "react";
import Button from "@material-ui/core/Button";
import { DataGrid } from "@material-ui/data-grid";
import Grid from "@material-ui/core/Grid";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  paper: {
    marginRight: theme.spacing(2),
  },
}));

export default function DealerMenu(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [cardForDealer, setCardForDealer] = React.useState({});
  const anchorRef = React.useRef(null);
  const prevOpen = React.useRef(open);

  React.useEffect(() => {
    var dealerCardToRoomNumberInterval = setInterval(getDealerCardToRoomNumber, 1500);
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    return () => {
      clearInterval(dealerCardToRoomNumberInterval);
    };
  }, [open]);

  function getDealerCardToRoomNumber() {
    if (props.currentUser != null && props.currentUser.type == 1) {
      fetch("/api/get-dealercard" + "?code=" + props.roomCode)
        .then((response) => {
          if (response.status == 204) {
            location.reload();
            return null;
          }
          return response.json();
        })
        .then((data) => {
          if (data != null) {
            setCardForDealer({
              number: data.nummer,
              type: data.type,
            });
          }
        });
    }
  }

  function createMessage(message) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        room_code: props.roomCode,
        player_code: props.currentUser.id,
      }),
    };
    fetch("/api/create-message", requestOptions).then(() => {});
  }

  function dealerSendTip(correct, exen) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_code: props.roomCode,
        value: correct,
        exen: exen,
      }),
    };
    fetch("/api/send-dealertip", requestOptions).then(() => {});
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  function intToLetterConverter(type) {
    switch (type) {
      case 1:
        return "H";
      case 2:
        return "D";
      case 3:
        return "S";
      case 4:
        return "C";
    }
  }

  function drawDealerImage() {
    return (
      <img
        height={120}
        width={90}
        style={{ "margin-bottom": 15, "margin-left": "30%" }}
        align="center"
        src={
          require("../images/" +
            cardForDealer.number +
            "_" +
            intToLetterConverter(cardForDealer.type) +
            ".png").default
        }
      />
    );
  }

  return (
    <Grid item xs={12} align="center">
      <div style={{ height: 170, "margin-top": 15, width: "60%", float: "left" }}>
        <DataGrid
          rows={props.users}
          disableColumnMenu={true}
          hideFooter={true}
          columns={[
            { field: "username", headerName: "Username", width: 120 },
            {
              field: "type",
              headerName: "Type",
              width: 130,
              valueFormatter: ({ value }) =>
                value === 0 ? "Player" : value === 1 ? "Dealer" : "Guesser",
            },
            { field: "tries", headerName: "Tries", width: 120 },
          ]}
        />
      </div>
      {cardForDealer.number == null ? null : 
      <div style={{ width: "30%", float: "left", "margin-top": 15, "padding-left": 20}}>
        {drawDealerImage()}
        <div className={classes.root}>
          <div  style={{position: "absolute", right: "10%", transform: "translate(3%, 0%)"}}>
            <Button
              ref={anchorRef}
              aria-controls={open ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              style={{width: "130%"}}
              variant="contained"
              disabled={!props.currentUser.canTip}
              color="primary"
              onClick={handleToggle}>
              Dealer Menu
            </Button>
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              placement={"right-start"}
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList
                        autoFocusItem={open}
                        id="menu-list-grow"
                        onKeyDown={handleListKeyDown}>
                        <MenuItem onClick={(e) => {handleClose(e); createMessage("The guess is correct!"); dealerSendTip(true, false); }}>Corrent</MenuItem>
                        <MenuItem onClick={(e) => {handleClose(e); createMessage("The guess is incorrect!"); dealerSendTip(false, false); }} style={{display:props.users.find((u) => u.type == 2).guesserTries >= 2 ? "block" : "none"}}>Incorrect</MenuItem>
                        <MenuItem onClick={(e) => {handleClose(e); createMessage("The card is higher!"); dealerSendTip(false); }} style={{display:props.users.find((u) => u.type == 2).guesserTries < 2 ? "block" : "none"}} >Higher</MenuItem>
                        <MenuItem onClick={(e) => {handleClose(e); createMessage("The card is lower!"); dealerSendTip(false, false);}} style={{display:props.users.find((u) => u.type == 2).guesserTries < 2 ? "block" : "none"}} >Lower</MenuItem>
                        <MenuItem onClick={(e) => {handleClose(e); createMessage("Exen!"); dealerSendTip(false, true); }}>Exen</MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </div>
        </div>
      </div>}
    </Grid>
  );
}
