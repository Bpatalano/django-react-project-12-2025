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


@api_view(['GET', 'POST'])
def questions_list_create(request):
    """
    List questions with pagination or create a new question.
    Type is automatically set to 'single-choice' if 1 answer, 'multiple-choice' if multiple answers.
    GET params: limit (default 20), offset (default 0)
    """
    if request.method == 'GET':
        # Get pagination parameters
        try:
            limit = int(request.GET.get('limit', 20))
            offset = int(request.GET.get('offset', 0))
            # Cap maximum limit to prevent huge queries
            limit = min(limit, 100)
        except ValueError:
            return Response({'error': 'Invalid pagination parameters'}, status=status.HTTP_400_BAD_REQUEST)

        questions = Question.objects.all()[offset:offset + limit]
        total_count = Question.objects.count()

        serializer = QuestionSerializer(questions, many=True)
        return Response({
            'results': serializer.data,
            'count': total_count,
            'limit': limit,
            'offset': offset
        })

    # POST - Create new question
    data = request.data

    # Validate required fields
    if not data.get('question'):
        return Response({'error': 'Question text is required'}, status=status.HTTP_400_BAD_REQUEST)

    if not data.get('answer') or not isinstance(data.get('answer'), list):
        return Response({'error': 'Answer must be a list'}, status=status.HTTP_400_BAD_REQUEST)

    question_type = data.get('type', '')

    # Validate based on question type
    if question_type in ['single-choice', 'multiple-choice']:
        # Multiple choice questions need options
        if not data.get('options') or not isinstance(data.get('options'), dict):
            return Response({'error': 'Options must be a dictionary for multiple choice questions'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate that answer keys exist in options
        options_keys = set(data.get('options', {}).keys())
        answer_keys = set(data.get('answer', []))

        if not answer_keys.issubset(options_keys):
            return Response({'error': 'Answer keys must exist in options'}, status=status.HTTP_400_BAD_REQUEST)

    elif question_type in ['numeric', 'text-match']:
        # Text-based questions should have single answer
        if len(data.get('answer', [])) != 1:
            return Response({'error': 'Text-based questions must have exactly one answer'}, status=status.HTTP_400_BAD_REQUEST)

        # For numeric, validate it's a number
        if question_type == 'numeric':
            try:
                float(data['answer'][0])
            except (ValueError, TypeError):
                return Response({'error': 'Numeric answer must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)

    else:
        return Response({'error': 'Invalid question type'}, status=status.HTTP_400_BAD_REQUEST)

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


@api_view(['GET'])
def get_quiz_set(request, seed):
    """
    Get a set of 5 random questions.

    Seed parameter is included for future caching implementation.
    Currently, the seed is not used - it returns truly random questions each time.

    Future enhancement: Implement caching layer where the same seed
    returns the same quiz set, allowing users to refresh without changing questions.

    TODO: Add seed-based caching
    - Use seed to generate deterministic question selection
    - Cache the quiz set with key: f"quiz_set:{seed}"
    - Return cached result if available
    """
    # Get 5 random questions using database-level randomization
    questions = Question.objects.order_by('?')[:5]

    if not questions.exists():
        return Response({'error': 'No questions available'}, status=status.HTTP_404_NOT_FOUND)

    serializer = QuestionSerializer(questions, many=True)
    return Response({
        'seed': seed,
        'questions': serializer.data,
        'count': len(serializer.data)
    })