from typing import Union
from django.db import models
import random, string, uuid

from django.db.models.fields.related import ForeignKey

def generate_unique_code():
    length = 8
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if Room.objects.filter(code=code).count() == 0:
            break
    return code

# Create your models here.
class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    started = models.BooleanField(default=False)
    maximal_player = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)

class Spieler(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    username = models.CharField(max_length=100, default="", unique=False)
    host = models.CharField(max_length=50, unique=True, default="")
    type = models.SmallIntegerField(null=False, default=0)
    room_code = models.CharField(max_length=8, default="", unique=False)
    dealerTries = models.SmallIntegerField(null=True, default=0)
    guesserTries = models.SmallIntegerField(null=True, default=0)
    canTip = models.BooleanField(default=False, null=False)

class Karte(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    type = models.SmallIntegerField(null=False)
    nummer = models.SmallIntegerField(null=False)
    room_code = models.CharField(max_length=8, default="", unique=False)
    used = models.BooleanField(default=False, null=False)
    inUse = models.BooleanField(default=False, null=False)

class Message(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    message = models.TextField(max_length=300, null=True)
    player_code = models.CharField(max_length=8, unique=False, null=False)
    room_code = models.CharField(max_length=8, unique=False, null=False)
    seeable = models.BooleanField(default=True, null=False)
