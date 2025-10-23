// LEAP Survey Backend - Node.js + Express + MongoDB
// This is a template for your backend server

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DATABASE || 'leap-survey';

let db;
let client;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB:', DB_NAME);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// ============================================
// CAMPAIGN ROUTES
// ============================================

// GET /api/campaigns - Get all campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await db.collection('campaigns').find({}).toArray();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns', error: error.message });
  }
});

// GET /api/campaigns/:id - Get campaign by ID
app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const campaign = await db.collection('campaigns').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Failed to fetch campaign', error: error.message });
  }
});

// POST /api/campaigns - Create new campaign
app.post('/api/campaigns', async (req, res) => {
  try {
    const {
      companyName,
      targetAudience,
      modules,
      primaryModule,
      startDate,
      endDate
    } = req.body;

    const campaign = {
      id: `${companyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: `${companyName} Survey`,
      companyName,
      status: 'Active',
      createdDate: new Date().toISOString(),
      startDate,
      endDate,
      targetAudience,
      modules,
      primaryModule,
      participantCount: 0,
      responseCount: 0,
      completionRate: 0,
      surveyUrl: `${process.env.FRONTEND_URL}?module=${primaryModule}&surveyId=${companyName.toLowerCase().replace(/\s+/g, '-')}`
    };

    const result = await db.collection('campaigns').insertOne(campaign);
    campaign._id = result.insertedId;
    
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Failed to create campaign', error: error.message });
  }
});

// PUT /api/campaigns/:id - Update campaign
app.put('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    delete updateData._id; // Remove _id from update
    
    const result = await db.collection('campaigns').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Failed to update campaign', error: error.message });
  }
});

// DELETE /api/campaigns/:id - Delete campaign
app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const result = await db.collection('campaigns').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Failed to delete campaign', error: error.message });
  }
});

// ============================================
// SURVEY RESPONSE ROUTES
// ============================================

// POST /api/responses/submit - Submit survey responses
app.post('/api/responses/submit', async (req, res) => {
  try {
    const { surveyId, module, responses, metadata } = req.body;

    const timestamp = new Date();
    const responseDocuments = [];

    // Convert responses object to individual documents
    for (const [questionId, responseValue] of Object.entries(responses)) {
      const doc = {
        surveyId,
        module,
        questionId,
        response: parseInt(responseValue),
        timestamp,
        ...metadata
      };
      responseDocuments.push(doc);
    }

    // Determine collection based on module
    const collectionName = module === 'ai-readiness' ? 'ai_readiness_responses' :
                          module === 'leadership' ? 'leadership_responses' :
                          'employee_experience_responses';

    const result = await db.collection(collectionName).insertMany(responseDocuments);

    // Update campaign response count
    await db.collection('campaigns').updateOne(
      { id: surveyId },
      { 
        $inc: { responseCount: 1 },
        $set: { lastUpdated: timestamp }
      }
    );

    res.status(201).json({ 
      success: true, 
      responseId: result.insertedIds[0].toString(),
      count: responseDocuments.length 
    });
  } catch (error) {
    console.error('Error submitting responses:', error);
    res.status(500).json({ message: 'Failed to submit responses', error: error.message });
  }
});

// GET /api/responses/survey/:surveyId - Get all responses for a survey
app.get('/api/responses/survey/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;

    const [aiReadiness, leadership, employeeExperience] = await Promise.all([
      db.collection('ai_readiness_responses').find({ surveyId }).toArray(),
      db.collection('leadership_responses').find({ surveyId }).toArray(),
      db.collection('employee_experience_responses').find({ surveyId }).toArray()
    ]);

    res.json({
      aiReadiness,
      leadership,
      employeeExperience
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ message: 'Failed to fetch responses', error: error.message });
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

// Helper function to calculate positive percentage
function calculatePositivePercentage(responses, scale) {
  if (responses.length === 0) return 0;
  
  const positiveResponses = responses.filter(r => {
    if (scale === '1-5') return r.response >= 4;
    if (scale === '1-10') return r.response >= 7;
    return false;
  });
  
  return (positiveResponses.length / responses.length) * 100;
}

// GET /api/analytics/overview - Overview analytics
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const { surveyId } = req.query;
    const filter = surveyId ? { surveyId } : {};

    const [aiResponses, leadershipResponses, eeResponses] = await Promise.all([
      db.collection('ai_readiness_responses').find(filter).toArray(),
      db.collection('leadership_responses').find(filter).toArray(),
      db.collection('employee_experience_responses').find(filter).toArray()
    ]);

    res.json({
      aiReadiness: calculatePositivePercentage(aiResponses, '1-5'),
      leadership: calculatePositivePercentage(leadershipResponses, '1-5'),
      employeeExperience: calculatePositivePercentage(eeResponses, '1-10'),
      totalResponses: aiResponses.length + leadershipResponses.length + eeResponses.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// GET /api/analytics/ai-readiness - AI Readiness analytics
app.get('/api/analytics/ai-readiness', async (req, res) => {
  try {
    const { surveyId } = req.query;
    const filter = surveyId ? { surveyId } : {};

    const responses = await db.collection('ai_readiness_responses').find(filter).toArray();
    
    const positiveScore = calculatePositivePercentage(responses, '1-5');
    
    // Group by section (you'll need to map questionIds to sections)
    const sectionBreakdown = {}; // Implement section grouping logic
    
    // Group by department
    const demographics = {};
    responses.forEach(r => {
      if (r.department) {
        if (!demographics[r.department]) {
          demographics[r.department] = { total: 0, positive: 0 };
        }
        demographics[r.department].total++;
        if (r.response >= 4) demographics[r.department].positive++;
      }
    });

    const demographicsArray = Object.entries(demographics).map(([dept, data]) => ({
      department: dept,
      score: (data.positive / data.total) * 100,
      count: data.total
    }));

    res.json({
      positiveScore,
      totalResponses: responses.length,
      sectionBreakdown: [], // Implement this
      demographics: demographicsArray,
      trends: [], // Implement trend calculation
      questionScores: [] // Implement question scoring
    });
  } catch (error) {
    console.error('Error fetching AI Readiness analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// Implement similar routes for leadership and employee experience...

// ============================================
// REAL-TIME ROUTES
// ============================================

// GET /api/realtime/stats - Real-time statistics
app.get('/api/realtime/stats', async (req, res) => {
  try {
    const { surveyId } = req.query;
    const filter = surveyId ? { surveyId } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalResponses, todayResponses] = await Promise.all([
      db.collection('ai_readiness_responses').countDocuments(filter),
      db.collection('ai_readiness_responses').countDocuments({
        ...filter,
        timestamp: { $gte: today }
      })
    ]);

    res.json({
      activeResponses: 0, // Implement active session tracking
      todayResponses,
      averageCompletionTime: 8.2, // Calculate from actual data
      completionRate: 89 // Calculate from campaigns
    });
  } catch (error) {
    console.error('Error fetching realtime stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 LEAP Survey Backend running on port ${PORT}`);
    console.log(`📊 API available at: http://localhost:${PORT}/api`);
  });
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (client) {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});

startServer().catch(console.error);
