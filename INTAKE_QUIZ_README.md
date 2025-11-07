# Intake Quiz Feature

## Overview

The Intake Quiz is a sub-60-second questionnaire that collects user preferences and home information to generate personalized recommendations for sustainable energy solutions. It supports both anonymous and authenticated users with seamless data synchronization.

## Features

- **Fast Completion**: Designed to be completed in under 60 seconds
- **Anonymous Access**: Users can take the quiz without signing up
- **Auto-save**: Progress is automatically saved to localStorage and synced to database
- **Resume Functionality**: Users can continue where they left off
- **Conditional Logic**: Questions adapt based on user responses and budget
- **WCAG-AA Compliant**: Accessible design with proper keyboard navigation and screen reader support
- **Privacy-friendly Analytics**: Tracks completion rates and drop-off points without storing PII

## Database Schema

### Tables Created

1. **`intake_sessions`** - Stores quiz progress and responses
2. **`intake_profiles`** - Normalized output for recommendation engines
3. **`intake_analytics`** - Privacy-friendly analytics data

### Key Fields

- `session_id`: Unique identifier for anonymous users
- `responses`: JSONB field containing all quiz answers
- `current_step`: For resume functionality
- `profile_data`: Normalized output for adviesmodules

## API Endpoints

- `POST /api/intake/save` - Save quiz progress
- `GET /api/intake/resume` - Retrieve saved progress
- `POST /api/intake/complete` - Finalize quiz and create profile
- `POST /api/intake/sync` - Sync anonymous session to authenticated user
- `GET /api/intake/status` - Check if user has completed intake

## Components

### Core Components

- **`QuizContainer`** - Main orchestrator with state management
- **`QuestionStep`** - Renders individual questions with validation
- **`ProgressBar`** - Visual progress indicator
- **`useIntakeAutosave`** - Hook for localStorage + API synchronization

### Question Types

- Radio buttons (single selection)
- Checkboxes (multiple selection)
- Range sliders (numeric input)
- Text inputs
- Select dropdowns

## User Flow

1. **Start Quiz**: User navigates to `/intake`
2. **Answer Questions**: Progress through conditional question tree
3. **Auto-save**: Each answer is saved locally and to database
4. **Complete**: Quiz generates normalized profile for recommendations
5. **Sync**: Anonymous data syncs to user account on login/signup

## Question Structure

### Common Questions (All Users)

- Budget range
- Primary goals (cost, CO₂, comfort)
- Home type
- Current heating system

### Discipline-Specific Questions

- **Warmtepomp (WP)**: Heating type, room count, energy bill
- **Zonnepanelen (PV)**: Roof orientation, consumption, roof type
- **Thuisbatterij**: Usage patterns, backup priority
- **Isolatie**: Current insulation, wall type
- **Airconditioning**: Cooling needs, noise sensitivity

## Analytics

Privacy-friendly tracking includes:

- Quiz start/completion rates
- Step-by-step completion
- Drop-off points
- Average completion time
- Discipline preferences

## Accessibility

- WCAG-AA compliant
- Keyboard navigation support
- Screen reader announcements
- Proper ARIA labels
- Focus management between steps

## Testing Checklist

- [ ] Complete quiz in <60s
- [ ] LocalStorage persists after refresh
- [ ] Resume works from different device (when logged in)
- [ ] Anonymous session converts to user session on login
- [ ] All validation messages clear and in Dutch
- [ ] Keyboard navigation works
- [ ] Screen reader announces questions/errors
- [ ] Analytics events fire correctly
- [ ] Network failure doesn't lose progress

## Usage

### For Users

Navigate to `/intake` to start the quiz. Progress is automatically saved and can be resumed later.

### For Developers

The quiz integrates with the existing auth system and catalog service. The normalized profile data can be used by recommendation engines to suggest appropriate products from the catalog.

## Future Enhancements

- Multi-language support
- A/B testing for question optimization
- Integration with product recommendation engine
- Email reminders for incomplete quizzes
- Advanced analytics dashboard



