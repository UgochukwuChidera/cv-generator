---
name: jd-analysis-targeting
description: Analyze job descriptions and perform JD-to-CV alignment for the Nexus CV Generator. Identify keyword gaps, calculate fit scores, suggest bullet improvements, and generate tailored content.
---

This skill enables comprehensive job description analysis and JD-to-CV alignment for the Nexus CV Generator. It covers keyword extraction, gap analysis, fit scoring, and content tailoring.

The agent must understand that JD targeting is about matching candidate qualifications to job requirements, identifying gaps, and providing actionable improvements.

## JD Analysis Philosophy

### Purpose-Driven Analysis
- **Keyword Identification**: Extract key requirements from JD
- **Gap Detection**: Identify missing qualifications
- **Fit Scoring**: Quantify alignment likelihood
- **Tailoring**: Adjust content for better match

### Analysis Types
- **Keyword Analysis**: Skills, tools, technologies
- **Experience Analysis**: Role requirements, seniority
- **Domain Analysis**: Industry knowledge, domain expertise
- **Content Tailoring**: Adjust bullets for alignment

---

## 1. JD Parsing & Extraction (Plural)

### 1.1 Input Sources
- **Text Paste**: Direct copy-paste into textarea
- **File Upload**: PDF, DOCX, TXT files
- **URL Import**: Parse from job posting URL
- **Manual Entry**: Type directly

### 1.2 Extraction Methods
- **Keyword Frequency**: Count term occurrences
- **Pattern Matching**: Regex for skills, tools, requirements
- **NLP Extraction**: Contextual understanding (if available)
- **Section Parsing**: Responsibilities, requirements, qualifications

### 1.3 Extracted Elements
```typescript
interface JDParsing {
  rawText: string;
  wordCount: number;
  sections: {
    responsibilities: string[];
    requirements: string[];
    qualifications: string[];
    niceToHave: string[];
  };
  keywords: {
    skills: string[];
    tools: string[];
    technologies: string[];
    domains: string[];
    certifications: string[];
  };
  roleInfo: {
    title: string;
    level: string;
    department: string;
    location: string;
  };
}
```

### 1.4 Cleaning & Normalization
- **Remove Boilerplate**: Strip generic text
- **normalize Case**: Consistent case for terms
- **Deduplicate**: Remove duplicate keywords
- **Categorize**: Group by type

---

## 2. Keyword Analysis (Plural)

### 2.1 Category Extraction
- **Technical Skills**: Languages, frameworks, tools
- **Soft Skills**: Leadership, communication
- **Domain Knowledge**: Industry-specific
- **Certifications**: Required certs
- **Tools/Platforms**: Software, platforms

### 2.2 Keyword Weighting
- **Required Keywords**: Must-have for consideration
- **Preferred Keywords**: Nice-to-have
- **Weight Calculation**: Frequency * position * recency

### 2.3 Keyword Sources
```typescript
interface KeywordAnalysis {
  extracted: string[];
  required: string[];
  preferred: string[];
  scores: {
    required: number;
    preferred: number;
    total: number;
  };
  missing: string[];
  matched: string[];
}
```

### 2.4 Matching Strategies
- **Exact Match**: Same spelling
- **Fuzzy Match**: Similar terms (Python vs Py)
- **Category Match**: Same category different term
- **Synonym Match**: Different word, same meaning

---

## 3. Gap Analysis (Plural)

### 3.1 Gap Categories
- **Skills Gaps**: Missing technical skills
- **Experience Gaps**: Missing seniority/role type
- **Certification Gaps**: Missing certifications
- **Tool Gaps**: Missing required tools
- **Domain Gaps**: Missing industry knowledge

### 3.2 Gap Severity
- **Blocking**: Required, not present
- **Significant**: Preferred, significant impact
- **Minor**: Nice-to-have, minimal impact
- **None**: Present in profile

### 3.3 Gap Response
```typescript
interface GapAnalysis {
  gaps: {
    keyword: string;
    category: string;
    severity: 'blocking' | 'significant' | 'minor';
    action: string;
    suggestion?: string;
  }[];
  overall: {
    score: number;
    level: 'strong-match' | 'good-match' | 'partial-match' | 'poor-match';
  };
}
```

