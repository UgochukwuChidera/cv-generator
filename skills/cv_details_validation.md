---
name: cv-details-validation
description: Validate and verify CV/resume data completeness, accuracy, and quality across all fields. Perform comprehensive data integrity checks including required fields, data types, formats, and consistency.
---

This skill enables comprehensive validation and quality assurance for CV/resume data in the Nexus CV Generator. It covers all aspects of data validation from field-level checks to cross-field consistency and completeness scoring.

The agent must understand that validation is multi-layered: individual field validation, cross-field consistency, completeness assessment, and quality scoring.

## Validation Philosophy

### Purpose-Driven Validation
- **Completeness**: Are all required fields populated?
- **Accuracy**: Is data in the correct format?
- **Consistency**: Do related fields make sense together?
- **Quality**: Is the content meaningful and professional?

### Validation Layers (Plural)
- **Field-Level**: Individual field validation (type, format, length)
- **Section-Level**: Section completeness and structure
- **Cross-Field**: Related field consistency
- **Overall**: Complete profile quality score

---

## 1. Field Validation Rules (Plural)

### 1.1 Required Fields (Plural)
- **personal.name**: Required. Full name, 2-100 characters.
- **personal.email**: Required. Valid email format.
- **personal.title**: Required. Job title or role target.
- **experience[]**: At least one entry required.
- **experience[].role**: Required. Job title.
- **experience[].company**: Required. Company name.
- **experience[].startDate**: Required. MM/YYYY format.

### 1.2 Optional Fields (Plural)
- **personal.phone**: Valid phone format (international with + or standard US)
- **personal.location**: City, State/Country format
- **personal.linkedin**: Valid LinkedIn URL format
- **personal.website**: Valid URL format
- **summary**: Professional summary, 50-500 characters
- **experience[].endDate**: For non-current roles. After startDate.
- **experience[].location**: City, State/Country format
- **experience[].bullets[]**: At least 2-3 bullets per role
- **education[]**: Educational background entries
- **skills[]**: Categorized skill listings
- **projects[]**: Notable project entries
- **awards[]**: Recognition and achievements

### 1.3 Data Type Validation (Plural)
- **Strings**: Non-empty, trimmed, max length (2000 for text fields)
- **Dates**: MM/YYYY, ISO 8601, or standard date formats
- **URLs**: HTTP/HTTPS, valid domain
- **Emails**: RFC 5322 compliant format
- **Phone Numbers**: E.164 or standard formats
- **Arrays**: Non-empty arrays where required
- **Objects**: Required properties present

