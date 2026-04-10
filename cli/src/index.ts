#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import { MCSSchema } from '@nexus/schema';

const program = new Command();

const DATA_DIR = path.join(os.homedir(), '.nexus');
const MCS_FILE = path.join(DATA_DIR, 'mcs.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadMCS() {
  if (!fs.existsSync(MCS_FILE)) {
    return null;
  }
  const raw = fs.readFileSync(MCS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveMCS(data: unknown) {
  ensureDataDir();
  fs.writeFileSync(MCS_FILE, JSON.stringify(data, null, 2));
}

const THEMES = ['professional', 'modern', 'creative', 'academic', 'minimal'];

program
  .name('nexus')
  .description('Nexus CLI — personal career document platform')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new career profile')
  .action(async () => {
    const { default: inquirer } = await import('inquirer');
    console.log(chalk.bold.blue('\n🚀 Welcome to Nexus!\n'));
    
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Full name:' },
      { type: 'input', name: 'title', message: 'Job title/headline:' },
      { type: 'input', name: 'email', message: 'Email:' },
      { type: 'input', name: 'phone', message: 'Phone (optional):' },
      { type: 'input', name: 'location', message: 'Location:' },
      { type: 'input', name: 'linkedin', message: 'LinkedIn URL (optional):' },
      { type: 'input', name: 'github', message: 'GitHub URL (optional):' },
    ]);

    const mcs = MCSSchema.parse({
      personal: answers,
      meta: { version: 1, updated_at: new Date().toISOString() },
    });

    saveMCS(mcs);
    console.log(chalk.green('\n✅ Profile created at ' + MCS_FILE));
  });

