import React from "react";
import Grid from "@material-ui/core/Grid"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import {useSnackbar} from "notistack"
import DealerMenu from "./DealerMenu"
import NormalMenu from "./NormalMenu"

export default function Room(props) {
  const [roomCode] = React.useState(props.match.params.roomCode);
  const [isHost, setIsHost] = React.useState(false);
  const [canStart, setCanStart] = React.useState(false);
  const [componentDidMount, setComponentDidMount] = React.useState(false)
  const [gameStarted, setGameStarted] = React.useState(false);
  const [maximalPlayer, setMaximalPlayer] = React.useState(0);
  const [users, setUsers] = React.useState([]);
  const [user] = React.useState({});
  const [cards] = React.useState([]);
  const [messages] = React.useState([]);
  const [usersInterval, setUsersInterval] = React.useState([]);
  const [messagesInterval, setMessageInterval] = React.useState([]);
  const [usedCardsInterval, setUsedCardsInterval] = React.useState([]);
  const { enqueueSnackbar } = useSnackbar();

  function intToNameConverter(type) {
    switch (type) {
      case 1:
        return "One";
      case 2:
        return "Two";
      case 3:
        return "Three";
      case 4:
        return "Four";
      case 5:
        return "Five";
      case 6:
        return "Six";
      case 7:
        return "Seven";
      case 8:
        return "Eight";
      case 9:
        return "Nine";
      case 10:
        return "Ten";
      case 11:
        return "Judge";
      case 12:
        return "Queen";
      case 13:
        return "King";
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

  function cardConverter(datas) {
    var cards = [];
    datas.forEach((data) => {
      var card = {
        code: data.code,
        number: data.nummer,
        type: intToLetterConverter(data.type),
        opacity: 1,
        show: true,
        margin_top: 200,
        top: 0,
      };
      cards.push(card);
    });
    return cards;
  }

  function playerConverter(datas) {
    var users = [];
    datas.forEach((data) => {
      var user = {
        id: data.code,
        username: data.username,
        type: data.type,
        canTip: data.canTip,
        tries:
          data.type == 1
            ? data.dealerTries
            : data.type == 2
            ? data.guesserTries
            : 0,
        guesserTries: data.guesserTries,
        isHost: data.is_host,
      };
      users.push(user);
    });
    return users;
  }

  function messageConverter(datas) {
    var messages = [];
    datas.forEach((data) => {
      var message = {
        id: data.code,
        message: data.message,
        username: data.username,
        room_code: data.room_code,
      };
      messages.push(message);
    });
    return messages;
  }

  React.useEffect(() => {
    var element = document.getElementById("background");
    element.classList.remove("wrapper")
    if(componentDidMount == false) {
      setComponentDidMount(true)
      componentDidMountFunction();
    }
    setCanStart(maximalPlayer == users.length && !gameStarted)
    return (() => {
      var element = document.getElementById("background");
      element.classList.add("wrapper")
    })
    
  })

  function componentDidMountFunction() {
    getRoomDetails();
    var userIntveral = setInterval(getPlayerDetailsToRoomNumber, 500);
    var messageInterval = setInterval(getMessages, 1000);
    var usedInterval = setInterval(getUsedCards, 1500);
    setUsersInterval(userIntveral);
    setMessageInterval(messageInterval);
    setUsedCardsInterval(usedInterval);
    renderLayoutCards();
  }

  function renderLayoutCards() {
    for (var cardCount = 1; cardCount < 14; cardCount++) {
      cards.push({
        code: intToNameConverter(cardCount),
        number: cardCount,
        type: "H",
        top: 0,
        margin_top: 0,
        opacity: 0.3,
        show: true,
      });
      var cardField = document.getElementById("cardField");
      var div = document.createElement("div");
      div.id = "card"+intToNameConverter(cardCount)+"Div";
      div.onclick = (e) => cardPick(e)
      cardField.appendChild(div)
      createImagesWithList(cardCount, "card"+intToNameConverter(cardCount)+"Div");
    }
  }

  function renderStartButton() {
    return (
      <Grid item xs={12} align="center">
        <Button
          color="primary"
          variant="contained"
          id="StartButton"
          disabled={!canStart}
          onClick={() => startGame()}
        >Start
        </Button>
      </Grid>
    );
  }

  function startGame() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_code: roomCode,
      }),
    };
    fetch("/api/start-game", requestOptions).then(() => {
      setGameStarted(true)
    });
  }
  
  function createImagesWithList(number, divname) {
    var selectedCardForNumber = cards.filter((c) => c.number == number && c.show == true);
    if (selectedCardForNumber.length < 1) return;
    selectedCardForNumber.forEach((image) => appendImageToDiv(divname, image));
  }

  function appendImageToDiv(divname, image) {
    if (document.getElementById(image.code) != null) return;
      var img = document.createElement("img");
      img.id = image.code;
      img.className = "hover10";
      img.src = require("../images/" +
        image.number +
        "_" +
        image.type.toUpperCase() +
        ".png").default;
      img.style.cssText +=
        "opacity:" +
        image.opacity +
        ";width:90%;max-width:85px;min-width:10px;margin-top:-" +
        image.margin_top+"px;top:-"+image.top+"px;position: relative;";
      document.getElementById(divname).appendChild(img);
  }

  function guesserSendTip() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_code: roomCode,
      }),
    };
    fetch("/api/send-guessertip", requestOptions).then(() => {});
  }

  function createMessage(message) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        room_code: roomCode,
        player_code: user.id,
      }),
    };
    fetch("/api/create-message", requestOptions).then(() => {});
  }

  function cardPick(e) {
    var div = document.getElementById(e.srcElement.id).parentElement.id;
    var message = div.replace("card", "").replace("Div", "")
    createMessage("The User " + user.username + " picked the card " + message +"!");  
    if (user.canTip && user.type == 2) {
      guesserSendTip();
      enqueueSnackbar("You picked the card " + message + "!", {
      variant: "info",
      persist: false,
    });
    }
  }

  function getMessages() {
    fetch("/api/get-message" + "?code=" + roomCode)
      .then((response) => {
        if(!response.ok) {
          clearInterval(usersInterval)
          clearInterval(messagesInterval)
          clearInterval(usedCardsInterval)
          return null;
        }
        return response.json();
        }
      )
      .then((data) => {
        if(data == null) return;
        var loadedMessages = messageConverter(data);
        if(loadedMessages.length < 1) return;
        loadedMessages.forEach((message) => {
          if (messages.find((e) => e.id == message.id) == null) {
            messages.push({ id: message.id });
            enqueueSnackbar(message.message, {
              variant: "info",
              persist: false,
              id: message.id,
            });
          }  
        })
      });
  }

  function getRoomDetails() {
    fetch("/api/get-room" + "?code=" + roomCode)
      .then((response) => {
        if (!response.ok) {
          clearInterval(usersInterval)
          clearInterval(messagesInterval)
          clearInterval(usedCardsInterval)
          props.leaveRoomCallback();
          props.history.push("/");
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if(data == null) return;
        setMaximalPlayer(data.maximal_player);
        setGameStarted(data.gameStarted);
        setIsHost(data.is_host);
      });
    getPlayerDetailsToRoomNumber();
  }

  function getPlayerDetailsToRoomNumber() {
    fetch("/api/get-spieler" + "?code=" + roomCode)
      .then((response) => {
        if (!response.ok) {
          clearInterval(usersInterval)
          clearInterval(messagesInterval)
          clearInterval(usedCardsInterval)
          props.leaveRoomCallback();
          props.history.push("/");
          return null;
        }
        return response.json();
      })
      .then((datas) => {
        if(datas == null) return;
        setUsers(playerConverter(datas));
        var shownUser = datas.filter(d => d.is_host)[0];
        if(shownUser != null) {
          user.id = shownUser.code;
          user.username = shownUser.username;
          user.type = shownUser.type;
          user.canTip = shownUser.canTip;
        }
      }
    );
  }

  function getUsedCards() {
    if (user != null) {
      fetch("/api/get-cards" + "?code=" + roomCode)
        .then((response) => {
          if(!response.ok) {
            return null;
          }
          return response.json();
        })
        .then((datas) => {
          if(datas == null) return;
          cardConverter(datas).forEach((cardFromConverter) => {
            if (cards.find((d) => d.code == cardFromConverter.code) != null) return;
            cards.push(cardFromConverter);
            cards.find((d) => d.code == intToNameConverter(cardFromConverter.number)).show = false;
            var activeCards = cards.filter((c) => c.number == cardFromConverter.number && c.show == true);
            cardFromConverter.top = activeCards.length > 1 ? (activeCards.length-1) > 0 ? (activeCards.length-1) * 15 : 15 : 0;
            cardFromConverter.margin_top = activeCards.length > 1 ? 200 : 0;

            if (activeCards.length == 1) {
              var documentDiv = document.getElementById("card"+
                intToNameConverter(cardFromConverter.number)+"Div");

              for (var child of document.getElementById("card"+intToNameConverter(cardFromConverter.number)+"Div")
                .children) {documentDiv.removeChild(child);}
              }
              appendImageToDiv("card"+intToNameConverter(cardFromConverter.number)+"Div",cardFromConverter);
            }
          );
          
        });
    }
  }

  function roomLeaveButtonPressed() {
    clearInterval(usersInterval)
    clearInterval(messagesInterval)
    clearInterval(usedCardsInterval)
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isHost: isHost,
        room_code: roomCode,
      }),
    };
    fetch("/api/leave-room", requestOptions).then(() => {
      props.leaveRoomCallback();
      props.history.push("/");
    });
  }

  if(user == null) return;
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h8" component="h8">
          Code: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h5" component="h5">
          Username: {user.username}
        </Typography>
      </Grid>
      {user.type === 1
        ? <DealerMenu users={users} currentUser={user} roomCode={roomCode} />
        : <NormalMenu users={users}/>}

      <Grid item xs={12}>
        <div class="grid-container" id="cardField"/>
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => roomLeaveButtonPressed()}>Leave Room
        </Button>
      </Grid>
      {isHost ? renderStartButton() : null}
    </Grid>
  );
  
}
 