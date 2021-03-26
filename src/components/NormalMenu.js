import React from "react";
import { Grid } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";

export default function NormalMenu(props) {
  const [cardsInStack, setCardsInStack] = React.useState(0);

  React.useEffect(() => {
    var cardStackInterval = setInterval(getCardStack, 1000);
    return () => {
      clearInterval(cardStackInterval);
    };
  }, [cardsInStack])

  function getCardStack() {
    fetch("/api/get-card-count" + "?code=" + props.roomCode)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data != null) {
            setCardsInStack(data.cardsInStack)
          }
        });
  }

  function drawCardStackImage() {
    return (
      <div className="container">
        <img
          height={"60%"}
          width={"40%"}
          style={{ marginBottom: 15, paddingLeft: "28%", minWidth: "50px" }}
          align="center"
          src={require("../images/purple_back.png").default}
        />
        <h1 className="cardOfStackCentered">{cardsInStack}</h1>
      </div>
    );
  }

  return (
    <Grid item xs={12}>
      <div style={{ height: 170, marginTop: 15, width: "60%", float: "left" }}>
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
      <div
        style={{ width: "30%", float: "left", marginTop: 15, paddingLeft: 20 }}>
        {drawCardStackImage()}
      </div>
    </Grid>
  );
}
