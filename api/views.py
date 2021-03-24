from os import spawnve, stat
from re import split
from django import http
from django.db.models.query import QuerySet
from django.http.response import JsonResponse
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.serializers import Serializer
from .serializers import *
from .models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
import random

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class SpielerView(generics.ListAPIView):
    queryset = Spieler.objects.all()
    serializer_class = SpielerSerializer


class KarteView(generics.ListAPIView):
    queryset = Karte.objects.all()
    serializer_class = KarteSerializer


class MessageView(generics.ListAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarh = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarh)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room not found': 'Invalid Room code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request.'}, status=status.HTTP_400_BAD_REQUEST)


class GetPlayers(APIView):
    serializers_class = SpielerSerializer
    lookup_url_kwarh = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarh)
        if code != None:
            spielerListe = Spieler.objects.filter(room_code=code)
            if spielerListe.count() > 0:
                dataListe = []
                for spieler in spielerListe:
                    data = SpielerSerializer(spieler).data
                    data['is_host'] = self.request.session.session_key == spieler.host
                    dataListe.append(data)
                return JsonResponse(dataListe, status=status.HTTP_200_OK, safe=False)
            return Response({'Room not found': 'Invalid Room code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request.'}, status=status.HTTP_400_BAD_REQUEST)


class GetMessage(APIView):
    serializer_class = MessageSerializer
    lookup_url_kwarh = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarh)
        if code != None:
            spieler = Spieler.objects.filter(host=self.request.session.session_key)[0]
            messageliste = Message.objects.filter(room_code=code, seeable=True).exclude(player_code=spieler.code)
            if messageliste.exists:
                dataListe = []
                for message in messageliste:
                    data = MessageSerializer(message).data
                    data['username'] = spieler.username
                    dataListe.append(data)
                return JsonResponse(dataListe, status=status.HTTP_200_OK, safe=False)
            return Response({'Room not found': 'Invalid Room code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request.'}, status=status.HTTP_400_BAD_REQUEST)

class GetCards(APIView):
    serializer_class = KarteSerializer
    lookup_url_kwarh = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarh)
        if code != None:
            cards = Karte.objects.filter(room_code=code, inUse=True, used=True)
            if cards.exists:
                dataliste = []
                for card in cards:
                    data = KarteSerializer(card).data
                    dataliste.append(data)
                return JsonResponse(dataliste, status=status.HTTP_200_OK, safe=False)
            return Response({'Room not found': 'Invalid Room code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request.'}, status=status.HTTP_400_BAD_REQUEST)


