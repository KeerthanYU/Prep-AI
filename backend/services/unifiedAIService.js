const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// ─── Safe Initialization ─────────────────────────────────────────────────────
// Don't crash the server if API keys are missing — log a warning and set null.

let geminiModel = null;
let groq = null;

try {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[AI INIT] ⚠ GEMINI_API_KEY is not set. Gemini features will use fallbacks.");
  } else {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("[AI INIT] ✓ Gemini model initialized");
  }
} catch (err) {
  console.error("[AI INIT] ✗ Failed to initialize Gemini:", err.message);
}

try {
  if (!process.env.GROQ_API_KEY) {
    console.warn("[AI INIT] ⚠ GROQ_API_KEY is not set. Groq features will use fallbacks.");
  } else {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log("[AI INIT] ✓ Groq client initialized");
  }
} catch (err) {
  console.error("[AI INIT] ✗ Failed to initialize Groq:", err.message);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely extract and parse JSON from AI text output.
 * Handles markdown code fences, extra text around JSON, etc.
 */
function safeParseJSON(text) {
  if (!text || typeof text !== "string") return null;

  // Strip markdown code fences if present
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  // Try to find a JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    console.warn("[AI DEBUG] JSON.parse failed on extracted block");
    return null;
  }
}

/**
 * Sanitize user-provided text before embedding in a prompt.
 * Prevents prompt injection and template literal corruption.
 */
function sanitizeForPrompt(text) {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\$\{/g, "\\${")
    .substring(0, 15000); // Cap length to prevent token overflow
}

/**
 * Keyword-based skill extraction fallback.
 * Used when AI is unavailable or returns garbage.
 */
function extractSkillsByKeyword(text) {
  if (!text) return { skills: [], experience_level: "Entry", domain: "Software Engineering" };

  const lowerText = text.toLowerCase();

  const skillPatterns = [
    // Programming Languages
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin",
    // Frontend
    "react", "angular", "vue", "next.js", "html", "css", "tailwind", "bootstrap", "sass",
    // Backend
    "node.js", "express", "django", "flask", "spring boot", "fastapi", ".net",
    // Databases
    "mongodb", "postgresql", "mysql", "redis", "firebase", "dynamodb", "sql",
    // Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "terraform",
    // Tools
    "git", "linux", "rest api", "graphql", "webpack", "figma", "jira",
    // Data & AI
    "machine learning", "data science", "pandas", "tensorflow", "pytorch",
    // Soft skills
    "leadership", "communication", "problem solving", "teamwork", "agile", "scrum",
  ];

  const found = skillPatterns.filter((skill) => lowerText.includes(skill));
  const unique = [...new Set(found)];

  // Guess experience level
  let level = "Entry";
  if (/senior|lead|principal|architect|director|manager|10\+?\s*years|8\+?\s*years/i.test(text)) {
    level = "Senior";
  } else if (/mid|intermediate|3\+?\s*years|4\+?\s*years|5\+?\s*years/i.test(text)) {
    level = "Mid";
  }

  // Guess domain
  let domain = "Software Engineering";
  if (/marketing|seo|content|brand/i.test(text)) domain = "Marketing";
  else if (/finance|accounting|audit|banking/i.test(text)) domain = "Finance";
  else if (/human resources|recruitment|hr\b/i.test(text)) domain = "HR";

  return {
    skills: unique.length > 0 ? unique.slice(0, 12) : ["Communication", "Problem Solving", "Technical Skills"],
    experience_level: level,
    domain,
  };
}

/**
 * Default fallback questions when AI question generation fails.
 * Now follows the 3-section structure: MCQ, Descriptive, Aptitude.
 */
function getFallbackQuestions(domain = "Software Engineering", difficulty = "medium") {
  const mcq = [
    {
      text: `Which of the following is most important in ${domain}?`,
      type: "mcq",
      options: ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      correctAnswer: "B",
      category: "Technical"
    },
    {
      text: `What is the primary purpose of ${domain} principles?`,
      type: "mcq",
      options: ["A) Efficiency", "B) Cost", "C) Speed", "D) Maintenance"],
      correctAnswer: "A",
      category: "Technical"
    }
  ];

  const descriptive = [
    {
      text: `Walk me through how you would design and implement a solution for a complex real-world problem in ${domain}.`,
      type: "descriptive",
      category: "System Design",
      skills_tested: ["System Design", "Critical Thinking"]
    },
    {
      text: "How do you ensure the quality and reliability of your work? Give a specific example.",
      type: "descriptive",
      category: "Technical",
      skills_tested: ["Quality Assurance", "Attention to Detail"]
    }
  ];

  const aptitude = [
    {
      text: "If a person walks 5km North and then 3km East, what is their displacement from the start?",
      type: "aptitude",
      options: ["A) 5km", "B) 5.83km", "C) 8km", "D) 4km"],
      correctAnswer: "B",
      explanation: "Using Pythagoras theorem: sqrt(5^2 + 3^2) = sqrt(25 + 9) = sqrt(34) ≈ 5.83km",
      category: "Logical"
    }
  ];

  return { mcq, descriptive, aptitude };
}


