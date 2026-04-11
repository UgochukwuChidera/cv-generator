# Nexus Web App

The web surface is a guided AI workflow for creating production-ready resumes and cover-letter deliverables.

## Implemented workflow

1. **Chat (`/`)**
   - Upload or paste resume input (`.txt`, `.pdf`, `.docx`, `.json`, `.yaml`)
   - AI extracts a structured MCS draft
   - Missing required fields are detected and follow-up clarification prompts are generated
   - Clarification responses are merged back into MCS

2. **Editor (`/editor`)**
   - Full editable sections: Profile, Experience, Education, Skills, Projects, Languages
   - CRUD and reordering for experience entries
   - Live preview and per-section completeness indicators
   - Cover letter is intentionally **not** an editor input section

3. **JD Targeting (`/jd-targeting`)**
   - AI alignment analysis with fit score + sub-scores
   - Missing and matched skill extraction
   - Data-driven bullet suggestions
   - Cover letter generation as a deliverable (stored in profile)

4. **Export (`/export`)**
   - Validated export formats: PDF, DOCX, HTML, JSON, YAML
   - Cover letters are persisted in profile data and included in structured exports

## Validation

From repository root:

```bash
npm run lint --workspace=web
npm run build --workspace=web
```
