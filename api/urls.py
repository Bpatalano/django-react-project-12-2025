from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello'),
    path('echo/', views.echo, name='echo'),

    # Question CRUD endpoints
    path('questions/', views.create_question, name='create_question'),
    path('questions/<int:id>/', views.get_question, name='get_question'),
    path('questions/<int:id>/update/', views.update_question, name='update_question'),
    path('questions/<int:id>/delete/', views.delete_question, name='delete_question'),
]