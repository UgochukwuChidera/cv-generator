---
name: cv-export-configuration
description: Configure and manage CV/resume export settings including formats, templates, themes, and output options for the Nexus CV Generator. Handle PDF, DOCX, and other export configurations.
---

This skill enables comprehensive export configuration and management for the Nexus CV Generator. It covers all export formats, templates, themes, and delivery options.

The agent must understand that export is the final step in the CV generation process. The configuration must produce professional, ATS-compatible documents that look great and parse correctly.

## Export Philosophy

### Purpose-Driven Export
- **Format Selection**: Choose right format for intended use
- **Template Matching**: Match template to industry/role
- **Theme Application**: Apply visual theme consistently
- **Quality Assurance**: Verify output before delivery

### Export Types
- **PDF**: Final, formatted, uneditable, ATS-friendly
- **DOCX**: Editable, format-preserving, some ATS compatibility
- **JSON/YAML**: Machine-readable, full data export
- **Plain Text**: Maximum ATS compatibility, no formatting

---

## 1. Export Formats (Plural)

### 1.1 PDF Export
- **Use Case**: Final submissions, online applications, email attachments
- **Advantages**: Professional, uneditable, renders consistently
- **ATS Compatibility**: Good (verify with parser)
- **Configuration Options**:
  - Page size (A4, Letter)
  - Margins (0.5", 0.75", 1")
  - Compression level
  - Font embedding

### 1.2 DOCX Export
- **Use Case**: When applicant tracking requires .docx
- **Advantages**: Editable, widely supported
- **Limitations**: Formatting may shift
- **Configuration Options**:
  - Compatibility mode
  - Track changes off
  - Images embedded

### 1.3 JSON Export
- **Use Case**: Data backup, portability, programmatic use
- **Advantages**: Full data preservation, machine-readable
- **Structure**: MCS-compliant schema
- **Metadata**: Include export timestamp

### 1.4 YAML Export
- **Use Case**: Configuration files, dev tools
- **Advantages**: Human-readable, widely supported
- **Structure**: MCS-compliant schema
- **Version**: Include schema version

### 1.5 Plain Text Export
- **Use Case**: Maximum ATS compatibility
- **Advantages**: Parses everywhere
- **Limitations**: No formatting, loses structure
- **Use With**: Legacy ATS systems

---

## 2. Template Configuration (Plural)

### 2.1 Template Selection
- **Professional**: Conservative, traditional, corporate-friendly
- **Modern**: Clean, contemporary, tech-friendly
- **Technical**: Dense, skills-focused, technical roles
- **Academic**: Comprehensive, publication-focused
- **Creative**: Portfolio-showcasing, creative roles

### 2.2 Template Components
```typescript
interface ExportTemplate {
  id: string;
  name: string;
  theme: ExportTheme;
  layout: 'single' | 'two-column' | 'sidebar';
  sections: SectionConfig[];
  fonts: FontConfig;
  colors: ColorConfig;
}
```

### 2.3 Template Variables
- **Static**: Name, title, email unchanged
- **Dynamic**: Sections shown based on data presence
- **Conditional**: Experience length determines expansion
- **Formattable**: Dates formatted per locale

### 2.4 Custom Templates
- **Structure**: Define section order
- **Styling**: Fonts, colors, spacing per section
- **Conditional Logic**: Show/hide based on data
- **Export Options**: Per-template configuration

---

## 3. Theme Configuration (Plural)

### 3.1 Theme Options
- **Professional Theme**:
  - Primary font: Times New Roman, Georgia
  - Accent: Navy blue (#003366), Dark gray
  - Layout: Traditional, single column
  
- **Modern Theme**:
  - Primary font: Arial, Calibri, Roboto
  - Accent: Black, single accent color
  - Layout: Clean, generous whitespace
  
- **Technical Theme**:
  - Primary font: Monospace option, sans-serif
  - Feature: Dense skills section
  - Layout: Skills prominent

### 3.2 Theme Variables
```typescript
interface ExportTheme {
  name: 'Professional' | 'Modern' | 'Technical' | 'Academic' | 'Creative';
  colors: {
    primary: string;    // Main text
    secondary: string; // Metadata
    accent: string;   // Headers, highlights
    background: string; // Document background
  };
  fonts: {
    header: string;
    body: string;
    accent: string;
  };
  layout: {
    type: 'single' | 'two-column' | 'sidebar';
    margins: string;
  };
}
```

### 3.3 Accent Color Options
- **Professional Blues**: #003366, #1a365d, #2563eb
- **Classic Reds**: #8b0000, #b91c1c
- **Neutral Blacks**: #111111, #1f2937
- **Industry Greens**: #065f46, #047857
- **Custom**: User-selected accent

### 3.4 Custom Theme Creation
- **Name**: Descriptive theme name
- **Preview**: Visual preview
- **Configuration**: All theme options
- **Save/Load**: Persist theme selection

---

## 4. Document Configuration (Plural)

### 4.1 Document Types
- **Resume**: Concise (1-2 pages), role-focused
- **CV**: Comprehensive (2+ pages), full history
- **Cover Letter**: Personalized introduction

### 4.2 Document Settings
```typescript
interface DocumentConfig {
  type: 'resume' | 'cv' | 'cover-letter';
  format: 'PDF' | 'DOCX' | 'JSON' | 'YAML' | 'TEXT';
  template: string;
  theme: ExportTheme;
  length: {
    maxPages: number;
    maxExperience: number;
    maxSkills: number;
  };
  sections: {
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    awards: boolean;
  };
}
```

### 4.3 Section Control
- **Enable/Disable**: Show/hide sections
- **Reorder**: Change section order
- **Collapse**: Minimize or expand sections
- **Custom Headers**: Custom section titles

### 4.4 Content Limits
- **Experience Entries**: Resume: 3-5, CV: All relevant
- **Skills Display**: Resume: 12-18, CV: All
- **Bullet Points**: Resume: 3-4 per role, CV: 4-6
- **Education**: Resume: Last 2, CV: All relevant

---

## 5. Font Configuration (Plural)

### 5.1 Font Options
- **Mono**: JetBrains Mono, Consolas (technical)
- **Sans**: Inter, Arial, Segoe UI (modern)
- **Serif**: Times New Roman, Georgia (traditional)

### 5.2 Font Configuration
```typescript
interface FontConfig {
  family: string;
  sizes: {
    header: number;
    sectionHeader: number;
    body: number;
    metadata: number;
  };
  weights: {
    header: 'normal' | 'bold';
    sectionHeader: 'normal' | 'bold';
    body: 'normal';
  };
  lineHeight: number;
}
```

### 5.3 System Font Fallbacks
- **Sans-serif**: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Serif**: Georgia, 'Times New Roman', serif
- **Monospace**: 'JetBrains Mono', 'Fira Code', Consolas, monospace

### 5.4 Print Considerations
- **Embedded Fonts**: Ensure fonts embed in PDF
- **Substitution**: Define backup fonts
- **Character Set**: Include all needed characters

---

## 6. Export Quality Assurance (Plural)

### 6.1 Pre-Export Checklist
- [ ] Profile completeness >80%
- [ ] No validation errors
- [ ] Selected template matches document type
- [ ] Theme/colors applied correctly
- [ ] All required sections present

### 6.2 Post-Export Checks
- [ ] File renders correctly
- [ ] All content visible
- [ ] Page breaks sensible
- [ ] Links/urls work
- [ ] File size reasonable (<1MB typical)

### 6.3 ATS Verification
- [ ] Upload to test parser
- [ ] All sections recognized
- [ ] Keywords extracted
- [ ] No content missing

### 6.4 Quality Metrics
- **File Size**: <500KB preferred, <1MB max
- **Pages**: 1-2 for resume, 2+ for CV
- **Images**: Use sparingly, compress well

---

## 7. Export Workflows (Plural)

### 7.1 Standard Resume Export
1. Select "Resume" document type
2. Choose "Professional" template
3. Select PDF format
4. Configure theme/colors
5. Set max 2 pages
6. Export

### 7.2 Comprehensive CV Export
1. Select "CV" document type
2. Choose "Academic" or "Technical" template
3. Select PDF format
4. Expand sections as needed
5. Include all relevant experience
6. Export

### 7.3 Cover Letter Export
1. Select "Cover Letter" document type
2. Generate with JD context
3. Choose matching template
4. Use accent from theme
5. Export as PDF or DOCX

### 7.4 Data Export
1. Select JSON or YAML format
2. Include all fields
3. Include metadata
4. Export for backup/portability

---

## 8. Configuration Persistence (Plural)

### 8.1 User Preferences
- **Saved Templates**: User's custom templates
- **Theme Selection**: Last used theme
- **Format Preference**: Last used format
- **Document Settings**: Last document type

### 8.2 Session State
- **Current Export**: Configuration being used
- **Progress**: Export in progress
- **Preview State**: Zoom level, scroll position

### 8.3 Export History
- **Recent Exports**: Last 5 exports with timestamps
- **Download Links**: Direct download URLs
- **Format/Template**: Config used for each

---

## 9. Error Handling (Plural)

### 9.1 Configuration Errors
- **Missing Template**: Fall back to default
- **Invalid Theme**: Use default theme
- **Missing Font**: Use system fallback
- **Format Unavailable**: Offer alternatives

### 9.2 Generation Errors
- **Empty Content**: Return to editor with message
- **Export Failure**: Retry with different settings
- **File Too Large**: Suggest content limits
- **Timeout**: Process in background

### 9.3 Recovery Options
- **Retry**: Attempt export again
- **Alternative Format**: Try different format
- **Simplified Export**: Use basic template
- **Download Link**: Email link for large files

---

## 10. Output Formats (Plural)

### 10.1 File Naming
- **Standard**: [FirstName_LastName_Resume.pdf]
- **With Date**: [FirstName_LastName_Resume_2024.pdf]
- **With Role**: [FirstName_LastName_SoftwareEng_Resume.pdf]
- **Cover Letter**: [FirstName_LastName_CoverLetter.pdf]

### 10.2 MIME Types
- PDF: application/pdf
- DOCX: application/vnd.openxmlformats-officedocument.wordprocessingml.document
- JSON: application/json
- YAML: application/x-yaml
- TEXT: text/plain

### 10.3 Headers
- Content-Disposition: attachment; filename="..."
- Content-Type: [appropriate MIME type]
- X-Export-Metadata: { config used }

---

## 11. Integration Points (Plural)

### 11.1 Editor Integration
- **Preview**: Real-time preview updates
- **Apply Theme**: Theme applies to preview
- **Export Button**: Triggers export flow

### 11.2 JD Targeting Integration
- **Tailored Content**: Export uses tailored MCS
- **Keywords**: Ensure keywords present
- **Cover Letter**: Generate within export

### 11.3 API Endpoints
- **POST /api/generate/pdf**: PDF generation
- **POST /api/generate/docx**: DOCX generation
- **POST /api/generate/export**: Other formats
- **Response**: File blob or URL

---

*This skill represents mastery of CV export configuration. It ensures the right format, template, and settings are chosen for each use case, producing professional outputs that work for both human readers and ATS systems.*

*The final document represents all the work put in. Make every export count.*