### 3.4 Gap Handling
- **Identify**: List all missing keywords
- **Categorize**: Group by type
- **Prioritize**: Sort by severity
- **Recommend**: Suggest additions

---

## 4. Fit Score Calculation (Plural)

### 4.1 Scoring Components
- **Skills Match**: Technical skill alignment (0-100)
- **Experience Match**: Role/seniority alignment (0-100)
- **Domain Match**: Industry knowledge (0-100)
- **Overall Score**: Weighted average

### 4.2 Scoring Weights
```typescript
interface FitScores {
  overall: number;      // 40% of total
  skills: {
    weight: number;
    score: number;
    matched: string[];
    missing: string[];
  };
  experience: {
    weight: number;
    score: number;
    factors: string[];
  };
  domain: {
    weight: number;
    score: number;
    knowledge: string[];
  };
}
```

### 4.3 Score Calculation
- **Skills Score**: (matched required * 0.7) + (matched preferred * 0.3)
- **Experience Score**: Level match + years match + role similarity
- **Domain Score**: Industry overlap + tool overlap
- **Overall**: (skills * 0.4) + (experience * 0.35) + (domain * 0.25)

### 4.4 Score Interpretation
- **90-100%**: Strong match - Apply confidently
- **70-89%**: Good match - Strong candidate
- **50-69%**: Partial match - Consider with modifications
- **<50%**: Poor match - Significant gaps

---

## 5. Bullet Tailoring (Plural)

### 5.1 Tailoring Principles
- **Keyword Integration**: Add missing keywords naturally
- **Achievement Emphasis**: Highlight relevant achievements
- **Language Matching**: Use JD language
- **Relevance Ranking**: Lead with relevant bullets

### 5.2 Tailored Suggestions
```typescript
interface BulletSuggestion {
  original: string;
  tailored: string;
  keywordsAdded: string[];
  relevanceScore: number;
  reason: string;
}
```

### 5.3 Improvement Strategies
- **Add Keywords**: Integrate missing terms
- **Quantify**: Add metrics to unquantified
- **Action Verbs**: Start with strong verbs
- **Impact Focus**: Lead with impact

### 5.4 Example Transformations
- "Managed team" → "Led cross-functional team of 8 engineers"
- "Used Python" → "Developed automation scripts in Python reducing manual effort by 40%"
- "Collaborated with stakeholders" → "Partnered with product and engineering teams to deliver features on time"

---

## 6. Cover Letter Generation (Plural)

### 6.1 Cover Letter Context
- **Target Role**: Specific role from JD
- **Candidate Profile**: MCS data
- **Alignment Fit**: JD alignment score
- **Tone**: Formal, technical, storytelling

### 6.2 Generation Approach
- **Opening**: Specific role, company reference
- **Body**: Key qualifications and fit
- **Closing**: Call to action
- **Length**: 250-400 words

### 6.3 Tone Options
- **Formal**: Professional, traditional
- **Technical**: Facts, metrics, specific
- **Storytelling**: Narrative, personal touch

### 6.4 Content Integration
- **Specific Examples**: Reference JD requirements
- **Quantified Achievements**: Numbers, metrics
- **Company Specific**: Show research
- **Call to Action**:Request meeting/call

---

## 7. Strength Analysis (Plural)

### 7.1 Strength Identification
- **Exact Matches**: Keywords matching exactly
- **Partial Matches**: Partial keyword matches
- **Transferable Skills**: Skills that transfer
- **Related Experience**: Relevant roles

### 7.2 Strength Categories
- **Technical Strength**: Hard skills matching
- **Experience Strength**: Relevant roles
- **Domain Strength**: Industry knowledge
- **Achievement Strength**: Quantified wins

### 7.3 Strength Display
```typescript
interface StrengthAnalysis {
  keywords: {
    exact: string[];
    partial: string[];
    transferable: [];
  };
  experience: {
    relevant: string[];
    similar: string[];
  };
  overall: {
    score: number;
    summary: string;
  };
}
```

### 7.4 Leveraging Strengths
- **Lead With Strengths**: Open with strongest matches
- **Match Language**: Use JD terminology
- **Quantify**: Highlight metrics
- **Connect Dots**: Show how skills transfer

---

