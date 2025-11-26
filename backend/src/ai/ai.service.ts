import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { SupabaseService } from '../shared/supabase.service';

export interface IdeaFeedbackRequest {
  title: string;
  problem: string;
  solution: string;
  opportunity?: string;
  goMarket?: string;
  teamInfo?: string;
}

export interface AIFeedback {
  comment: string;
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface MarketAssessment {
  score: number; // 0-100
  assessmentText: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  marketSize: 'small' | 'medium' | 'large';
  competitionLevel: 'low' | 'medium' | 'high';
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openai: OpenAI;

  constructor(private supabaseService: SupabaseService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
    }
    this.openai = new OpenAI({
      apiKey: apiKey || 'sk-dummy-key', // Fallback for development
    });
  }

  /**
   * Generate AI feedback for an idea
   */
  async generateIdeaFeedback(idea: IdeaFeedbackRequest): Promise<AIFeedback> {
    this.logger.log(`Generating AI feedback for idea: ${idea.title}`);

    const prompt = `You are an experienced startup advisor and investor. Analyze this business idea and provide constructive feedback.

**Idea Title:** ${idea.title}

**Problem:**
${idea.problem}

**Solution:**
${idea.solution}

**Opportunity:**
${idea.opportunity || 'Not specified'}

**Go-to-Market Strategy:**
${idea.goMarket || 'Not specified'}

**Team Information:**
${idea.teamInfo || 'Not specified'}

Please provide:
1. An overall assessment score (0-100)
2. Key strengths (2-3 points)
3. Key weaknesses or concerns (2-3 points)
4. Actionable suggestions for improvement (2-3 points)
5. A friendly, encouraging comment summarizing your feedback

Format your response as JSON:
{
  "score": <number>,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "comment": "Your encouraging summary comment here"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using faster, cheaper model
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful startup advisor. Provide constructive, encouraging feedback. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      const feedback = JSON.parse(response);

      this.logger.log(`AI feedback generated successfully with score: ${feedback.score}`);

      return {
        comment: feedback.comment,
        score: feedback.score,
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || [],
        suggestions: feedback.suggestions || [],
      };
    } catch (error) {
      this.logger.error('Failed to generate AI feedback:', error);
      throw new Error('Failed to generate AI feedback');
    }
  }

  /**
   * Generate AI reply to user comment
   */
  async generateReplyToUser(
    userMessage: string,
    ideaContext: IdeaFeedbackRequest,
    conversationHistory?: Array<{ role: string; content: string }>,
  ): Promise<string> {
    this.logger.log('Generating AI reply to user message');

    const contextPrompt = `You are discussing this idea:
**Title:** ${ideaContext.title}
**Problem:** ${ideaContext.problem}
**Solution:** ${ideaContext.solution}

The user is asking you a question or making a comment. Respond helpfully and concisely (2-3 sentences max). Be encouraging but honest.`;

    const messages = [
      {
        role: 'system',
        content: contextPrompt,
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 200,
      });

      const reply = completion.choices[0].message.content;
      this.logger.log('AI reply generated successfully');

      return reply;
    } catch (error) {
      this.logger.error('Failed to generate AI reply:', error);
      throw new Error('Failed to generate AI reply');
    }
  }

  /**
   * Generate market assessment for an idea
   */
  async generateMarketAssessment(idea: IdeaFeedbackRequest): Promise<MarketAssessment> {
    this.logger.log(`Generating market assessment for: ${idea.title}`);

    const prompt = `You are a market analyst. Assess the market potential of this business idea.

**Idea:** ${idea.title}
**Problem:** ${idea.problem}
**Solution:** ${idea.solution}
**Opportunity:** ${idea.opportunity || 'Not specified'}

Analyze:
1. Market size potential (small/medium/large)
2. Competition level (low/medium/high)
3. Overall market viability score (0-100)
4. Key market strengths
5. Key market risks
6. Recommendations for market entry

Respond with valid JSON:
{
  "score": <number 0-100>,
  "marketSize": "small" | "medium" | "large",
  "competitionLevel": "low" | "medium" | "high",
  "assessmentText": "Brief 2-3 sentence summary",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a market analyst. Respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      const assessment = JSON.parse(response);

      this.logger.log(`Market assessment generated with score: ${assessment.score}`);

      return {
        score: assessment.score,
        assessmentText: assessment.assessmentText,
        strengths: assessment.strengths || [],
        weaknesses: assessment.weaknesses || [],
        recommendations: assessment.recommendations || [],
        marketSize: assessment.marketSize,
        competitionLevel: assessment.competitionLevel,
      };
    } catch (error) {
      this.logger.error('Failed to generate market assessment:', error);
      throw new Error('Failed to generate market assessment');
    }
  }

  /**
   * Check if user can use AI features (has credits)
   */
  async checkUserAIQuota(userId: string, projectId: string): Promise<{
    canUse: boolean;
    freeRemaining: number;
    paidCredits: number;
    interactionsUsed: number;
    maxFreeInteractions: number;
  }> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data, error } = await supabase.rpc('can_user_use_ai', {
        p_user_id: userId,
        p_project_id: projectId,
      });

      if (error) throw error;

      return {
        canUse: data.canUse,
        freeRemaining: data.freeRemaining,
        paidCredits: data.paidCredits,
        interactionsUsed: data.interactionsUsed,
        maxFreeInteractions: data.maxFreeInteractions,
      };
    } catch (error) {
      this.logger.error('Failed to check AI quota:', error);
      throw new Error('Failed to check AI quota');
    }
  }

  /**
   * Track AI interaction usage
   */
  async trackAIInteraction(
    userId: string,
    projectId: string,
    interactionType: 'feedback' | 'reply',
    commentId?: string,
    tokensUsed: number = 0,
  ): Promise<boolean> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data, error } = await supabase.rpc('track_ai_interaction', {
        p_user_id: userId,
        p_project_id: projectId,
        p_interaction_type: interactionType,
        p_comment_id: commentId,
        p_tokens_used: tokensUsed,
      });

      if (error) throw error;

      this.logger.log(
        `AI interaction tracked: ${interactionType} for user ${userId} on project ${projectId}`,
      );

      return data;
    } catch (error) {
      this.logger.error('Failed to track AI interaction:', error);
      throw new Error('Failed to track AI interaction');
    }
  }
}
