from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

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