### 1.4 Format Validation (Plural)
- **Name**: Title case, no special characters except hyphen/apostrophe
- **Email**: All lowercase, valid domain
- **URL**: Protocol prefix (https://), valid domain, no spaces
- **Date**: Consistent format throughout (choose one: MM/YYYY or Month YYYY)
- **Location**: "City, Country" or "City, State" format

---

## 2. Section Validation (Plural)

### 2.1 Personal Information
- [ ] Name is complete and correct
- [ ] Email is valid and accessible
- [ ] Phone has correct country code if international
- [ ] Location is specific (not just country)
- [ ] LinkedIn URL is valid profile URL
- [ ] Website/Portfolio is live and relevant

### 2.2 Summary/Profile
- [ ] Summary exists (optional but recommended)
- [ ] Length is appropriate (50-500 characters)
- [ ] Contains value proposition
- [ ] Mentions target role/industry
- [ ] No generic statements
- [ ] Professional tone

### 2.3 Experience Section
- [ ] At least one experience entry
- [ ] Entries in reverse chronological order
- [ ] No future dates
- [ ] Dates are consistent format
- [ ] Each role has achievements (bullets)
- [ ] Bullets quantify achievements
- [ ] No gaps >2 years unexplained
- [ ] Current role marked appropriately

### 2.4 Education Section
- [ ] Entries in reverse chronological order
- [ ] Degrees/institutions verified
- [ ] Dates are realistic
- [ ] Relevant coursework if entry-level
- [ ] GPA included if notable (>3.5)

### 2.5 Skills Section
- [ ] Skills present and categorized
- [ ] Technical skills separated from soft skills
- [ ] No duplicate skills
- [ ] Relevant to target role
- [ ] Current technologies included
- [ ] Skills have proficiency levels if applicable

### 2.6 Projects Section (Optional)
- [ ] Projects demonstrate skills
- [ ] Links/demos work if included
- [ ] Outcomes are quantified
- [ ] Technologies used listed

---

## 3. Cross-Field Validation (Plural)

### 3.1 Date Consistency
- **Experience dates**: End date must be after start date
- **Chronological order**: Newest first
- **Gaps**: No unexplained gaps >6 months
- **Education dates**: Degree completion before employment start (typically)
- **Current roles**: Should be most recent or clearly marked

### 3.2 Content Consistency
- **Title alignment**: Job titles should align with company/industry
- **Location consistency**: Where located should match experience locations
- **Skill relevance**: Skills should align with roles/industry
- **Summary alignment**: Summary should reflect actual experience

### 3.3 Numerical Consistency
- **Metric formatting**: Consistent format ($100K vs 100000)
- **Percentage formatting**: Consistent (50% vs 50 percent)
- **Year formatting**: Consistent (2020 vs '20 vs two thousand twenty)
- **Date separators**: Consistent (01/2020 vs Jan 2020)

### 3.4 URL/Link Validation
- **Working links**: All URLs should be accessible
- **Current content**: LinkedIn profiles should be current
- **Relevant content**: Websites should showcase relevant work

---

## 4. Completeness Scoring (Plural)

### 4.1 Field Completeness Matrix
| Field | Required | Weight | Max Score |
|-------|----------|--------|----------|
| personal.name | Yes | 5 | 5 |
| personal.email | Yes | 10 | 10 |
| personal.title | Yes | 5 | 5 |
| personal.phone | No | 3 | 3 |
| personal.location | No | 3 | 3 |
| personal.linkedin | No | 2 | 2 |
| personal.website | No | 2 | 2 |
| summary | No | 5 | 5 |
| experience[] | Yes | 15 | 15 |
| experience[].bullets | Yes | 10 | 10 |
| education[] | No | 5 | 5 |
| skills[] | No | 10 | 10 |
| projects[] | No | 5 | 5 |
| awards[] | No | 3 | 3 |

### 4.2 Completeness Calculation
```
Completeness = (Sum of weighted scores / Total possible) * 100
```

### 4.3 Quality Thresholds
- **Complete**: 90%+ - Ready for export
- **Good**: 70-89% - Minor additions needed
- **Partial**: 50-69% - Significant work needed
- **Incomplete**: <50% - Major reconstruction needed

---

## 5. Quality Validation (Plural)

### 5.1 Content Quality Checks
- **Professional language**: No slang, profanity, or casual language
- **Active voice**: Action verbs, not passive
- **Quantified achievements**: Numbers, percentages, dollar amounts
- **No copy errors**: Spelling, grammar checked
- **Consistent terminology**: Same terms for same things
- **No redundancy**: Each bullet adds new information

### 5.2 Resume-Specific Checks
- **Length appropriate**: 1-2 pages for most, more for academic/senior
- **Tailored content**: Relevant to target role
- **Achievement-focused**: Not just duties
- **Keywords included**: Industry/role relevant terms
- **No sensitive info**: No personal identifiers

### 5.3 Formatting Quality
- **Consistent spacing**: Same spacing throughout
- **Consistent fonts**: Same font family throughout
- **Consistent formatting**: Same bullet style, date format, etc.
- **Clean layout**: No clutter or excessive density
- **Proper alignment**: All content aligned properly

### 5.4 ATS Compatibility Checks
- [ ] Standard section headers used
- [ ] No complex formatting
- [ ] Keywords present
- [ ] Proper file format
- [ ] No special characters causing issues

---

## 6. Validation Error Handling (Plural)

### 6.1 Error Categories
- **BLOCKING**: Cannot proceed without resolution (missing required fields)
- **WARNING**: Should fix but not blocking (format inconsistencies)
- **INFO**: Suggestions for improvement (optional fields missing)

### 6.2 Error Messages
- **Field-specific**: Clear indication which field has issue
- **Human-readable**: User can understand the issue
- **Actionable**: Clear how to fix the issue
- **Prioritized**: Most important issues first

### 6.3 Validation Response Format
```typescript
interface ValidationResult {
  isValid: boolean;
  score: number;
  completeness: number;
  quality: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
 fix?: string;
}
```

---

## 7. Missing Field Detection (Plural)

### 7.1 Required Field Gaps
- Prompt for: Name, Email, Title, Experience
- Guide for: Location, Phone, LinkedIn

### 7.2 Experience Gaps
- Check for: At least one role with achievements
- Check for: Recent experience (last 1-2 years)
- Check for: Increasing responsibility

### 7.3 Content Gaps
- Check for: Missing professional summary
- Check for: Missing skills section
- Check for: Missing quantified achievements

### 7.4 Recommended Prompts
- "Your profile is 40% complete. Add a work experience to reach 60%."
- "Add achievements to your most recent role for maximum impact."
- "Include relevant skills for better JD alignment."

---

## 8. Validation Workflows (Plural)

### 8.1 Initial Validation
1. Check required fields present
2. Validate field formats
3. Calculate completeness score
4. Return actionable feedback

### 8.2 Pre-Export Validation
1. All required fields present
2. No validation errors
3. ATS compatibility confirmed
4. Quality score acceptable

### 8.3 Pre-JD Alignment Validation
1. Experience with achievements verified
2. Skills section populated
3. Summary present
4. Recent experience confirmed

### 8.4 Progressive Validation
1. Validate on field blur
2. Validate on section completion
3. Real-time feedback
4. Don't block progress unnecessarily

---

## 9. Validation Implementation (Plural)

### 9.1 Zod Schemas
```typescript
const PersonalSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  title: z.string().min(2).max(100),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
});
```

### 9.2 Validation Functions
```typescript
function validateMCS(mcs: MCS): ValidationResult {
  // Field-level validation
  // Cross-field validation
  // Completeness scoring
  // Quality assessment
}
```

### 9.3 Error Aggregation
```typescript
function aggregateErrors(errors: ValidationError[]): ValidationResult {
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    // Aggregate scores
  };
}
```

---

## 10. Quality Assurance (Plural)

### 10.1 Pre-Generation Checks
- [ ] Profile has >50% completeness
- [ ] No blocking errors
- [ ] Required sections present
- [ ] Content passes quality checks

### 10.2 Pre-Export Checks
- [ ] Completeness >80%
- [ ] All validation errors resolved
- [ ] ATS compatibility verified
- [ ] Document renders correctly

### 10.3 Pre-JD Targeting Checks
- [ ] At least 2 experience entries
- [ ] Achievements have quantifiable metrics
- [ ] Skills section populated
- [ ] Summary present

### 10.4 Final Review Checks
- [ ] Spelling/grammar verified
- [ ] Formatting consistent
- [ ] Links working
- [ ] File size reasonable

---

## 11. Common Validation Issues (Plural)

### 11.1 Personal Info Issues
- **Missing email**: Required. Prompt user to add.
- **Invalid email format**: Show correct format example.
- **Generic email**: Suggest professional email.
- **Missing name**: Required. Must add.

### 11.2 Experience Issues
- **No experience**: Required. Guide to add.
- **Missing achievements**: Prompt for bullets.
- **Duties vs achievements**: Distinguish between the two.
- **Undated roles**: Add start/end dates.

### 11.3 Content Issues
- **Too short**: Encourage more detail.
- **Too long**: Trim unnecessary content.
- **Generic bullets**: Prompt for quantified achievements.
- **No keywords**: Suggest adding industry terms.

### 11.4 Format Issues
- **Inconsistent dates**: Standardize to one format.
- **Mixed formats**: Choose consistent format.
- **Unusual characters**: Sanitize input.

---

*This skill represents mastery of CV data validation. It ensures data completeness, accuracy, and quality through comprehensive field-level, section-level, and cross-field validation with actionable feedback.*

*Validation should guide, not block. Help users improve without frustrating them.*