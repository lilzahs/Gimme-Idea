# AI-Powered Features - Gimme Sensei

## Overview

Gimme Sensei is the AI assistant integrated into Gimme Idea, powered by OpenAI's GPT models. It provides intelligent feedback, market analysis, and strategic recommendations for projects and ideas.

---

## Architecture

### System Design

```
┌─────────────────┐
│   Frontend      │
│  (React/Next)   │
└────────┬────────┘
         │ HTTP/SSE
         ▼
┌─────────────────┐
│  NestJS API     │
│  AI Controller  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AI Service    │
│  (OpenAI SDK)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI API     │
│   (GPT-4/3.5)   │
└─────────────────┘
```

### Technology Stack

- **Frontend**: React, Server-Sent Events (SSE) for streaming
- **Backend**: NestJS, OpenAI SDK
- **AI Model**: GPT-4 Turbo / GPT-3.5 Turbo
- **Response Format**: Streaming JSON/Text
- **Credit System**: PostgreSQL-based tracking

---

## Features

### 1. AI Feedback Generation

**Purpose**: Generate comprehensive feedback on projects and ideas

**Input**:
- Project/Idea title
- Description
- Category
- Stage
- Problem, Solution, Opportunity (for ideas)

**Output**:
- Strengths analysis
- Areas for improvement
- Technical insights
- Market positioning
- Risk assessment
- Recommendations

**Implementation**:

```typescript
// Frontend: components/GenerateAIFeedbackButton.tsx
const generateFeedback = async (projectId: string) => {
  const response = await fetch(`/api/ai/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      projectId,
      detailLevel: 'comprehensive'
    })
  });
  
  const feedback = await response.json();
  return feedback;
};
```

### 2. AI Chat Interface (Gimme Sensei Chat)

**Purpose**: Interactive AI assistant for real-time Q&A and brainstorming

**Features**:
- **Context-Aware**: Remembers conversation history
- **Streaming Responses**: Real-time token streaming via SSE
- **Markdown Support**: Formatted responses with code blocks
- **Project Context**: Can reference specific projects
- **Multi-turn Conversations**: Maintains context across messages

**Component**: `AIChatModal.tsx` (34KB - comprehensive implementation)

**Key Features**:
```typescript
Interface IChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

