import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import {SnackbarProvider} from "notistack"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import Room from "./Room";
import { ButtonGroup, Button, Typography, Grid } from "@material-ui/core";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    this.clearRoomCode = this.clearRoomCode.bind(this);
    this.roomCodeGetter = this.roomCodeGetter.bind(this);
  }
  componentDidUpdate() {
    var element = document.getElementById("background");
    element.classList.add("wrapper")
  }

  componentDidMount() {
   this.updateRoom = setInterval(this.roomCodeGetter, 1000);
  }

  roomCodeGetter() {
    fetch("/api/user-in-room")
    .then((response) => {return response.json();})
    .then((data) =>  {
      if(data.message == "No Room") {
        this.setState({
          roomCode: null
        });
        return;
      }
      this.setState({
        roomCode: data.code
      })
  });
  }

  componentWillUnmount() {
    clearInterval(this.roomCodeGetter);
  }

  clearRoomCode() {
    var element = document.getElementById("background");
    element.classList.add("wrapper")
    this.setState({
      roomCode: null,
    });
  }

  renderMainSection() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" compact="h3">
            Fuck the Dealer
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  render() {
    return (
      <div id="background">
        <div className="center">
          <Router>
            <Switch>
              <Route
                exact
                path="/"
                render={() => {
                  return this.state.roomCode != null ? (
                    <Redirect to={`/room/${this.state.roomCode}`} />
                  ) : (
                    this.renderMainSection()
                  );
                }}
              />
              <Route path="/join" component={RoomJoinPage} />
              <Route path="/create" component={CreateRoomPage} />
              <SnackbarProvider>
              <Route
                path={`/room/:roomCode`}
                render={(props) => <Room {...props} leaveRoomCallback={this.clearRoomCode}/>}
              />
              </SnackbarProvider>
            </Switch>
          </Router>
        </div>
      </div>
    );
  }
}