## 8. Analysis Workflows (Plural)

### 8.1 Standard JD Analysis
1. Parse JD text
2. Extract keywords
3. Compare to profile
4. Calculate gaps
5. Compute fit score
6. Generate suggestions

### 8.2 Targeted Application
1. Select target job
2. Run full analysis
3. Review fit score
4. Apply bullet suggestions
5. Generate cover letter
6. Export tailored resume

### 8.3 Bulk Analysis
1. Upload multiple JDs
2. Compare against profile
3. Rank by fit score
4. Identify best matches
5. Prioritize applications

### 8.4 Quick Scan
1. Paste JD
2. Quick keyword extract
3. High-level gap check
4. Immediate feedback

---

## 9. JD Sources (Plural)

### 9.1 Common Sources
- **LinkedIn Jobs**: Professional, standard format
- **Indeed**: General, varied format
- **Company Websites**: Direct, role-specific
- **Job Boards**: Industry-specific
- **Recruiter Emails**: Direct, human-written

### 9.2 Parsing Strategies
- **LinkedIn**: Clean HTML, structured
- **Indeed**: Variable, requires cleaning
- **PDF**: Text extraction needed
- **DOCX**: Direct text extraction

### 9.3 URL Handling
- **Fetching**: Server-side vs client
- **Rate Limits**: Respect limits
- **Caching**: Cache parsed JDs
- **Authentication**: Handle protected URLs

---

## 10. Accuracy & Validation (Plural)

### 10.1 Analysis Validation
- **Keyword Count**: Should match JD
- **Gap Detection**: Should not miss required
- **Score Calculation**: Should align with manual review

### 10.2 Feedback Collection
- **Score Accuracy**: Did fit feel right?
- **Gap Usefulness**: Were gaps actionable?
- **Suggestion Quality**: Were bullets improved?

### 10.3 Continuous Improvement
- **Keyword Dictionary**: Add commonly missed terms
- **Pattern Updates**: Improve extraction
- **Scoring Tuning**: Weight adjustments
- **Suggestion Library**: Add proven improvements

### 10.4 Quality Metrics
- **Precision**: Keywords correctly identified
- **Recall**: No required keywords missed
- **Suggestion Rate**: Bullets actually improved
- **User Satisfaction**: Subjective quality

---

## 11. Implementation Guidelines (Plural)

### 11.1 API Integration
```typescript
interface JDTanalysisRequest {
  mcs: MCS;
  jdText: string;
  tone: 'formal' | 'technical' | 'storytelling';
  provider: string;
  model: string;
}

interface JDAnalysisResponse {
  score: number;
  subScores: {
    skills: number;
    experience: number;
    domain: number;
  };
  missingSkills: string[];
  implicitSkills: string[];
  bulletSuggestions: string[];
  coverLetter: string;
}
```

### 11.2 Keyword Matching
- **Exact Match**: Direct string match
- **Fuzzy Match**: Levenshtein distance
- **Category Match**: Same category
- **Synonym Match**: Known synonyms

### 11.3 Rate Limiting
- **API Limits**: Respect provider limits
- **User Caching**: Cache user's JDs
- **Session Caching**: Cache within session

---

## 12. Common Issues (Plural)

### 12.1 Parsing Issues
- **Problem**: Garbled text from PDF
  - **Solution**: Use better extraction library
- **Problem**: Missing sections
  - **Solution**: Improve section detection
- **Problem**: False keywords
  - **Solution**: Filter common words

### 12.2 Matching Issues
- **Problem**: False negatives
  - **Solution**: Add synonyms, fuzzy matching
- **Problem**: False positives
  - **Solution**: Context verification
- **Problem**: Score mismatch
  - **Solution**: Calibrate weights

### 12.3 Suggestion Issues
- **Problem**: Generic suggestions
  - **Solution**: Add JD-specific context
- **Problem**: Irrelevant bullets
  - **Solution**: Rank by relevance
- **Problem**: Over-stuffing keywords
  - **Solution**: Natural integration only

---

*This skill represents mastery of JD analysis and targeting. It enables precise alignment between candidate qualifications and job requirements with actionable insights and improvements.*

*The goal is not to mislead ATS, but to present the candidate authentically in the best possible light.*