program
  .command('import')
  .description('Import career data from a file')
  .option('--file <path>', 'Path to resume file (txt, json, yaml)')
  .action(async (opts: { file?: string }) => {
    if (!opts.file) {
      console.error(chalk.red('Error: --file is required'));
      process.exit(1);
    }
    
    const spinner = ora('Reading file...').start();
    try {
      const content = fs.readFileSync(opts.file, 'utf-8');
      const ext = path.extname(opts.file).toLowerCase();
      
      let data: unknown;
      if (ext === '.json') {
        data = JSON.parse(content);
      } else if (ext === '.yaml' || ext === '.yml') {
        data = yaml.load(content);
      } else {
        data = {
          personal: { name: '', title: '' },
          summary: content.slice(0, 500),
          meta: { version: 1, updated_at: new Date().toISOString() },
        };
      }
      
      const mcs = MCSSchema.parse(data);
      saveMCS(mcs);
      spinner.succeed(chalk.green('Imported successfully to ' + MCS_FILE));
    } catch (e) {
      spinner.fail(chalk.red('Import failed: ' + String(e)));
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate resume documents')
  .option('--theme <theme>', 'Theme to use', 'professional')
  .option('--format <formats>', 'Comma-separated formats: json,yaml,html', 'html')
  .action(async (opts: { theme: string; format: string }) => {
    const mcs = loadMCS();
    if (!mcs) {
      console.error(chalk.red('No profile found. Run: nexus init'));
      process.exit(1);
    }

    const formats = opts.format.split(',').map((f: string) => f.trim());
    const spinner = ora('Generating documents...').start();
    
    try {
      for (const fmt of formats) {
        let content = '';
        const name = (mcs.personal?.name || 'resume').replace(/\s+/g, '_').toLowerCase();
        
        if (fmt === 'json') {
          content = JSON.stringify(mcs, null, 2);
          fs.writeFileSync(`${name}.json`, content);
        } else if (fmt === 'yaml') {
          content = yaml.dump(mcs);
          fs.writeFileSync(`${name}.yaml`, content);
        } else if (fmt === 'html') {
          content = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${mcs.personal?.name || 'Resume'}</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
  h1 { font-size: 2em; margin-bottom: 0.2em; }
  h2 { border-bottom: 1px solid #ccc; margin-top: 1.5em; text-transform: uppercase; font-size: 0.9em; letter-spacing: 0.1em; }
  ul { padding-left: 1.5em; }
  .contact { color: #666; font-size: 0.9em; }
  .job { margin-bottom: 1em; }
  .job-header { display: flex; justify-content: space-between; }
  .company { color: #555; }
  .date { color: #888; font-size: 0.85em; }
</style>
</head>
<body>
<h1>${mcs.personal?.name || ''}</h1>
<p class="contact">${[mcs.personal?.title, mcs.personal?.email, mcs.personal?.phone, mcs.personal?.location].filter(Boolean).join(' | ')}</p>
${mcs.summary ? `<h2>Summary</h2><p>${mcs.summary}</p>` : ''}
${mcs.experience?.length ? `<h2>Experience</h2>${mcs.experience.map((e: { role: string; company: string; startDate?: string; current?: boolean; endDate?: string; location?: string; bullets?: string[] }) => `
  <div class="job">
    <div class="job-header">
      <strong>${e.role}</strong>
      <span class="date">${e.startDate || ''} – ${e.current ? 'Present' : e.endDate || ''}</span>
    </div>
    <div class="company">${e.company}${e.location ? ', ' + e.location : ''}</div>
    ${e.bullets?.length ? `<ul>${e.bullets.map((b: string) => `<li>${b}</li>`).join('')}</ul>` : ''}
  </div>`).join('')}` : ''}
${mcs.education?.length ? `<h2>Education</h2>${mcs.education.map((edu: { institution: string; degree?: string; field?: string; startDate?: string; endDate?: string; gpa?: string }) => `
  <div class="job">
    <div class="job-header">
      <strong>${edu.institution}</strong>
      <span class="date">${edu.startDate || ''} – ${edu.endDate || ''}</span>
    </div>
    <div class="company">${[edu.degree, edu.field ? 'in ' + edu.field : ''].filter(Boolean).join(' ')}</div>
    ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
  </div>`).join('')}` : ''}
${mcs.skills?.length ? `<h2>Skills</h2><p>${mcs.skills.map((s: { name: string }) => s.name).join(' · ')}</p>` : ''}
</body></html>`;
          fs.writeFileSync(`${name}.html`, content);
        }
        spinner.text = `Generated ${fmt.toUpperCase()}...`;
      }
      spinner.succeed(chalk.green(`Generated: ${formats.join(', ')}`));
    } catch (e) {
      spinner.fail(chalk.red('Generation failed: ' + String(e)));
      process.exit(1);
    }
  });

program
  .command('generate-all')
  .description('Generate all resume formats')
  .option('--theme <theme>', 'Theme to use', 'professional')
  .action(async (opts: { theme: string }) => {
    const mcs = loadMCS();
    if (!mcs) {
      console.error(chalk.red('No profile found. Run: nexus init'));
      process.exit(1);
    }
    console.log(chalk.blue('Generating all formats...'));
    const formats = ['json', 'yaml', 'html'];
    const name = (mcs.personal?.name || 'resume').replace(/\s+/g, '_').toLowerCase();
    
    fs.writeFileSync(`${name}.json`, JSON.stringify(mcs, null, 2));
    fs.writeFileSync(`${name}.yaml`, yaml.dump(mcs));
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${mcs.personal?.name || 'Resume'}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px;color:#333}
h1{font-size:2em;margin-bottom:0.2em}h2{border-bottom:1px solid #ccc;margin-top:1.5em}
ul{padding-left:1.5em}</style></head>
<body>
<h1>${mcs.personal?.name || ''}</h1>
<p>${mcs.personal?.title || ''} | ${mcs.personal?.email || ''} | ${mcs.personal?.location || ''}</p>
${mcs.summary ? `<h2>Summary</h2><p>${mcs.summary}</p>` : ''}
${mcs.experience?.length ? `<h2>Experience</h2>${mcs.experience.map((e: { role: string; company: string; bullets?: string[] }) => `<h3>${e.role} at ${e.company}</h3><ul>${(e.bullets || []).map((b: string) => `<li>${b}</li>`).join('')}</ul>`).join('')}` : ''}
${mcs.skills?.length ? `<h2>Skills</h2><p>${mcs.skills.map((s: { name: string }) => s.name).join(', ')}</p>` : ''}
</body></html>`;
    fs.writeFileSync(`${name}.html`, htmlContent);
    console.log(chalk.green(`✅ Generated: ${formats.join(', ')}`));
  });

program
  .command('optimize')
  .description('Optimize resume for a job description')
  .option('--jd <path>', 'Path to job description file')
  .action((opts: { jd?: string }) => {
    if (!opts.jd) {
      console.error(chalk.red('Error: --jd is required'));
      process.exit(1);
    }
    const mcs = loadMCS();
    if (!mcs) {
      console.error(chalk.red('No profile found. Run: nexus init'));
      process.exit(1);
    }
    console.log(chalk.yellow('⚠️  AI optimization requires a web connection and API key.'));
    console.log(chalk.blue('Use the web interface at http://localhost:3000 for AI-powered optimization.'));
    console.log(chalk.gray(`JD file: ${opts.jd}`));
  });

program
  .command('cover-letter')
  .description('Generate a cover letter')
  .option('--jd <path>', 'Path to job description file')
  .option('--tone <tone>', 'Tone: formal, casual, enthusiastic', 'formal')
  .action((opts: { jd?: string; tone: string }) => {
    if (!opts.jd) {
      console.error(chalk.red('Error: --jd is required'));
      process.exit(1);
    }
    const mcs = loadMCS();
    if (!mcs) {
      console.error(chalk.red('No profile found. Run: nexus init'));
      process.exit(1);
    }
    console.log(chalk.yellow('⚠️  Cover letter generation requires an AI provider.'));
    console.log(chalk.blue('Use the web interface at http://localhost:3000 for AI-powered cover letters.'));
    console.log(chalk.gray(`JD: ${opts.jd}, Tone: ${opts.tone}`));
  });

program
  .command('list-themes')
  .description('List available resume themes')
  .action(() => {
    console.log(chalk.bold('\nAvailable Themes:\n'));
    const descriptions: Record<string, string> = {
      professional: 'Clean, ATS-safe format',
      modern: 'Visual hierarchy with sidebar',
      creative: 'Distinctive design',
      academic: 'CV-style for academia',
      minimal: 'Simple and elegant',
    };
    THEMES.forEach((t) => {
      console.log(`  ${chalk.blue(t.padEnd(15))} ${chalk.gray(descriptions[t] || '')}`);
    });
    console.log();
  });

program
  .command('export')
  .description('Export profile to a format')
  .option('--format <format>', 'Output format: json, yaml', 'json')
  .option('--output <path>', 'Output file path')
  .action((opts: { format: string; output?: string }) => {
    const mcs = loadMCS();
    if (!mcs) {
      console.error(chalk.red('No profile found. Run: nexus init'));
      process.exit(1);
    }

    let content = '';
    if (opts.format === 'yaml') {
      content = yaml.dump(mcs);
    } else {
      content = JSON.stringify(mcs, null, 2);
    }

    const outPath = opts.output || `nexus-export.${opts.format}`;
    fs.writeFileSync(outPath, content);
    console.log(chalk.green(`✅ Exported to ${outPath}`));
  });

program
  .command('history')
  .description('Show version history')
  .action(() => {
    const mcs = loadMCS();
    if (!mcs) {
      console.error(chalk.red('No profile found. Run: nexus init'));
      process.exit(1);
    }

    console.log(chalk.bold('\nVersion History:\n'));
    console.log(`  Current: ${chalk.blue('v' + (mcs.meta?.version || 1))} — ${chalk.gray(mcs.meta?.updated_at || 'unknown')}`);
    
    const history = mcs.history || [];
    if (history.length === 0) {
      console.log(chalk.gray('\n  No previous versions.\n'));
    } else {
      history.forEach((h: { meta?: { version?: number; updated_at?: string } }, i: number) => {
        console.log(`  v${h.meta?.version || i + 1} — ${chalk.gray(h.meta?.updated_at || 'unknown')}`);
      });
      console.log();
    }
  });

program
  .command('rollback')
  .description('Rollback to a previous version')
  .option('--version <n>', 'Version number to rollback to')
  .action((opts: { version?: string }) => {
    const mcs = loadMCS();
    if (!mcs) {
      console.error(chalk.red('No profile found. Run: nexus init'));
      process.exit(1);
    }

    const targetVersion = opts.version ? parseInt(opts.version, 10) : null;
    if (!targetVersion) {
      console.error(chalk.red('Error: --version is required'));
      process.exit(1);
    }

    const history: Array<{ meta?: { version?: number } }> = mcs.history || [];
    const target = history.find((h) => h.meta?.version === targetVersion);
    
    if (!target) {
      console.error(chalk.red(`Version ${targetVersion} not found in history.`));
      console.log(chalk.gray('Run: nexus history'));
      process.exit(1);
    }

    const currentHistory = [...history.filter((h) => h.meta?.version !== targetVersion)];
    currentHistory.push({ ...mcs, history: [] });
    
    const restored = { ...target, history: currentHistory, meta: { ...target.meta, updated_at: new Date().toISOString() } };
    saveMCS(restored);
    console.log(chalk.green(`✅ Rolled back to version ${targetVersion}`));
  });

program.parse();
