from django.shortcuts import render, get_object_or_404

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Question
from .serializers import QuestionSerializer

@api_view(['GET'])
def hello_world(request):
    return Response({
        'message': 'Hello from Django!',
        'status': 'success'
    })

@api_view(['GET', 'POST'])
def echo(request):
    if request.method == 'POST':
        data = request.data
        return Response({
            'echo': data,
            'message': 'You sent this data to Django'
        })
    return Response({'message': 'Send me some data via POST'})


@api_view(['POST'])
def create_question(request):
    """Create a new question"""
    serializer = QuestionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_question(request, id):
    """Get a specific question by ID"""
    question = get_object_or_404(Question, pk=id)
    serializer = QuestionSerializer(question)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
def update_question(request, id):
    """Update a question"""
    question = get_object_or_404(Question, pk=id)
    partial = request.method == 'PATCH'
    serializer = QuestionSerializer(question, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_question(request, id):
    """Delete a question"""
    question = get_object_or_404(Question, pk=id)
    question.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)