Interface IChatContext {
  projectId?: string;
  projectTitle?: string;
  category?: string;
  conversationHistory: IChatMessage[];
}
```

**Streaming Implementation**:
```typescript
const streamAIResponse = async (message: string) => {
  const eventSource = new EventSource(
    `/api/ai/chat/stream?message=${encodeURIComponent(message)}&token=${token}`
  );
  
  eventSource.onmessage = (event) => {
    const token = JSON.parse(event.data).token;
    appendToCurrentMessage(token);
  };
  
  eventSource.onerror = () => {
    eventSource.close();
  };
};
```

### 3. Market Assessment

**Purpose**: Analyze market opportunity and competitive landscape

**Analysis Includes**:
- **Market Size**: TAM, SAM, SOM estimates
- **Competition**: Competitive analysis
- **Differentiation**: Unique value proposition
- **Barriers to Entry**: Technical and market barriers
- **Revenue Potential**: Monetization strategies
- **Growth Opportunities**: Expansion possibilities

**Output Example**:
```json
{
  "marketSize": {
    "tam": "Total Addressable Market estimate",
    "sam": "Serviceable Addressable Market",
    "som": "Serviceable Obtainable Market"
  },
  "competitors": [
    {
      "name": "Competitor X",
      "strengths": ["..."],
      "weaknesses": ["..."],
      "marketShare": "estimate"
    }
  ],
  "differentiation": {
    "uniqueFeatures": ["..."],
    "competitiveAdvantages": ["..."]
  },
  "risks": ["..."],
  "opportunities": ["..."],
  "recommendations": ["..."]
}
```

### 4. AI Comment Badge

**Purpose**: Identify AI-generated comments for transparency

**Implementation**: `AICommentBadge.tsx`

**Visual Indicator**: Purple badge with robot icon next to AI-generated content

---

## Backend Implementation

### AI Service

**Location**: `backend/src/ai/ai.service.ts` (31KB)

#### Core Methods

##### 1. generateFeedback()
```typescript
async generateFeedback(
  userId: string,
  projectId: string,
  options?: FeedbackOptions
): Promise<AIFeedback> {
  // 1. Check user has AI credits
  const credits = await this.checkCredits(userId);
  if (credits < FEEDBACK_COST) {
    throw new InsufficientCreditsError();
  }
  
  // 2. Fetch project details
  const project = await this.projectsService.findOne(projectId);
  
  // 3. Build prompt
  const prompt = this.buildFeedbackPrompt(project, options);
  
  // 4. Call OpenAI
  const response = await this.openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  // 5. Deduct credits
  await this.deductCredits(userId, FEEDBACK_COST);
  
  // 6. Store feedback
  const feedback = await this.storeFeedback(
    userId,
    projectId,
    response.choices[0].message.content
  );
  
  return feedback;
}
```

##### 2. chatStream()
```typescript
async *chatStream(
  userId: string,
  message: string,
  context?: ChatContext
): AsyncGenerator<string, void, unknown> {
  // Build conversation history
  const messages = [
    { role: 'system', content: GIMME_SENSEI_PROMPT },
    ...context.history,
    { role: 'user', content: message }
  ];
  
  // Stream from OpenAI
  const stream = await this.openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    stream: true,
    temperature: 0.8
  });
  
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';
    if (token) {
      yield token;
    }
  }
}
```

##### 3. analyzeMarket()
```typescript
async analyzeMarket(
  userId: string,
  projectId: string
): Promise<MarketAssessment> {
  const project = await this.projectsService.findOne(projectId);
  
  const prompt = `
    Analyze the market opportunity for this ${project.category} project:
    
    Title: ${project.title}
    Description: ${project.description}
    Problem: ${project.problem}
    Solution: ${project.solution}
    
    Provide:
    1. Market size estimation (TAM/SAM/SOM)
    2. Top 5 competitors
    3. Differentiation analysis
    4. Key risks and opportunities
    5. Strategic recommendations
    
    Format as JSON.
  `;
  
  const response = await this.openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### AI Controller

**Location**: `backend/src/ai/ai.controller.ts`

#### Endpoints

```typescript
@Controller('ai')
export class AIController {
  
  // Generate AI Feedback
  @Post('feedback')
  @UseGuards(AuthGuard)
  async generateFeedback(
    @CurrentUser('userId') userId: string,
    @Body() dto: GenerateFeedbackDto
  ) {
    return this.aiService.generateFeedback(userId, dto.projectId, dto.options);
  }
  
  // AI Chat (Streaming)
  @Get('chat/stream')
  @UseGuards(AuthGuard)
  async chatStream(
    @CurrentUser('userId') userId: string,
    @Query('message') message: string,
    @Query('contextId') contextId: string,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const context = await this.aiService.getContext(userId, contextId);
    const stream = this.aiService.chatStream(userId, message, context);
    
    for await (const token of stream) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    
    res.end();
  }
  
  // Market Assessment
  @Post('analyze/market')
  @UseGuards(AuthGuard)
  async analyzeMarket(
    @CurrentUser('userId') userId: string,
    @Body('projectId') projectId: string
  ) {
    return this.aiService.analyzeMarket(userId, projectId);
  }
  
  // Get AI Credits Balance
  @Get('credits')
  @UseGuards(AuthGuard)
  async getCredits(@CurrentUser('userId') userId: string) {
    return this.aiService.getCreditsBalance(userId);
  }
}
```

---

## Database Schema

### AI Credits System

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN ai_credits INTEGER DEFAULT 100;

-- AI Usage Log
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'feedback', 'chat', 'analysis'
  credits_used INTEGER NOT NULL,
  model_used VARCHAR(50),
  tokens_used INTEGER,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Feedback Storage
CREATE TABLE ai_feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50), -- 'general', 'market', 'technical'
  content TEXT NOT NULL,
  rating INTEGER, -- User rating of feedback (1-5)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user ON ai_usage_log(user_id);
