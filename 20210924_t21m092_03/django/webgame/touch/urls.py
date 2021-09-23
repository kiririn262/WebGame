from django.urls import path
from . import views

app_name = 'touch'
urlpatterns = [
    # ex: touch/
    path('', views.index, name='index'),
]