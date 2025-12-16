from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello'),
    path('echo/', views.echo, name='echo'),

    # Question CRUD endpoints
    path('questions/', views.questions_list_create, name='questions_list_create'),
    path('questions/quiz-set/<str:seed>/', views.get_quiz_set, name='get_quiz_set'),
    path('questions/<int:id>/', views.get_question, name='get_question'),
    path('questions/<int:id>/update/', views.update_question, name='update_question'),
    path('questions/<int:id>/delete/', views.delete_question, name='delete_question'),
]