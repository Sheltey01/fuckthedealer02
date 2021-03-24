from rest_framework import serializers
from .models import *

class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('code', 'maximal_player')

class CreateSpielerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spieler
        fields = ('username', 'host','type', 'room_code')

class CreateKarteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Karte
        fields = ('type', 'nummer', 'room_code')

class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('message', 'player_code', 'room_code')

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'started', 'maximal_player', 'created_at')

class SpielerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spieler
        fields = ('id', 'code', 'username', 'host', 'type', 'room_code', 'dealerTries', 'guesserTries', 'canTip')

class KarteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Karte
        fields = ('id', 'code', 'type', 'nummer', 'room_code', 'used', 'inUse')

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'code', 'message', 'player_code', 'room_code', 'seeable')
