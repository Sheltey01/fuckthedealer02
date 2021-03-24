import React from "react"
import {Button, Grid} from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";

export default function NormalMenu(props) {
    return (
        <Grid item xs={12}>
        <div style={{ height: 170, "margin-top": 15 }}>
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
      </Grid>
    )
}