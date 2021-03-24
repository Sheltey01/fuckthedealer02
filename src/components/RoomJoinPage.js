import React, { Component } from "react"
import {TextField, Button, GridList, Typography, Grid} from "@material-ui/core"
import {Link} from "react-router-dom"
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'

export default class RoomJoinPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            roomCode: "",
            error: ""
        };
        this.handleTextfieldUpdates = this.handleTextfieldUpdates.bind(this);
        this.roomButtonPressed = this.roomButtonPressed.bind(this)
        this.handleUsernameChanged = this.handleUsernameChanged.bind(this)
    }

    handleTextfieldUpdates(e) {
        this.setState({
            roomCode: e.target.value
        });
    }

    handleUsernameChanged(e) {
        this.setState({
          username: e.target.value
        })
      }

    roomButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: this.state.roomCode,
                username: this.state.username
            }),
        };
        fetch("/api/join-room", requestOptions)
        .then((response) =>{
            if(response.ok) {
                this.props.history.push(`/room/${this.state.roomCode}`)
            } else 
            {
                this.setState({
                    error: "Error"
                });
            }
        }).catch((error) => {console.log(error)})
    }

    render() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Join a Room
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <TextField
                        error={this.state.error}
                        label="Code"
                        align="center"
                        placeholder="Enter a Room code"
                        value={this.state.roomCode}
                        helperText={this.state.error}
                        onChange={this.handleTextfieldUpdates}
                        variant="outlined"/>
                </Grid>
                <Grid item xs={12} align="center">
                <FormControl>x
                  <TextField
                    required={true}
                    onChange={this.handleUsernameChanged}
                    inputProps={{
                      style: { textAlign: "center" },
                    }}></TextField>
                <FormHelperText>
                  <div align="center">Your username</div>
                </FormHelperText>
                </FormControl>
                </Grid>
                <Grid item xs={12} align="center"x>
                <Button 
                        variant="contained" 
                        color="primary"
                        onClick={this.roomButtonPressed}>
                            Enter room
                    </Button>
                </Grid>
                <Grid item xs={12} align="center">
                <Button 
                        variant="contained" 
                        color="secondary" 
                        to="/" 
                        component={Link}>
                            Back
                    </Button>
                </Grid>
            </Grid>
        )
    }
}