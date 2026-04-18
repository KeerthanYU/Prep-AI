const axios = require('axios');

class GroqService {
  constructor() {
    this.baseUrl = 'https://api.groq.com/openai/v1';
    this.model = 'llama-3.1-70b-versatile';
  }

  _getApiKey() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GROQ_API_KEY is not defined. Please add it to your .env file.\n' +
        'Current environment: ' + (process.env.NODE_ENV || 'development') +
        '\nMake sure your .env file is in the backend directory and properly formatted.'
      );
    }
    return apiKey;
  }

  async generateQuestions(domain, resumeContent, difficulty = 'medium', count = 5) {
    try {
      const prompt = this._buildQuestionPrompt(domain, resumeContent, difficulty);

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this._getApiKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const questions = this._parseQuestions(content, count);

      return questions;
    } catch (error) {
      console.error('Groq API error:', error.message);
      throw new Error('Failed to generate questions');
    }
  }

  async evaluateAnswer(question, userAnswer, domain) {
    try {
      const prompt = this._buildEvaluationPrompt(question, userAnswer, domain);

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this._getApiKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const evaluation = this._parseEvaluation(content);

      return evaluation;
    } catch (error) {
      console.error('Groq evaluation error:', error.message);
      throw new Error('Failed to evaluate answer');
    }
  }

  async generateFeedback(answers, domain) {
    try {
      const prompt = this._buildFeedbackPrompt(answers, domain);

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.6,
          max_tokens: 1500,
        },
        {
          headers: {
            'Authorization': `Bearer ${this._getApiKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Groq feedback error:', error.message);
      throw new Error('Failed to generate feedback');
    }
  }

  _buildQuestionPrompt(domain, resumeContent, difficulty) {
    return `You are an expert interview coach for ${domain} roles. 
    
Based on this resume excerpt:
"${resumeContent}"

Generate 5 ${difficulty} interview questions specifically tailored to this candidate's experience.

Format each question as:
Q1: [Question text]
Category: [Category like Problem Solving, System Design, etc.]
Skills: [Comma-separated list of skills being tested]

Focus on real experience from the resume.`;
  }

  _buildEvaluationPrompt(question, userAnswer, domain) {
    return `You are an expert ${domain} interview evaluator.

Question: "${question}"
Candidate's Answer: "${userAnswer}"

Evaluate the answer on:
1. Content Score (0-100): Accuracy, completeness, technical correctness
2. Communication Score (0-100): Clarity, structure, articulation
3. Confidence Score (0-100): Conviction, authority in the field

Provide brief feedback for each dimension.

Respond in this exact JSON format:
{
  "contentScore": <number>,
  "communicationScore": <number>,
  "confidenceScore": <number>,
  "contentFeedback": "<feedback>",
  "communicationFeedback": "<feedback>",
  "confidenceFeedback": "<feedback>"
}`;
  }

  _buildFeedbackPrompt(answers, domain) {
    return `You are an expert ${domain} interview coach providing personalized session feedback.

The candidate answered these questions:
${answers.map((a, i) => `Q${i + 1}: ${a.questionText}\nA${i + 1}: ${a.userAnswer}\nScores: Content=${a.contentScore}, Communication=${a.communicationScore}, Confidence=${a.confidenceScore}`).join('\n\n')}

Provide a brief, encouraging personalized feedback summarizing:
1. Top 2-3 strengths shown
2. 1-2 key areas for improvement
3. Specific actionable tips for next session

Keep it concise (3-4 sentences max).`;
  }

  _parseQuestions(content, count) {
    const questions = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length && questions.length < count; i++) {
      const line = lines[i].trim();
      if (line.match(/^Q\d+:/)) {
        questions.push(line.replace(/^Q\d+:\s*/, ''));
      }
    }

    return questions.slice(0, count);
  }

  _parseEvaluation(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('JSON parse error:', error.message);
    }

    return {
      contentScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      contentFeedback: 'Unable to parse evaluation',
      communicationFeedback: '',
      confidenceFeedback: '',
    };
  }
}

module.exports = new GroqService();
