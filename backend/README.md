# NPD Workflow Backend

Node.js/Express backend for the NPD Workflow & Reporting System.

## Features

- RESTful API for trial management
- MySQL database with proper relationships
- Step-by-step workflow validation
- Trial status management (in_progress, halted, completed)
- Data persistence with JSON field support
- CORS enabled for frontend integration

## Setup Instructions

### Prerequisites

- Node.js 16+ 
- MySQL 5.7+ or 8.0+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Initialize database:**
   ```bash
   npm run init-db
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Trials

- `GET /api/trials` - Get all trials with summary
- `GET /api/trials/:id` - Get trial by ID with steps
- `GET /api/trials/by-number/:trialNo` - Get trial by trial number
- `POST /api/trials` - Create new trial

### Steps

- `POST /api/trials/:id/steps/:stepCode` - Update trial step

### Health

- `GET /api/health` - Health check

## Database Schema

### Tables

1. **trials** - Main trial records
2. **step_data** - Step data with JSON storage
3. **reports** - Generated reports metadata
4. **workflow_steps** - Step definitions

### Key Features

- Foreign key constraints for data integrity
- JSON field for flexible step data storage
- Unique constraints on trial numbers
- Proper indexing for performance
- Automatic timestamps

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=npd_workflow
DB_PORT=3306

# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Development

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server
- `npm run init-db` - Initialize/reset database

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper database credentials
3. Set up SSL/TLS termination
4. Configure reverse proxy (nginx)
5. Set up process manager (PM2)
6. Configure backup strategy for MySQL

## Security Considerations

- Input validation on all endpoints
- SQL injection protection via prepared statements
- CORS configuration for allowed origins
- Rate limiting (add in production)
- Authentication/authorization (add as needed)