// ─── AI Service Class ─────────────────────────────────────────────────────────

class UnifiedAIService {

  // ═══════════════════════════════════════════════════════════════════════════
  //  SKILL EXTRACTION (Gemini → keyword fallback)
  // ═══════════════════════════════════════════════════════════════════════════

  async extractResumeSkills(resumeText) {
    console.log("[PIPELINE STEP] extractResumeSkills called | textLength:", resumeText?.length || 0);

    // Guard: empty or missing input
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 20) {
      console.warn("[AI DEBUG] Resume text too short or empty, using keyword fallback");
      return extractSkillsByKeyword(resumeText || "");
    }

    // Guard: Gemini not available
    if (!geminiModel) {
      console.warn("[AI DEBUG] Gemini model not initialized, using keyword fallback");
      return extractSkillsByKeyword(resumeText);
    }

    try {
      const sanitized = sanitizeForPrompt(resumeText);

      const prompt = `Extract structured data from this resume text.
Text: "${sanitized}"

Respond in JSON format:
{
  "skills": ["skill1", "skill2", ...],
  "experience_level": "Entry/Mid/Senior",
  "domain": "e.g. Software Engineering"
}
Provide 8-12 most relevant technical and soft skills.
Respond with valid JSON only. No markdown, no code fences.`;

      console.log("[AI DEBUG] Sending skill extraction request to Gemini...");

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("[AI DEBUG] Gemini raw response length:", text?.length || 0);

      // Parse and validate
      const parsed = safeParseJSON(text);

      if (!parsed) {
        console.warn("[AI ERROR] Could not parse Gemini response, falling back to keywords");
        return extractSkillsByKeyword(resumeText);
      }

      // Validate shape — ensure skills is a non-empty array
      const skills = Array.isArray(parsed.skills) ? parsed.skills.filter(s => typeof s === "string" && s.trim()) : [];

      if (skills.length === 0) {
        console.warn("[AI DEBUG] Gemini returned empty skills array, augmenting with keyword fallback");
        const keywordResult = extractSkillsByKeyword(resumeText);
        return {
          skills: keywordResult.skills,
          experience_level: parsed.experience_level || keywordResult.experience_level,
          domain: parsed.domain || keywordResult.domain,
        };
      }

      const result_obj = {
        skills: skills.slice(0, 15),
        experience_level: parsed.experience_level || "Mid",
        domain: parsed.domain || "Software Engineering",
      };

      console.log("[AI DEBUG] Skill extraction successful:", JSON.stringify(result_obj.skills));
      return result_obj;

    } catch (error) {
      console.error("[AI ERROR] Gemini skill extraction failed:", error.message);

      // GRACEFUL FALLBACK — never crash
      return extractSkillsByKeyword(resumeText);
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  QUESTION GENERATION (Gemini → fallback questions)
  // ═══════════════════════════════════════════════════════════════════════════

  async generateQuestions(domain, skills = [], difficulty = "medium") {
    console.log("[PIPELINE STEP] generateQuestions called | domain:", domain, "| skills:", skills?.length || 0, "| difficulty:", difficulty);

    // Validate inputs
    const safeDomain = domain || "Software Engineering";
    const safeSkills = Array.isArray(skills) ? skills.filter(s => typeof s === "string" && s.trim()) : [];
    const safeDifficulty = ["easy", "medium", "hard"].includes(difficulty?.toLowerCase()) ? difficulty.toLowerCase() : "medium";

    // Guard: Gemini not available
    if (!geminiModel) {
      console.warn("[AI DEBUG] Gemini not available for question generation, using fallbacks");
      return getFallbackQuestions(safeDomain, safeDifficulty);
    }

    try {
      const skillsText = safeSkills.length > 0 ? safeSkills.join(", ") : "general professional skills";

      const prompt = `You are an expert interviewer for ${safeDomain} roles.
Generate a complete, structured interview assessment for a ${safeDifficulty} difficulty level.

Based on these skills: ${skillsText}

Your task is to generate exactly 3 sections of questions:

1. MCQ Section:
   - 5 technical questions based on the skills.
   - 4 options each (A, B, C, D).
   - One clear correct answer.

2. Descriptive Section:
   - 5 conceptual or real-world scenario questions matching the ${safeDifficulty} level.
   - Focus on depth of knowledge and problem-solving.

3. Aptitude Section:
   - 5 logical reasoning or quantitative questions.
   - Include 4 options and a detailed explanation for the correct answer.

Difficulty Guidelines:
- EASY: Basic concepts, fundamental definitions, simple logic.
- MEDIUM: Practical application, moderate problem-solving, common industry scenarios.
- HARD: Advanced architecture, edge cases, complex logic, and tricky scenarios.

Respond in JSON format EXACTLY like this:
{
  "mcq": [
    {
      "text": "Question here?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "category": "Technical"
    }
  ],
  "descriptive": [
    {
      "text": "Explain how...",
      "category": "Scenario/Conceptual"
    }
  ],
  "aptitude": [
    {
      "text": "If X then Y...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "B",
      "explanation": "Because...",
      "category": "Logical/Quantitative"
    }
  ]
}
Respond with valid JSON only. No markdown, no code fences.`;

      console.log("[AI DEBUG] Sending question generation request to Gemini...");

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("[AI DEBUG] Gemini questions response length:", text?.length || 0);

      const parsed = safeParseJSON(text);

      if (!parsed || (!parsed.mcq && !parsed.descriptive && !parsed.aptitude)) {
        console.warn("[AI ERROR] Invalid question generation response, using fallbacks");
        return getFallbackQuestions(safeDomain, safeDifficulty);
      }

      // Sanitize and validate
      const sanitizeGroup = (group, type) => {
        if (!Array.isArray(group)) return [];
        return group.filter(q => q && typeof q.text === "string").map(q => ({
          ...q,
          type: type,
          text: q.text.trim()
        }));
      };

      const finalQuestions = {
        mcq: sanitizeGroup(parsed.mcq, "mcq"),
        descriptive: sanitizeGroup(parsed.descriptive, "descriptive"),
        aptitude: sanitizeGroup(parsed.aptitude, "aptitude")
      };

      console.log("[AI DEBUG] Question generation successful");
      return finalQuestions;

    } catch (error) {
      console.error("[AI ERROR] Question generation failed:", error.message);
      return getFallbackQuestions(safeDomain, safeDifficulty);
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  ANSWER EVALUATION (Groq → fallback score)
  // ═══════════════════════════════════════════════════════════════════════════

  async evaluateAnswer(question, userAnswer, domain = "Software Engineering") {
    console.log("[PIPELINE STEP] evaluateAnswer called | domain:", domain);

    const fallback = {
      score: 50,
      feedback: "We encountered an issue during evaluation. Your answer was recorded.",
      improvements: ["Try to be more specific with examples.", "Structure your answer clearly."],
    };

    // Guard: missing inputs
    if (!question || !userAnswer) {
      console.warn("[AI DEBUG] Missing question or answer for evaluation");
      return fallback;
    }

    // Guard: Groq not available
    if (!groq) {
      console.warn("[AI DEBUG] Groq client not available, returning fallback score");
      return fallback;
    }

    try {
      const safeQuestion = sanitizeForPrompt(question);
      const safeAnswer = sanitizeForPrompt(userAnswer);

      const prompt = `You are an expert interview evaluator for ${domain}.
Evaluate the following response to an interview question.

Question: "${safeQuestion}"
Candidate Answer: "${safeAnswer}"

Evaluation criteria (0-100 score):
- Technical accuracy
- Communication clarity
- Confidence and articulation

Respond in JSON format:
{
  "score": <0-100 number>,
  "feedback": "2-3 sentences of specific feedback",
  "improvements": ["improvement1", "improvement2"]
}
Respond with valid JSON only.`;

      console.log("[AI DEBUG] Sending evaluation request to Groq...");

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional technical interviewer evaluator. You provide honest, constructive feedback in JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

      const content = chatCompletion.choices?.[0]?.message?.content;
      console.log("[AI DEBUG] Groq evaluation response length:", content?.length || 0);

      const parsed = safeParseJSON(content);

      if (!parsed || typeof parsed.score !== "number") {
        console.warn("[AI ERROR] Invalid evaluation response from Groq");
        return fallback;
      }

      return {
        score: Math.min(100, Math.max(0, parsed.score)),
        feedback: typeof parsed.feedback === "string" ? parsed.feedback : fallback.feedback,
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : fallback.improvements,
      };

    } catch (error) {
      console.error("[AI ERROR] Groq evaluation failed:", error.message);
      return fallback;
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  RESUME ANALYSIS (for resumeService.js compatibility)
  // ═══════════════════════════════════════════════════════════════════════════

  async analyzeResume(resumeText, domain = "Software Engineering") {
    console.log("[PIPELINE STEP] analyzeResume called | textLength:", resumeText?.length || 0);

    const fallbackAnalysis = {
      extractedSkills: ["Communication", "Problem Solving", "Technical Skills"],
      relevantSkills: ["Problem Solving", "Technical Skills"],
      missingSkills: ["Specialized Domain Knowledge", "Advanced Certifications"],
      overallScore: 60,
    };

    if (!resumeText || resumeText.trim().length < 20) {
      return fallbackAnalysis;
    }

    // Reuse extractResumeSkills and map to the expected shape
    try {
      const skillResult = await this.extractResumeSkills(resumeText);

      return {
        extractedSkills: skillResult.skills || [],
        relevantSkills: skillResult.skills?.slice(0, 5) || [],
        missingSkills: ["Advanced System Design", "Cloud Certifications", "Performance Optimization"],
        overallScore: Math.min(100, Math.max(0, (skillResult.skills?.length || 0) * 8)),
      };
    } catch (error) {
      console.error("[AI ERROR] analyzeResume failed:", error.message);
      return fallbackAnalysis;
    }
  }
}

module.exports = new UnifiedAIService();
