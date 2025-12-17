# Quiz Platform

A full-stack quiz application built with Django REST Framework and React/TypeScript.

## Overview

This application implements a quiz platform with question bank management and quiz-taking functionality. The backend API is built with Django 6.0 and Django REST Framework 3.16.1, while the frontend uses React 19 with TypeScript, Vite, and Tailwind CSS 4.

### Features

**Question Management**
- Create, read, update, and delete questions via REST API
- Support for four question types:
  - Single-choice (exactly one correct answer)
  - Multiple-choice (one or more correct answers)
  - Numeric input (exact numeric match)
  - Text-match (case-insensitive string comparison)
- Question validation enforced at the API level
- Bulk question import via Django data migrations

**Quiz Interface**
- Random question selection (5 questions per quiz session)
- Interactive answer submission with immediate feedback
- Visual indicators for correct/incorrect answers
- Question type indicators and responsive UI
- Pagination through quiz questions

**Technical Implementation**
- RESTful API with function-based views
- PostgreSQL/SQLite database support via dj-database-url
- CORS-enabled for local development
- Responsive design with Tailwind CSS
- Type-safe frontend with TypeScript

## Current Implementation Status

**Implemented:**
- Question CRUD operations
- Four question types (text-match, single-choice, multiple-choice, numeric)
- Random quiz generation (5 questions per session)
- Auto-grading for all question types
- Data persistence with SQLite (development) and PostgreSQL (production)
- Responsive UI with keyboard navigation
- Proper form labels and accessibility considerations

**Not Implemented:**
- Image upload question type
- Question categorization and difficulty tagging
- Quiz attempt history and results persistence
- Comprehensive results view with score tracking
- Review functionality showing user vs. correct answers

## TODOs

### High Priority
- [ ] Implement quiz attempt tracking (store user responses, scores, timestamps)
- [ ] Add question categories and difficulty levels to the Question model
- [ ] Build results screen showing score, per-question correctness, and review functionality
- [ ] Implement attempt history view for users

### Medium Priority
- [ ] Add seed-based caching for quiz sets (see `api/views.py:132`)
- [ ] Implement proper error handling and validation messages on frontend
- [ ] Add pagination controls to question list view
- [ ] Create Django admin interface for question management
- [ ] Add unit tests for API endpoints and frontend components

### Low Priority
- [ ] Implement image upload question type
- [ ] Add question search and filtering
- [ ] Improve answer comparison logic for text-match questions (fuzzy matching)
- [ ] Add loading states and optimistic UI updates
- [ ] Implement rate limiting on API endpoints

## Claude Code Collaboration