CREATE INDEX idx_ai_usage_created ON ai_usage_log(created_at DESC);
CREATE INDEX idx_ai_feedbacks_project ON ai_feedbacks(project_id);
```

### Credit Costs

- **AI Feedback**: 10 credits
- **Market Analysis**: 20 credits
- **Chat Message**: 2 credits
- **Technical Review**: 15 credits

### Credit Top-up

```sql
-- Function to add credits
CREATE FUNCTION add_ai_credits(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE users 
  SET ai_credits = ai_credits + p_amount 
  WHERE id = p_user_id
  RETURNING ai_credits INTO v_new_balance;
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;
```

---

## Prompts & Prompt Engineering

### System Prompt (Gimme Sensei)

```
You are Gimme Sensei, an expert AI advisor for Solana blockchain projects and Web3 ideas.

Your role:
- Provide insightful, actionable feedback on Solana projects
- Help entrepreneurs validate and refine their ideas
- Offer technical guidance on Solana development
- Analyze market opportunities in the Web3 space
- Be encouraging but honest in your assessments

Your expertise:
- Solana blockchain architecture and development
- DeFi, NFTs, DAOs, and Web3 business models
- Product-market fit analysis
- Technical feasibility assessment
- Tokenomics and crypto economics
- Go-to-market strategies for Web3

Communication style:
- Clear, concise, and actionable
- Use markdown formatting for readability
- Include specific examples when relevant
- Be encouraging while identifying real risks
- Avoid jargon when simpler terms work

Always structure feedback with:
1. Summary (2-3 sentences)
2. Strengths (3-5 points)
3. Areas for Improvement (3-5 points)
4. Recommendations (specific, actionable)
5. Next Steps
```

### Feedback Generation Prompt Template

```typescript
const buildFeedbackPrompt = (project: Project) => `
Analyze this Solana ${project.category} project:

**Title**: ${project.title}

**Description**: 
${project.description}

**Category**: ${project.category}
**Stage**: ${project.stage}

${project.problem ? `**Problem**: ${project.problem}` : ''}
${project.solution ? `**Solution**: ${project.solution}` : ''}
${project.opportunity ? `**Opportunity**: ${project.opportunity}` : ''}

Provide comprehensive feedback covering:
1. Overall assessment and viability
2. Technical feasibility on Solana
3. Market opportunity and competition
4. Unique value proposition
5. Potential risks and challenges
6. Strategic recommendations
7. Suggested next steps

Format your response with clear sections using markdown.
`;
```

---

## Frontend Components

### AIChatModal Component

**Features**:
- Sliding modal interface
- Message history
- Streaming response visualization
- Markdown rendering
- Code syntax highlighting
- Credit balance display
- Context preservation
- Mobile-responsive

**Key State**:
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isStreaming, setIsStreaming] = useState(false);
const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
const [credits, setCredits] = useState(0);
```

### MarketAssessment Component

**Purpose**: Display AI-generated market analysis

**Sections**:
- Market Size Visualization
- Competitor Matrix
- SWOT Analysis
- Opportunity Score
- Risk Assessment
- Actionable Recommendations

---

## Progress & Status

### ✅ Completed

1. ✅ OpenAI integration
2. ✅ AI feedback generation
3. ✅ Streaming chat interface
4. ✅ Credit system implementation
5. ✅ Market assessment feature
6. ✅ AI comment badge
7. ✅ Usage tracking and logging
8. ✅ Error handling and retries
9. ✅ Rate limiting
10. ✅ Markdown rendering

### 🚧 In Progress

1. 🚧 Fine-tuned model for Solana projects
2. 🚧 AI-powered project matching
3. 🚧 Sentiment analysis on feedback
4. 🚧 Automated idea clustering

### 📋 Planned

1. 📋 Voice interface (speech-to-text)
2. 📋 Image analysis for UI/UX feedback
3. 📋 Code review capabilities
4. 📋 Smart contract audit suggestions
5. 📋 Competitive intelligence automation
6. 📋 Trend prediction
7. 📋 Personalized recommendations
8. 📋 AI-generated project summaries
9. 📋 Multi-language support
10. 📋 Integration with GitHub for code analysis

---

## Performance & Optimization

### Caching Strategy

```typescript
// Cache frequent prompts
const PROMPT_CACHE_TTL = 3600; // 1 hour

@Cacheable({
  ttl: PROMPT_CACHE_TTL,
  key: (projectId) => `ai:feedback:${projectId}`
})
async generateFeedback(projectId: string) {
  // ... implementation
}
```

### Token Optimization

1. **Prompt Compression**: Remove unnecessary text
2. **Context Windowing**: Limit conversation history to last 10 messages
3. **Model Selection**: Use GPT-3.5 for chat, GPT-4 for analysis
4. **Response Length Limits**: Max 2000 tokens for feedback

### Error Handling

```typescript
try {
  const response = await this.openai.chat.completions.create({...});
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    // Retry with exponential backoff
    await this.retryWithBackoff(request);
  } else if (error.code === 'insufficient_quota') {
    // Alert admin, fall back to cached responses
    await this.alertQuotaIssue();
  } else {
    // Log and return user-friendly error
    this.logger.error('OpenAI Error:', error);
    throw new AIServiceError('Unable to generate feedback. Please try again.');
  }
}
```

---

## Security & Privacy

### Data Protection

1. **No Training Data**: Opt-out of OpenAI model training
2. **Sanitization**: Remove sensitive info before sending to AI
3. **Encryption**: Encrypt stored AI feedback
4. **Access Control**: Only project authors can request AI feedback

### Rate Limiting

```typescript
@Throttle({
  default: {
    limit: 10, // requests
    ttl: 60000 // per minute
  }
})
@Post('feedback')
async generateFeedback() {
  // ...
}
```

### Cost Management

1. **Credit System**: Prevent abuse through credits
2. **Daily Limits**: Max 50 AI requests per user per day
3. **Model Selection**: Use cheaper models where appropriate
4. **Monitoring**: Track costs per user/project

---

## Testing

### Unit Tests

```typescript
describe('AIService', () => {
  it('should generate feedback for valid project', async () => {
    const feedback = await aiService.generateFeedback(userId, projectId);
    expect(feedback).toBeDefined();
    expect(feedback.content).toContain('Strengths');
  });
  
  it('should deduct credits after successful generation', async () => {
    await aiService.generateFeedback(userId, projectId);
    const credits = await aiService.getCreditsBalance(userId);
    expect(credits).toBe(initialCredits - FEEDBACK_COST);
  });
  
  it('should throw error when insufficient credits', async () => {
    await setUserCredits(userId, 0);
    await expect(
      aiService.generateFeedback(userId, projectId)
    ).rejects.toThrow(InsufficientCreditsError);
  });
});
```

### Integration Tests

```typescript
describe('AI Chat Streaming', () => {
  it('should stream tokens progressively', async (done) => {
    const tokens = [];
    const stream = aiService.chatStream(userId, 'Hello');
    
    for await (const token of stream) {
      tokens.push(token);
    }
    
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.join('')).toContain('Hello');
    done();
  });
});
```

---

## Monitoring & Analytics

### Metrics Tracked

1. **Usage Metrics**:
   - Total AI requests per day
   - Average response time
   - Credit consumption rate
   - Most common request types

2. **Quality Metrics**:
   - User ratings of AI feedback
   - Regeneration rate (how often users retry)
   - Average feedback length

3. **Cost Metrics**:
   - Total OpenAI API cost
   - Cost per user
   - Cost per project category

### Dashboards

- Real-time AI usage dashboard
- Cost projection graphs
- User satisfaction scores
- Error rate monitoring

---

## Future Enhancements

### Short Term

1. **Context-Aware Suggestions**: Suggest improvements based on similar successful projects
2. **Interactive Tutorials**: AI-guided walkthroughs for new users
3. **Automated Research**: Pull latest Solana ecosystem news
4. **Smart Tagging**: AI-suggested project tags

### Long Term

1. **Custom Fine-Tuned Model**: Train on successful Solana projects
2. **Multimodal Analysis**: Analyze screenshots, diagrams, code
3. **Predictive Analytics**: Predict project success probability
4. **AI Co-Founder**: More interactive strategic planning
5. **Integration with Dev Tools**: Direct GitHub/IDE integration

---

## API Documentation

See [AI API Reference](./api/ai.md) for complete endpoint documentation.

## Cost Analysis

See [AI Cost Breakdown](./costs/ai-costs.md) for detailed pricing information.
