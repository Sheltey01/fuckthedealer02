import React, { Component } from "react"
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import { Link } from 'react-router-dom'
import {Collapse} from '@material-ui/core';
import {Alert} from '@material-ui/lab'


export default class CreateRoomPage extends Component{
  static defaultProps = {
    maximal_player: 3,
    username: "",
    roomCode: null,
    updateCallback: () => {}
  }  
    
    constructor(props) {
        super(props);
        this.state = {
            maximal_player: this.props.maximal_player,
            username: this.props.username,
            errorMag: "",
            successMsg: ""
        };
        this.handleMaximalPlayerChanged = this.handleMaximalPlayerChanged.bind(this)
        this.handleUsernameChanged = this.handleUsernameChanged.bind(this)
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
        this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this)
    } 

    handleMaximalPlayerChanged(e) {
        this.setState({
            maximal_player: e.target.value
        })
    }

    handleUsernameChanged(e) {
      this.setState({
        username: e.target.value
      })
    }

    renderCreateButtons() {
      return (
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <Button
                color="primary"
                variant="contained"
                onClick={this.handleRoomButtonPressed}>
              Create A Room
            </Button>
          </Grid>
        <Grid item xs={12} align="center">
            <Button color="secondary" variant="contained" to="/" component={Link}>
              Back
              </Button>
              </Grid>
        </Grid> 
      )
    }

    renderUpdateButton() {
      return(<Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleUpdateButtonPressed}>
              Update Room
          </Button>
        </Grid>);
    }
    
    handleRoomButtonPressed() {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              maximal_player: this.state.maximal_player,
              username: this.state.username
          }),
        };
        fetch("/api/create-room", requestOptions)
        .then((response) => response.json())
        .then((data) =>  this.props.history.push("/room/"+data.code));
    }

    handleUpdateButtonPressed() {
      const requestOptions = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maximal_player: this.state.maximal_player
        }),
      };
      fetch("/api/update-room", requestOptions)
      .then((response) => {
        if(response.ok) {
          this.setState({
            successMsg: "Room updated successfully!"
          })
        }else{
          this.setState({
            errorMsg: "Error updating Room...!"
          })
        }
        this.props.updateCallback();
      });
    }

    render() 
    {
      const title = this.props.update ? "Update Room" : "Create a Room"
        return (
            <Grid container spacing={1}>
              <Grid item xs={12} align="center">
                  <Collapse in={this.state.errorMag != "" || this.state.successMsg != ""}>
                  {this.state.successMsg != "" 
                  ? 
                  <Alert serverity="success" onClose={
                    () => {
                      this.setState({successMsg: ""})
                    }}>{this.state.successMsg}</Alert> 
                  : 
                  <Alert serverity="error" onClose={() => 
                    {this.setState({successMsg: ""})}}>{this.state.errorMsg}</Alert>}
                  </Collapse>
              </Grid>
              <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                  {title}
                </Typography>
              </Grid>
              <Grid item xs={12} align="center">
                <FormControl>
                  <TextField
                    required={true}
                    type="number"
                    defaultValue={this.state.maximal_player}
                    onChange={this.handleMaximalPlayerChanged}
                    inputProps={{
                      min: 3,
                      style: { textAlign: "center" },
                    }}
                  />
                  <FormHelperText>
                    <div align="center">The amount of players which are needed to play that game</div>
                  </FormHelperText>
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
              {this.props.update ? this.renderUpdateButton() : this.renderCreateButtons() }
            </Grid>
          );
    };
}