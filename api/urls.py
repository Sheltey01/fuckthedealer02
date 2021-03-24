from .views import *
from django.urls import path, include

urlpatterns = [
    path('room', RoomView.as_view()),
    path('spieler', SpielerView.as_view()),
    path('karte', KarteView.as_view()),
    path('message', MessageView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('create-message', CreateMessageView.as_view()),
    path('start-game', StartGame.as_view()),
    path('get-room', GetRoom.as_view()),
    path('get-spieler', GetPlayers.as_view()),
    path('get-cards', GetCards.as_view()),
    path('get-dealercard', GetDealerCardView.as_view()),
    path('get-message', GetMessage.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('leave-room', UserLeaveRoom.as_view()),
    path('send-guessertip', SendGuesserTip.as_view()),
    path('send-dealertip', SendDealerTip.as_view()),
    path('delete-everythink', DeleteEverythink.as_view())
]
