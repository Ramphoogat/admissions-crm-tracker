# Admissions CRM & Enquiry Tracker

A full-stack application for managing student admissions enquiries with follow-up tracking and conversion reporting.

## Tech Stack

- **Backend**: Encore.ts (TypeScript) with PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL via Encore's SQLDatabase
- **UI**: Tailwind CSS + shadcn/ui components

## Features

- **Enquiry Management**: Create, list, and update student admission enquiries
- **Follow-up Tracking**: Schedule and track follow-ups for each enquiry
- **Stage Management**: Track enquiries through stages (new → contacted → scheduled → admitted/lost)
- **Filtering & Search**: Filter by stage, class, and search across names/phone numbers
- **Summary Dashboard**: View conversion rates and stage distribution
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
/backend                    # Encore.ts backend service
  /school                   # School service
    encore.service.ts       # Service definition
    db.ts                   # Database configuration
    types.ts                # Shared TypeScript types
    create_enquiry.ts       # Create enquiry endpoint
    list_enquiries.ts       # List enquiries with filters
    update_enquiry.ts       # Update enquiry stage/notes
    create_followup.ts      # Create follow-up
    get_followups.ts        # Get follow-ups for enquiry
    summary.ts              # Summary statistics
    /migrations             # Database migrations
      001_init.up.sql       # Initial schema
      001_init.down.sql     # Schema rollback

/frontend                   # React frontend
  App.tsx                   # Main application component
  config.ts                 # Configuration
  /api                      # API client
    client.ts               # HTTP client wrapper
    types.ts                # TypeScript types
  /components               # Reusable components
    Navigation.tsx          # Main navigation
    StageBadge.tsx          # Stage status badge
    Filters.tsx             # Search and filter controls
    Pagination.tsx          # Pagination component
  /pages                    # Application pages
    EnquiryList.tsx         # List all enquiries
    EnquiryForm.tsx         # Create/edit enquiry form
    FollowUps.tsx           # Follow-up management
    Summary.tsx             # Dashboard with statistics
```

## Database Schema

### enquiries
- `id` (SERIAL PRIMARY KEY)
- `student_name` (TEXT NOT NULL)
- `class_applied` (TEXT NOT NULL)
- `guardian_name` (TEXT NOT NULL)
- `phone` (TEXT NOT NULL)
- `source` (TEXT)
- `stage` (TEXT NOT NULL) - CHECK constraint: 'new', 'contacted', 'scheduled', 'admitted', 'lost'
- `notes` (TEXT)
- `created_at` (TIMESTAMP NOT NULL DEFAULT now())

### followups
- `id` (SERIAL PRIMARY KEY)
- `enquiry_id` (INT NOT NULL) - Foreign key to enquiries
- `due_on` (DATE NOT NULL)
- `outcome` (TEXT)
- `note` (TEXT)
- `created_at` (TIMESTAMP NOT NULL DEFAULT now())

### Indexes
- `idx_enquiries_stage` ON enquiries(stage)
- `idx_enquiries_class` ON enquiries(class_applied)
- `idx_followups_enquiry` ON followups(enquiry_id)

## API Endpoints

All endpoints are exposed publicly (`expose: true`) for frontend consumption:

- `POST /enquiries` - Create new enquiry
- `GET /enquiries?stage=&class=&q=&limit=&offset=` - List enquiries with filters
- `PATCH /enquiries/:id` - Update enquiry stage, notes, class, or source
- `POST /enquiries/:id/followups` - Create follow-up for enquiry
- `GET /enquiries/:id/followups` - Get all follow-ups for enquiry
- `GET /reports/enquiries-summary?class=` - Get summary statistics by stage

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) (for local PostgreSQL)
- [Encore CLI](https://encore.dev/docs/install)
- [Node.js](https://nodejs.org/) (v18 or later)

### Backend Setup

1. Install Encore CLI:
```bash
curl -L https://encore.dev/install.sh | bash
```

2. Start the backend (automatically provisions PostgreSQL and runs migrations):
```bash
encore run
```

The backend will start on `http://localhost:4000` with automatic database setup.

**Important**: Make sure the backend is running before starting the frontend. You should see output similar to:
```
API Server listening on http://localhost:4000
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

### Configuration

The frontend API base URL is configured in `frontend/config.ts`. For local development, it points to `http://localhost:4000`.

### Troubleshooting

If you see "Failed to fetch" errors in the frontend:

1. **Check Backend Status**: Ensure the backend is running with `encore run`
2. **Verify Port**: The backend should be accessible at `http://localhost:4000`
3. **Check Logs**: Look at the backend terminal for any error messages
4. **Network Issues**: Ensure no firewall or network issues are blocking the connection

## Usage

### Creating Enquiries

1. Click "New Enquiry" in the navigation
2. Fill in required fields: Student Name, Class Applied, Guardian Name, Phone
3. Optionally add Source and Notes
4. Click "Create Enquiry"

### Managing Enquiries

1. View all enquiries on the main page
2. Use filters to search by stage, class, or text search
3. Click the edit icon to update enquiry details
4. Click the message icon to manage follow-ups

### Follow-ups

1. Click the message icon on any enquiry
2. View existing follow-ups sorted by due date
3. Add new follow-ups with due dates, outcomes, and notes
4. Overdue follow-ups are highlighted in red

### Summary Dashboard

1. Click "Summary" in the navigation
2. View total enquiries, admissions, and conversion rate
3. See breakdown by stage with percentages
4. Filter by class to see class-specific statistics
5. View conversion funnel visualization

## Validation Rules

- **Student Name**: Required, non-empty
- **Class Applied**: Required, must select from predefined options
- **Guardian Name**: Required, non-empty
- **Phone**: Required, must match pattern `^[0-9+\-\s]{7,15}$`
- **Stage**: Must be one of: new, contacted, scheduled, admitted, lost
- **Follow-up Due Date**: Required for follow-ups

## Error Handling

- Form validation with real-time error messages
- Toast notifications for success/error states
- Graceful handling of network errors
- Loading states for better user experience
- Retry functionality when backend is unavailable

## Development Notes

- The backend uses parameterized queries to prevent SQL injection
- Pagination defaults to 20 items per page (max 100)
- All timestamps are stored in UTC
- Phone validation allows international formats
- Search is case-insensitive across student name, guardian name, and phone
- The application includes comprehensive error handling for network connectivity issues

## Common Issues

### "Failed to fetch" Error
This error occurs when the frontend cannot connect to the backend. Solutions:
1. Start the backend with `encore run`
2. Verify the backend is running on port 4000
3. Check the API_BASE_URL in `frontend/config.ts`
4. Ensure no firewall is blocking the connection

### Database Connection Issues
If the backend fails to start:
1. Ensure Docker is running for PostgreSQL
2. Check that no other service is using port 4000
3. Review the Encore logs for specific error messages