This project was built with extensive assistance from Claude (Anthropic's AI assistant) through the Claude Code CLI tool. The developer had no prior Django or Django REST Framework experience before starting this project.

### How Claude Was Used

**Backend Development:**
- Guided Django project setup and configuration
- Designed the Question model schema with JSONField for flexible question types
- Implemented REST API endpoints with proper HTTP methods and status codes
- Created data migration script for bulk question loading (`api/migrations/0003_load_movie_questions.py`)
- Configured CORS, static file serving (WhiteNoise), and database connection handling

**Frontend Development:**
- Set up React + TypeScript + Vite project structure
- Implemented component-based architecture (QuestionCreate, QuestionAnswer, etc.)
- Designed type-safe question types and validation logic
- Created responsive Tailwind CSS styling with dark theme
- Built interactive quiz-taking interface with state management

**Development Workflow:**
- Iterative refinement through conversation and code review
- Debugging assistance for Django ORM queries and React state management
- Architectural decisions for API design and component structure
- Git commit message generation and code organization

The collaboration model was conversational: the developer described requirements, Claude provided implementation suggestions, and the developer reviewed/tested the code. Claude helped explain Django and DRF concepts as they were implemented, effectively serving as both a coding assistant and learning resource.

## Deployment

This application is configured for deployment on Render using the included `render.yaml` blueprint.

### Architecture

The application deploys as two separate services:

1. **Django Backend** (Python web service)
   - Runs on Gunicorn WSGI server
   - Serves REST API at `/api/` endpoints
   - Uses PostgreSQL database (configured via DATABASE_URL)
   - Static files served via WhiteNoise

2. **React Frontend** (Static site)
   - Built with Vite to `frontend/dist`
   - Served as static HTML/JS/CSS
   - Makes API requests to backend service

### Environment Variables

**Backend Service:**
- `DATABASE_URL` - PostgreSQL connection string (auto-generated by Render)
- `SECRET_KEY` - Django secret key (auto-generated)
- `DEBUG` - Set to `False` in production
- `ALLOWED_HOSTS` - Comma-separated list of allowed host headers
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (should include frontend URL)

**Frontend Service:**
- `VITE_API_URL` - Backend API URL (set to backend service URL in production)

### Deployment Process

1. Connect GitHub repository to Render
2. Render automatically detects `render.yaml` blueprint
3. Create services from blueprint:
   - Backend service runs `build.sh` (installs dependencies, runs migrations, collects static files)
   - Frontend service runs `cd frontend && npm install && npm run build`
4. Set environment variables in Render dashboard
5. Services auto-deploy on git push to main branch

### Local Database vs. Production

- **Development:** SQLite database (`db.sqlite3`)
- **Production:** PostgreSQL via `DATABASE_URL` environment variable

The `dj-database-url` package handles database configuration, falling back to SQLite if `DATABASE_URL` is not set.

## Setup Guide

### Prerequisites

- Python 3.14+ (matching production)
- Node.js 18+ and npm
- Git

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd django-react-project-12-2025
```

2. Create and activate Python virtual environment:
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file in project root (optional for local development):
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
```

5. Run database migrations:
```bash
python manage.py migrate
```

This will create the SQLite database and load 20 sample questions from `movie-questions.json`.

6. Start Django development server:
```bash
python manage.py runserver
```

Backend API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```bash
cp .env.example .env
```

The default configuration (`VITE_API_URL=http://localhost:8000`) works for local development.

4. Start Vite development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Development Workflow

Run both servers simultaneously in separate terminal windows:

**Terminal 1 (Backend):**
```bash
source env/bin/activate
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### API Endpoints

Base URL: `http://localhost:8000/api/`

- `GET /api/questions/` - List all questions (supports ?limit and ?offset)
- `POST /api/questions/` - Create new question
- `GET /api/questions/<id>/` - Get specific question
- `PUT /api/questions/<id>/` - Update question (full)
- `PATCH /api/questions/<id>/` - Update question (partial)
- `DELETE /api/questions/<id>/` - Delete question
- `GET /api/quiz-set/<seed>/` - Get 5 random questions (seed parameter reserved for future caching)

### Adding More Questions

To add questions in bulk, create or modify `movie-questions.json` and create a new migration:

```bash
python manage.py makemigrations --empty api
```

Then add a RunPython operation similar to `0003_load_movie_questions.py`.

Alternatively, use the question creation interface in the frontend (toggle to "Create Question" mode).

### Testing

Manual testing recommended through the frontend interface:

1. Toggle to "Create Question" mode
2. Create questions of each type (single-choice, multiple-choice, numeric, text-match)
3. Toggle to "Answer Questions" mode
4. Verify random question selection and answer validation

## Technology Stack

**Backend:**
- Django 6.0
- Django REST Framework 3.16.1
- PostgreSQL (production) / SQLite (development)
- Gunicorn (WSGI server)
- WhiteNoise (static file serving)
- python-dotenv (environment variable management)

**Frontend:**
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- Tailwind CSS 4.1.18
- ESLint (code quality)

**Infrastructure:**
- Render (hosting platform)
- Git/GitHub (version control)

## Project Structure

```
django-react-project-12-2025/
├── api/                      # Django app for quiz API
│   ├── migrations/           # Database migrations
│   ├── models.py            # Question model
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API endpoints
│   └── urls.py              # API URL routing
├── backend/                  # Django project settings
│   ├── settings.py          # Configuration
│   ├── urls.py              # Root URL routing
│   └── wsgi.py              # WSGI application
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── QuestionCreate.tsx
│   │   │   ├── QuestionAnswer.tsx
│   │   │   ├── QuestionCreateChoices.tsx
│   │   │   └── QuestionCreateText.tsx
│   │   ├── types/           # TypeScript type definitions
│   │   ├── config.ts        # API configuration
│   │   └── App.tsx          # Root component
│   ├── package.json
│   └── vite.config.ts
├── movie-questions.json      # Seed data (20 questions)
├── requirements.txt          # Python dependencies
├── build.sh                  # Production build script
├── render.yaml               # Render deployment config
└── manage.py                 # Django management script
```
