from django.urls import path, include

from app_dtgu.views import *

urlpatterns = [
    path('', index, name="index"),
]