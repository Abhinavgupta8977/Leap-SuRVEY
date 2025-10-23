# LEAP Survey Backend Server

Node.js + Express + MongoDB backend for the LEAP Survey Dashboard.

## Quick Start

### 1. Install Dependencies

```bash
cd backend-template
npm install
```

### 2. Setup MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" and copy your connection string
5. It will look like: `mongodb+srv://username:password@cluster.mongodb.net/`

**Option B: Local MongoDB**

```bash
# Install MongoDB locally
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string: mongodb://localhost:27017
```

### 3. Configure Environment Variables

Create `.env` file in the `backend-template` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/
MONGODB_DATABASE=leap-survey

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173

# Optional
NODE_ENV=development
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Campaigns

```
GET    /api/campaigns           - Get all campaigns
GET    /api/campaigns/:id       - Get campaign by ID
POST   /api/campaigns           - Create new campaign
PUT    /api/campaigns/:id       - Update campaign
DELETE /api/campaigns/:id       - Delete campaign
```

### Survey Responses

```
POST   /api/responses/submit              - Submit survey responses
GET    /api/responses/survey/:surveyId    - Get all responses for survey
GET    /api/responses/user/:userId        - Get user's responses
```

### Analytics

```
GET    /api/analytics/overview              - Overall analytics
GET    /api/analytics/ai-readiness          - AI Readiness analytics
GET    /api/analytics/leadership            - Leadership analytics
GET    /api/analytics/employee-experience   - Employee Experience analytics
```

### Real-time

```
GET    /api/realtime/stats      - Real-time statistics
GET    /api/realtime/responses  - Recent responses
```

## MongoDB Collections

The database uses these collections:

- `campaigns` - Survey campaigns
- `ai_readiness_responses` - AI Readiness survey responses
- `leadership_responses` - Leadership survey responses
- `employee_experience_responses` - Employee Experience survey responses
- `users` - User data (optional)
- `analytics` - Pre-calculated analytics (optional)

## Testing the API

### Using curl

```bash
# Get all campaigns
curl http://localhost:3000/api/campaigns

# Create new campaign
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Corp",
    "targetAudience": "All Employees",
    "modules": ["ai-readiness"],
    "primaryModule": "ai-readiness",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  }'

# Submit survey responses
curl -X POST http://localhost:3000/api/responses/submit \
  -H "Content-Type: application/json" \
  -d '{
    "surveyId": "acme-corp",
    "module": "ai-readiness",
    "responses": {
      "ai-vision-1": 5,
      "ai-vision-2": 4,
      "ai-planning-1": 5
    },
    "metadata": {
      "userId": "user123",
      "department": "Engineering"
    }
  }'
```

### Using Postman

Import the API endpoints into Postman for easier testing.

## Deployment

### Deploy to Render, Railway, or Heroku

1. Push your code to GitHub
2. Connect your repository to the platform
3. Set environment variables in the platform dashboard
4. Deploy!

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DATABASE=leap-survey
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Troubleshooting

**MongoDB Connection Failed**
- Check your connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify username and password

**CORS Errors**
- Update `FRONTEND_URL` in `.env`
- Check CORS configuration in `server.js`

**Port Already in Use**
- Change `PORT` in `.env`
- Kill the process: `lsof -ti:3000 | xargs kill`

## Next Steps

1. Add authentication (JWT, OAuth)
2. Implement rate limiting
3. Add input validation (use Joi or Zod)
4. Add automated tests
5. Set up logging (Winston, Morgan)
6. Add database indexes for performance
7. Implement caching (Redis)
8. Add WebSocket support for real-time updates

## Support

For issues, check the main LEAP Survey Dashboard documentation.