class GetDealerCardView(APIView):
    lookup_url_kwarh = 'code'
    serializer_class_card = KarteSerializer

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarh)
        if code != None:
            host = self.request.session.session_key
            querysetSpieler = Spieler.objects.filter(host=host)[0]
            if querysetSpieler.type == 1:
                cards_results = Karte.objects.filter(
                    room_code=code, used=False)
                if len(cards_results) < 1:
                    return Response({"message": "Out of Stock"}, status=status.HTTP_204_NO_CONTENT)
                active_cards = cards_results.filter(inUse=True)
                if len(active_cards) > 0:
                    card = KarteSerializer(active_cards[0]).data
                    return Response(card, status=status.HTTP_200_OK)
                randomCard = random.randint(0, len(cards_results)-1)
                card = cards_results[randomCard]
                card.inUse = True
                card.save(update_fields=["inUse"])
                cardSerialized = KarteSerializer(card).data
                return Response(cardSerialized, status=status.HTTP_200_OK)
            return Response({"message": "You aren't the dealer"}, status=status.HTTP_200_OK)
        return Response({"message": "Bad Request!"}, status=status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        if(self.request.session.get("room_code") == None):
            return Response({"message":"No Room"}, status=status.HTTP_200_OK)
        code = self.request.session.get("room_code")
        if code == None:
            return Response({"message":"No Room"}, status=status.HTTP_200_OK)
        room = Room.objects.filter(code=code)
        if(room.exists()):
            data = {
                "code": code
            }
            return JsonResponse(data, status=status.HTTP_200_OK)
        return Response({"message":"No Room"}, status=status.HTTP_200_OK)


class JoinRoom(APIView):
    lookup_url_kwarg = "code"
    serializer_class_spieler = CreateSpielerSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session["room_code"] = code
                serializer_spieler = self.serializer_class_spieler(
                    data=request.data)
                spielerAusRaum = Spieler.objects.filter(room_code=code)
                if len(spielerAusRaum)+1 > room.maximal_player:
                    return Response({"Bad Request": "The maximum amount of players are reached."}, status=status.HTTP_400_BAD_REQUEST)
                if serializer_spieler.is_valid():
                    username = serializer_spieler.data.get('username')
                    host = self.request.session.session_key
                    querysetSpieler = Spieler.objects.filter(host=host)
                    if querysetSpieler.exists():
                        spieler = querysetSpieler[0]
                        spieler.username = username
                        spieler.room_code = room.code
                        self.request.session["room_code"] = room.code
                        spieler.save(update_fields=['username', 'room_code'])
                    else:
                        spieler = Spieler(
                            host=host, username=username, room_code=room.code)
                        self.request.session["room_code"] = room.code
                        spieler.save()
                    return Response({"message": "Room Joined!"}, status=status.HTTP_200_OK)
                return Response({"Bad Request": "Invalid User!"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"Bad Request": "Invalid Room code!"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"Bad Request": "Invalid post data, did not find a code key"}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    serializer_class_spieler = CreateSpielerSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            maximal_player = serializer.data.get('maximal_player')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.maximal_player = maximal_player
                self.request.session["room_code"] = room.code
                room.save(update_fields=['maximal_player'])
            else:
                room = Room(host=host, maximal_player=maximal_player)
                self.request.session["room_code"] = room.code
                room.save()

            serializer_spieler = self.serializer_class_spieler(
                data=request.data)
            if serializer_spieler.is_valid():
                username = serializer_spieler.data.get('username')
                host = self.request.session.session_key
                querysetSpieler = Spieler.objects.filter(host=host)
                if querysetSpieler.exists():
                    spieler = querysetSpieler[0]
                    spieler.username = username
                    spieler.room_code = room.code
                    self.request.session["room_code"] = room.code
                    spieler.save(update_fields=['username', 'room_code'])
                else:
                    spieler = Spieler(
                        host=host, username=username, room_code=room.code)
                    self.request.session["room_code"] = room.code
                    spieler.save()
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)


class CreateMessageView(APIView):
    serializer_class = CreateMessageSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            message = serializer.data.get('message')
            player_code = serializer.data.get('player_code')
            room_code = serializer.data.get('room_code')
            querysetPlayer = Spieler.objects.filter(code=player_code, room_code=room_code)
            querysetRoom = Room.objects.filter(code=room_code)
            if querysetPlayer.exists() and querysetRoom.exists():
                player = querysetPlayer[0]
                if player.type == 1 or player.type == 2:
                    message = Message(
                        message=message, player_code=player_code, room_code=room_code)
                    message.save()
                    return Response({"message": "Message created"}, status=status.HTTP_201_CREATED)
                return Response({"message": "You are not authorized"}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({"message": "Room or User not found!"}, status=status.HTTP_400_BAD_REQUEST)


class StartGame(APIView):
    lookup_url_kwarh = 'code'

    def post(self, request, format=None):
        code = request.data.get("room_code")
        room_results = Room.objects.filter(code=code)
        if len(room_results) > 0:
            room = room_results[0]
            if room.started:
                return Response({"message": "Game has been started allready"}, status=status.HTTP_304_NOT_MODIFIED)
            room.started = True
            room.save(update_fields=['started'])
            player_results = Spieler.objects.filter(room_code=code)
            if len(player_results) == room.maximal_player:
                dealerNum = random.randint(0, len(player_results)-1)
                guesserNum = dealerNum + 1
                if guesserNum > len(player_results)-1:
                    guesserNum = 0
                player_results[dealerNum].type = 1
                player_results[guesserNum].type = 2
                player_results[guesserNum].canTip = True
                for player in player_results:
                    player.save(update_fields=["type", "canTip"])
                num = 1
                while num <= 13:
                    type = 1
                    while type <= 4:
                        card = Karte(nummer=num, type=type, room_code=code)
                        card.save()
                        type += 1
                    num += 1
            return Response({"message": "Game started!"}, status=status.HTTP_200_OK)
        return Response({"message": "Room not exists!"}, status=status.HTTP_400_BAD_REQUEST)


class UserLeaveRoom(APIView):
    def post(self, request, format=None):
        code = request.data.get('room_code')
        host_id = self.request.session.session_key
        room_results = Room.objects.filter(host=host_id)
        isHost = request.data.get('isHost')
        if room_results.exists() or isHost or Room.objects.filter(code=code)[0].started:
            spieler_results = Spieler.objects.filter(room_code=code)
            for spieler in spieler_results:
                spieler.delete()
            karten_results = Karte.objects.filter(room_code=code)
            for karte in karten_results:
                karte.delete()
            message_results = Message.objects.filter(room_code=code)
            for message in message_results:
                message.delete()
            room = room_results[0]
            room.delete()
        else:
            spieler_results = Spieler.objects.filter(host=host_id)
            if len(spieler_results) > 0:
                for spieler in spieler_results:
                    spieler.delete()
        return Response({"Message": "Success"}, status=status.HTTP_200_OK)


class SendGuesserTip(APIView):
    def post(self, request, format=None):
        code = request.data.get("room_code")
        room_results = Room.objects.filter(code=code)
        if len(room_results) > 0:
            host = self.request.session.session_key
            querysetSpieler = Spieler.objects.filter(host=host)
            if querysetSpieler.exists():
                spieler = querysetSpieler[0]
                if spieler.type == 2:
                    spieler.canTip = False
                    spieler.guesserTries += 1
                    spieler.save(update_fields=["guesserTries", "canTip"])
                    querysetDealer = Spieler.objects.filter(
                        room_code=code, type=1)
                    if querysetDealer.exists():
                        dealer = querysetDealer[0]
                        dealer.canTip = True
                        dealer.save(update_fields=["canTip"])
                        messages = Message.objects.filter(
                            room_code=code, player_code=dealer.code)
                        for message in messages:
                            message.seeable = False
                            message.save(update_fields=["seeable"])
                    return Response({"message": "Guess achevied!"}, status=status.HTTP_200_OK)
            return Response({"message": "You aren't the guesser"}, status=status.HTTP_200_OK)
        return Response({"message": "Room not exists!"}, status=status.HTTP_400_BAD_REQUEST)


class SendDealerTip(APIView):
    def post(self, request, format=None):
        code = request.data.get("room_code")
        correct = request.data.get("value")
        exen = request.data.get("exen")
        room_results = Room.objects.filter(code=code)
        if len(room_results) > 0:
            host = self.request.session.session_key
            dealerlist = Spieler.objects.filter(host=host, type=1)
            guesserlist = Spieler.objects.filter(room_code=code, type=2)
            if dealerlist.exists() and guesserlist.exists():
                dealer = dealerlist[0]
                guesser = guesserlist[0]

                if correct == True:
                    dealer.dealerTries = 0
                elif guesser.guesserTries == 2 or exen == True:
                    dealer.dealerTries += 1

                dealer.canTip = False
                guesser.canTip = True

                messages = Message.objects.filter(room_code=code, player_code=guesser.code)

                for message in messages:
                    message.seeable = False
                    message.save(update_fields=["seeable"])

                newDealer = None
                if dealer.dealerTries == 3:
                    playerForDealer = Spieler.objects.filter(room_code=code)
                    dealer.type = 0
                    dealer.dealerTries = 0
                    indexOfNewDealer = list(playerForDealer).index(dealer)
                    indexOfNewDealer += 1
                    if indexOfNewDealer > len(playerForDealer)-1:
                        indexOfNewDealer = 0
                    newDealer = playerForDealer[indexOfNewDealer]
                    newDealer.type = 1
                    newDealer.canTip = False
                
                newGuesser = None
                if (guesser.guesserTries == 2 or correct == True or exen == True) and newDealer == None:
                    playerForGuesser = Spieler.objects.filter(room_code=code)
                    guesser.type = 0
                    guesser.guesserTries = 0
                    guesser.canTip = False
                    indexOfNewGuesser = list(playerForGuesser).index(guesser)
                    indexOfNewGuesser += 1
                    if indexOfNewGuesser > len(playerForGuesser)-1:
                        indexOfNewGuesser = 0
                    if indexOfNewGuesser == list(playerForGuesser).index(playerForGuesser.filter(type=1)[0]):
                        indexOfNewGuesser += 1
                    if indexOfNewGuesser > len(playerForGuesser)-1:
                        indexOfNewGuesser = 0
                
                    newGuesser = playerForGuesser[indexOfNewGuesser]
                    newGuesser.type = 2
                    newGuesser.canTip = True

                    daelerCards = Karte.objects.filter(room_code=code,inUse=True, used=False)
                    for card in daelerCards:
                        card.used = True
                        card.save(update_fields=["used"])
                elif (guesser.guesserTries == 2 or correct == True or exen == True) and newDealer != None:
                    playerForGuesser = Spieler.objects.filter(room_code=code)
                    guesser.type = 0
                    guesser.guesserTries = 0
                    guesser.canTip = False
                    indexOfNewGuesser = list(playerForGuesser).index(guesser)
                    indexOfNewGuesser += 1
                    if indexOfNewGuesser > len(playerForGuesser)-1:
                        indexOfNewGuesser = 0
                    if indexOfNewGuesser == list(playerForGuesser).index(playerForGuesser.filter(code=newDealer.code)[0]):
                        indexOfNewGuesser += 1
                    if indexOfNewGuesser > len(playerForGuesser)-1:
                        indexOfNewGuesser = 0
                    newGuesser = playerForGuesser[indexOfNewGuesser]
                    newGuesser.type = 2
                    newGuesser.canTip = True
                    
                    daelerCards = Karte.objects.filter(room_code=code,inUse=True, used=False)
                    for card in daelerCards:
                        card.used = True
                        card.save(update_fields=["used"])
                
                for player in Spieler.objects.filter(room_code=code):
                    if player.code == dealer.code:
                        player.type = dealer.type
                        player.dealerTries = dealer.dealerTries
                        player.canTip = dealer.canTip
                        player.save(update_fields=["type", "dealerTries", "canTip"])
                    if player.code == guesser.code:
                        player.type = guesser.type
                        player.guesserTries = guesser.guesserTries
                        player.canTip = guesser.canTip
                        player.save(update_fields=["type", "guesserTries", "canTip"])
                    if newDealer != None and player.code == newDealer.code:
                        player.type = newDealer.type
                        player.dealerTries = newDealer.dealerTries
                        player.canTip = newDealer.canTip
                        player.save(update_fields=["type", "dealerTries", "canTip"])
                    if newGuesser != None and player.code == newGuesser.code:
                        player.type = newGuesser.type
                        player.guesserTries = newGuesser.guesserTries
                        player.canTip = newGuesser.canTip
                        player.save(update_fields=["type", "guesserTries", "canTip"])

                return Response({"message": "perfect!"}, status=status.HTTP_200_OK,)
            return Response({"message", "Your are not the Dealer"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"message": "Room not exists!"}, status=status.HTTP_400_BAD_REQUEST)

class DeleteEverythink(APIView):
    def get(self, request, format=None):
        for spieler in Spieler.objects.filter():
            spieler.delete()

        for message in Message.objects.filter():
            message.delete()

        for karte in Karte.objects.filter():
            karte.delete()

        for room in Room.objects.filter():
            room.delete()
        return JsonResponse({"Message":"ok"}, status=status.HTTP_200_OK, safe=True)

