#!/usr/bin/env node

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const ROOT = process.cwd();
const PROJECT_DIR = path.join(ROOT, '_project');
const TASKNOTE_DIR = path.join(PROJECT_DIR, 'tasknote');
const ARCHIVE_DIR = path.join(TASKNOTE_DIR, 'archive');
const ARCHIVE_SUBFOLDERS = ['core', 'frontend', 'backend', 'deployment', 'testing', 'database'];

const TEMPLATES_DIR = path.join(ROOT, 'templates');
const TASKNOTE_TEMPLATE = path.join(TEMPLATES_DIR, 'tasknote-template.json');

function logInfo(message) {
  process.stdout.write(`INFO  ${message}\n`);
}

function logWarn(message) {
  process.stdout.write(`WARN  ${message}\n`);
}

function logError(message) {
  process.stderr.write(`ERROR ${message}\n`);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logInfo(`Created: ${path.relative(ROOT, dirPath)}`);
  }
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJsonPretty(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + '\n', 'utf8');
}

function pathExists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function listJsonFiles(dir) {
  if (!pathExists(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.json'))
    .map((d) => d.name);
}

function listJsonFilePaths(dir) {
  return listJsonFiles(dir).map((name) => path.join(dir, name));
}

function usage() {
  const rel = (p) => path.relative(ROOT, p) || '.';
  console.log(`
Flowtron CLI

Usage:
  node scripts/flowtron-cli.mjs check
  node scripts/flowtron-cli.mjs scaffold
  node scripts/flowtron-cli.mjs new-tasknote <AREA-###>
  node scripts/flowtron-cli.mjs validate
  node scripts/flowtron-cli.mjs next [AREA] [--include-deferred]
  
  # Database (experimental)
  node scripts/flowtron-cli.mjs db:init
  node scripts/flowtron-cli.mjs db:import _project/plan.json
  node scripts/flowtron-cli.mjs db:next [AREA]
  node scripts/flowtron-cli.mjs db:checkout <AREA-###>
  node scripts/flowtron-cli.mjs db:export <OUT_DIR>
  node scripts/flowtron-cli.mjs db:update [PATH_TO_EXCHANGE_JSON]

Examples:
  npm run flowtron:check
  npm run flowtron:scaffold
  npm run flowtron:new -- CORE-005
  npm run flowtron:next

Key paths:
  project: ${rel(PROJECT_DIR)}
  tasknotes: ${rel(TASKNOTE_DIR)}
  archive: ${rel(ARCHIVE_DIR)}
  template: ${rel(TASKNOTE_TEMPLATE)}
`);
}

function validateAreaId(id) {
  // Accept mixed-length prefixes with dash and 3+ digits, e.g., CORE-001, FE-12, TEST-123
  return /^[A-Z]{2,10}-\d{1,6}$/i.test(id);
}

function findDuplicateTasknoteIds() {
  const rootFiles = listJsonFiles(TASKNOTE_DIR);
  const archiveFiles = ARCHIVE_SUBFOLDERS.flatMap((sub) =>
    listJsonFiles(path.join(ARCHIVE_DIR, sub)).map((name) => ({ sub, name }))
  );

  const dupes = [];
  for (const rootName of rootFiles) {
    for (const { name: archivedName, sub } of archiveFiles) {
      if (archivedName === rootName) {
        dupes.push({ file: rootName, subfolder: sub });
      }
    }
  }
  return dupes;
}

function check() {
  let ok = true;

  if (!pathExists(PROJECT_DIR)) {
    logWarn(`Missing _project directory at ${path.relative(ROOT, PROJECT_DIR)}`);
    ok = false;
  }

  const planJson = path.join(PROJECT_DIR, 'plan.json');
  if (!pathExists(planJson)) {
    logWarn('Missing _project/plan.json (top-level aggregator)');
    ok = false;
  } else {
    try {
      const plan = readJson(planJson);
      if (!plan.plans || typeof plan.plans !== 'object') {
        logWarn('plan.json: missing "plans" map of sub-plan paths');
        ok = false;
      } else {
        for (const [area, relPath] of Object.entries(plan.plans)) {
          const abs = path.join(ROOT, relPath);
          if (!pathExists(abs)) {
            logWarn(`plan.json: sub-plan for ${area} not found at ${relPath}`);
            ok = false;
          }
        }
      }
    } catch (e) {
      logError(`plan.json is not valid JSON: ${e.message}`);
      ok = false;
    }
  }

  if (!pathExists(TASKNOTE_DIR)) {
    logWarn('Missing _project/tasknote/ directory');
    ok = false;
  }

  if (!pathExists(ARCHIVE_DIR)) {
    logWarn('Missing _project/tasknote/archive/ directory');
    ok = false;
  } else {
    for (const sub of ARCHIVE_SUBFOLDERS) {
      const subPath = path.join(ARCHIVE_DIR, sub);
      if (!pathExists(subPath)) {
        logWarn(`Missing archive subfolder: ${path.relative(ROOT, subPath)}`);
        ok = false;
      }
    }
  }

  const dupes = findDuplicateTasknoteIds();
  if (dupes.length > 0) {
    ok = false;
    for (const d of dupes) {
      logWarn(`Duplicate TaskNote exists in root and archive: ${d.file} (archive/${d.subfolder})`);
    }
  }

  if (ok) {
    logInfo('Structure check passed.');
    process.exit(0);
  } else {
    logWarn('Structure check found issues.');
    process.exit(1);
  }
}

function scaffold() {
  ensureDir(PROJECT_DIR);
  ensureDir(TASKNOTE_DIR);
  ensureDir(ARCHIVE_DIR);
  for (const sub of ARCHIVE_SUBFOLDERS) {
    ensureDir(path.join(ARCHIVE_DIR, sub));
  }

  if (!pathExists(TASKNOTE_TEMPLATE)) {
    logWarn('Template not found at templates/tasknote-template.json');
  }

  logInfo('Scaffold complete.');
}

function newTasknote(taskId) {
  if (!taskId) {
    logError('Missing required argument: <AREA-###>. Example: CORE-005');
    usage();
    process.exit(2);
  }
  if (!validateAreaId(taskId)) {
    logError('Invalid task ID. Expected format <AREA-###>, e.g., CORE-005, FE-012, TEST-101');
    process.exit(2);
  }

  if (!pathExists(TASKNOTE_TEMPLATE)) {
    logError('Template not found: templates/tasknote-template.json');
    process.exit(2);
  }

  ensureDir(TASKNOTE_DIR);

  const targetPath = path.join(TASKNOTE_DIR, `${taskId}.json`);
  if (pathExists(targetPath)) {
    logError(`TaskNote already exists: ${path.relative(ROOT, targetPath)}`);
    process.exit(2);
  }

  const template = readJson(TASKNOTE_TEMPLATE);
  const output = { ...template, task_id: taskId };
  writeJsonPretty(targetPath, output);
  logInfo(`Created TaskNote: ${path.relative(ROOT, targetPath)}`);
}

function validateTasknoteJson(filePath) {
  const errors = [];
  let data;
  try {
    data = readJson(filePath);
  } catch (e) {
    return { valid: false, errors: [`JSON parse error: ${e.message}`] };
  }

  const requiredFields = ['task_id', 'title', 'goal', 'priority', 'phases'];
  const missing = requiredFields.filter((f) => !(f in data));
  if (missing.length) {
    errors.push(`Missing required fields: ${missing.join(', ')}`);
  }

  const allowedPriorities = ['Critical', 'High', 'Medium', 'Low', 'Backlog'];
  if (data.priority && !allowedPriorities.includes(data.priority)) {
    errors.push(`Invalid priority '${data.priority}'. Must be one of: ${allowedPriorities.join(', ')}`);
  }

  const id = data.task_id ?? '';
  const idPattern = /^[A-Z]{2,10}-\d{3}(?:\.\d+)*$/;
  if (!idPattern.test(String(id))) {
    errors.push(`Invalid task_id '${id}'. Expected <AREA>-### or <AREA>-###.# for subtasks`);
  }

  const phases = Array.isArray(data.phases) ? data.phases : [];
  if (phases.length === 0) {
    errors.push('No phases defined');
  } else {
    phases.forEach((ph, idx) => {
      if (!ph || !Array.isArray(ph.steps) || ph.steps.length === 0) {
        errors.push(`Phase ${idx + 1}: missing or empty steps`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function resolvePlanPathForTaskId(taskId) {
  const prefix = String(taskId).split('-', 1)[0];
  const mapping = {
    CORE: 'plan-core.json',
    FE: 'plan-frontend.json',
    BE: 'plan-backend.json',
    DEPLOY: 'plan-deployment.json',
    DEP: 'plan-deployment.json',
    TEST: 'plan-testing.json',
    DB: 'plan-database.json',
    SEC: 'plan-security.json',
  };
  const planName = mapping[prefix];
  if (!planName) return null;
  return path.join(PROJECT_DIR, planName);
}

function validatePlanIntegration(taskId) {
  const planPath = resolvePlanPathForTaskId(taskId);
  if (!planPath) {
    return { ok: false, planPath: null, error: 'Plan mapping not found for prefix' };
  }
  if (!pathExists(planPath)) {
    return { ok: false, planPath, error: 'Plan file not found' };
  }
  try {
    const plan = readJson(planPath);
    const tasks = Array.isArray(plan.tasks) ? plan.tasks : [];
    const exists = tasks.some((t) => t && t.task_id === taskId);
    return exists
      ? { ok: true, planPath, error: null }
      : { ok: false, planPath, error: 'Task not present in plan' };
  } catch (e) {
    return { ok: false, planPath, error: `Error reading plan: ${e.message}` };
  }
}

function validateAll() {
  let ok = true;

  // Archive structure
  for (const sub of ARCHIVE_SUBFOLDERS) {
    const subPath = path.join(ARCHIVE_DIR, sub);
    if (!pathExists(subPath)) {
      logWarn(`Missing archive subfolder: ${path.relative(ROOT, subPath)}`);
      ok = false;
    }
  }

  // TaskNotes in root (non-archive)
  const files = listJsonFilePaths(TASKNOTE_DIR).filter((p) => path.basename(p) !== 'tasknote-template.json');
  if (files.length === 0) {
    logInfo('No TaskNotes found in _project/tasknote/.');
  }
  for (const filePath of files) {
    const rel = path.relative(ROOT, filePath);
    const { valid, errors } = validateTasknoteJson(filePath);
    if (!valid) {
      ok = false;
      logWarn(`${rel}: invalid`);
      for (const e of errors) logWarn(`  - ${e}`);
      continue;
    }
    const data = readJson(filePath);
    const planCheck = validatePlanIntegration(data.task_id);
    if (!planCheck.ok) {
      ok = false;
      logWarn(`${rel}: plan integration failed -> ${planCheck.error}${planCheck.planPath ? ` (${path.relative(ROOT, planCheck.planPath)})` : ''}`);
    } else {
      logInfo(`${rel}: valid; found in plan (${path.relative(ROOT, planCheck.planPath)})`);
    }
  }

  process.exit(ok ? 0 : 1);
}

// --- File-based next-task selection across plans ---
function loadJsonSafe(filePath) {
  try {
    return readJson(filePath);
  } catch (e) {
    logWarn(`Failed to read JSON: ${path.relative(ROOT, filePath)} -> ${e.message}`);
    return null;
  }
}

function loadMasterPlan() {
  const masterPath = path.join(PROJECT_DIR, 'plan.json');
  if (!pathExists(masterPath)) {
    logWarn('Master plan not found: _project/plan.json');
    return null;
  }
  const master = loadJsonSafe(masterPath);
  if (!master || !master.plans || typeof master.plans !== 'object') {
    logWarn('Invalid master plan: missing plans map');
    return null;
  }
  return { masterPath, plans: master.plans };
}

function priorityRank(p) {
  const order = { Critical: 1, High: 2, Medium: 3, Low: 4, Backlog: 5 };
  return order[String(p)] ?? 6;
}

function isDeferred(task) {
  const status = String(task.status || '').toLowerCase();
  const title = String(task.title || '').toLowerCase();
  return status === 'backlog' || title.includes('deferred');
}

function pickEligibleTaskFromPlan(planJson, includeDeferred = false) {
  const tasks = Array.isArray(planJson?.tasks) ? planJson.tasks : [];
  if (tasks.length === 0) return null;
  const nextId = planJson?.next_priority;
  // Prefer explicit next_priority if it exists and is eligible
  if (nextId) {
    const t = tasks.find((x) => x?.task_id === nextId);
    if (t && t.status !== 'Complete' && (includeDeferred || !isDeferred(t))) return t;
  }
  // Otherwise compute by priority then ID
  const eligible = tasks.filter((t) => t && t.status !== 'Complete' && (includeDeferred || !isDeferred(t)));
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => {
    const byPriority = priorityRank(a.priority) - priorityRank(b.priority);
    if (byPriority !== 0) return byPriority;
    return String(a.task_id).localeCompare(String(b.task_id));
  });
  return eligible[0] || null;
}

function nextAcrossPlans(area, includeDeferred = false) {
  const master = loadMasterPlan();
  if (!master) process.exit(1);
  const entries = Object.entries(master.plans);
  const normalizeArea = (a) => (a || '').toLowerCase();
  const filterArea = normalizeArea(area);
  const candidates = [];
  for (const [areaKey, relPath] of entries) {
    if (filterArea && normalizeArea(areaKey) !== filterArea) continue;
    const abs = path.join(ROOT, relPath);
    if (!pathExists(abs)) continue;
    const planJson = loadJsonSafe(abs);
    if (!planJson) continue;
    const candidate = pickEligibleTaskFromPlan(planJson, includeDeferred);
    if (candidate) {
      candidates.push({ area: areaKey, plan_path: path.relative(ROOT, abs), task: candidate });
    }
  }
  if (candidates.length === 0) {
    logInfo('No eligible tasks found.');
    process.exit(0);
  }
  // If filtering by area, return the single candidate; otherwise show all
  if (filterArea) {
    console.log(JSON.stringify(candidates[0], null, 2));
  } else {
    console.log(JSON.stringify(candidates, null, 2));
  }
  process.exit(0);
}

// --- Experimental DB command stubs ---
function dbInit() {
  const { POSTGRES_HOST = 'localhost', POSTGRES_PORT = '5432', POSTGRES_USER = 'flowtron', POSTGRES_PASSWORD = 'flowtron', POSTGRES_DB = 'flowtron' } = process.env;
  const pool = new pg.Pool({ host: POSTGRES_HOST, port: Number(POSTGRES_PORT), user: POSTGRES_USER, password: POSTGRES_PASSWORD, database: POSTGRES_DB });
  const schemaPath = path.join(ROOT, '_projects/flowtron/docs/storage-schema.sql');
  if (!pathExists(schemaPath)) {
    logError(`Schema file not found: ${path.relative(ROOT, schemaPath)}`);
    process.exit(2);
  }
  const sql = fs.readFileSync(schemaPath, 'utf8');
  pool
    .query(sql)
    .then(() => {
      logInfo('Applied schema to PostgreSQL successfully.');
      pool.end();
    })
    .catch((e) => {
      logError(`Failed to apply schema: ${e.message}`);
      pool.end();
      process.exit(1);
    });
}

function dbImport(planJsonPath) {
  const { POSTGRES_HOST = 'localhost', POSTGRES_PORT = '5432', POSTGRES_USER = 'flowtron', POSTGRES_PASSWORD = 'flowtron', POSTGRES_DB = 'flowtron' } = process.env;
  if (!planJsonPath) {
    logError('Usage: db:import _project/plan.json');
    process.exit(2);
  }
  if (!pathExists(planJsonPath)) {
    logError(`File not found: ${planJsonPath}`);
    process.exit(2);
  }
  const pool = new pg.Pool({ host: POSTGRES_HOST, port: Number(POSTGRES_PORT), user: POSTGRES_USER, password: POSTGRES_PASSWORD, database: POSTGRES_DB });
  const mainPlan = readJson(planJsonPath);
  const plansMap = mainPlan?.plans ?? {};
  const clientWork = async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Upsert plans
      const pendingDeps = [];
      for (const [area, relPath] of Object.entries(plansMap)) {
        const abs = path.join(ROOT, relPath);
        if (!pathExists(abs)) continue;
        const sub = readJson(abs);
        const planId = sub.plan_id ?? `${String(mainPlan.plan_id || 'PLAN')}:${area}`;
        const lastUpdated = sub.last_updated ?? new Date().toISOString();
        await client.query(
          `INSERT INTO plan (plan_id, area, vision, last_updated) VALUES ($1,$2,$3,$4)
           ON CONFLICT (plan_id) DO UPDATE SET area=EXCLUDED.area, vision=EXCLUDED.vision, last_updated=EXCLUDED.last_updated`,
          [planId, area, sub.vision ?? null, lastUpdated]
        );
        const tasks = Array.isArray(sub.tasks) ? sub.tasks : [];
        for (const t of tasks) {
          const allowedStatuses = new Set(['Not Started', 'In Progress', 'Complete']);
          const statusNorm = allowedStatuses.has(String(t.status)) ? String(t.status) : 'Not Started';
          await client.query(
            `INSERT INTO task (task_id, plan_id, title, status, goal, priority, tags, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             ON CONFLICT (task_id) DO UPDATE SET plan_id=EXCLUDED.plan_id, title=EXCLUDED.title, status=EXCLUDED.status, goal=EXCLUDED.goal, priority=EXCLUDED.priority, tags=EXCLUDED.tags, updated_at=EXCLUDED.updated_at`,
            [
              t.task_id,
              planId,
              t.title ?? '',
              statusNorm,
              t.goal ?? null,
              t.priority ?? 'Medium',
              JSON.stringify(t.tags ?? []),
              new Date().toISOString(),
              new Date().toISOString()
            ]
          );
          const deps = Array.isArray(t.dependencies) ? t.dependencies : [];
          for (const d of deps) pendingDeps.push([t.task_id, d]);
        }
      }
      // Insert dependencies after all tasks exist
      for (const [taskId, depId] of pendingDeps) {
        await client.query(
          `INSERT INTO task_dependency (task_id, depends_on_task_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [taskId, depId]
        );
      }
      await client.query('COMMIT');
      logInfo('Imported plans and tasks into PostgreSQL.');
    } catch (e) {
      await client.query('ROLLBACK');
      logError(`DB import failed: ${e.message}`);
      process.exit(1);
    } finally {
      client.release();
      await pool.end();
    }
  };
  clientWork();
}

function dbNext(area) {
  const { POSTGRES_HOST = 'localhost', POSTGRES_PORT = '5432', POSTGRES_USER = 'flowtron', POSTGRES_PASSWORD = 'flowtron', POSTGRES_DB = 'flowtron' } = process.env;
  const pool = new pg.Pool({ host: POSTGRES_HOST, port: Number(POSTGRES_PORT), user: POSTGRES_USER, password: POSTGRES_PASSWORD, database: POSTGRES_DB });

  const normalizeArea = (a) => {
    if (!a) return null;
    const A = String(a).toUpperCase();
    if (A === 'CORE') return 'core';
    if (A === 'FE' || A === 'FRONTEND') return 'frontend';
    if (A === 'BE' || A === 'BACKEND') return 'backend';
    if (A === 'TEST' || A === 'TESTING') return 'testing';
    if (A === 'DEP' || A === 'DEPLOY' || A === 'DEPLOYMENT') return 'deployment';
    if (A === 'DB' || A === 'DATABASE') return 'database';
    return String(a).toLowerCase();
  };
  const areaNorm = normalizeArea(area);

  const sql = `
    WITH eligible AS (
      SELECT t.task_id, t.title, t.status, t.priority, p.area
      FROM task t
      JOIN plan p ON p.plan_id = t.plan_id
      WHERE t.status <> 'Complete' AND ($1::text IS NULL OR p.area = $1)
        AND NOT EXISTS (
          SELECT 1 FROM task_dependency d
          JOIN task td ON td.task_id = d.depends_on_task_id
          WHERE d.task_id = t.task_id AND td.status <> 'Complete'
        )
    )
    SELECT * FROM eligible
    ORDER BY CASE priority
      WHEN 'Critical' THEN 1
      WHEN 'High' THEN 2
      WHEN 'Medium' THEN 3
      WHEN 'Low' THEN 4
      WHEN 'Backlog' THEN 5
      ELSE 6 END,
      task_id ASC
    LIMIT 1;
  `;

  pool.query(sql, [areaNorm ?? null]).then((res) => {
    if (res.rows.length === 0) {
      logInfo('No eligible tasks found.');
    } else {
      console.log(JSON.stringify(res.rows[0], null, 2));
    }
    pool.end();
  }).catch((e) => {
    logError(`db:next failed: ${e.message}`);
    pool.end();
    process.exit(1);
  });
}

function dbCheckout(taskId) {
  const { POSTGRES_HOST = 'localhost', POSTGRES_PORT = '5432', POSTGRES_USER = 'flowtron', POSTGRES_PASSWORD = 'flowtron', POSTGRES_DB = 'flowtron' } = process.env;
  if (!taskId) {
    logError('Usage: db:checkout <AREA-###>');
    process.exit(2);
  }
  const pool = new pg.Pool({ host: POSTGRES_HOST, port: Number(POSTGRES_PORT), user: POSTGRES_USER, password: POSTGRES_PASSWORD, database: POSTGRES_DB });
  const outDir = path.join(ROOT, '.flowtron');
  ensureDir(outDir);
  const outPath = path.join(outDir, 'current-task.json');

  (async () => {
    const client = await pool.connect();
    try {
      const taskRes = await client.query(
        `SELECT t.task_id, t.title, t.status, t.priority, t.goal, p.area
         FROM task t JOIN plan p ON p.plan_id = t.plan_id
         WHERE t.task_id = $1`,
        [taskId]
      );
      if (taskRes.rows.length === 0) {
        logError(`Task not found: ${taskId}`);
        process.exit(2);
      }
      const depRes = await client.query(
        `SELECT depends_on_task_id FROM task_dependency WHERE task_id = $1`,
        [taskId]
      );
      const dependencies = depRes.rows.map((r) => r.depends_on_task_id);

      // If there is an existing tasknote with phases/steps, we could load it. For now, fall back to template phases.
      const templatePath = path.join(ROOT, 'templates', 'tasknote-template.json');
      const template = pathExists(templatePath) ? readJson(templatePath) : { phases: [] };

      const task = { ...taskRes.rows[0], dependencies };
      const exchange = {
        task,
        tasknote: {
          task_id: taskId,
          summary: null,
          phases: template.phases ?? []
        }
      };
      writeJsonPretty(outPath, exchange);
      logInfo(`Wrote AI exchange JSON: ${path.relative(ROOT, outPath)}`);
    } catch (e) {
      logError(`db:checkout failed: ${e.message}`);
      process.exit(1);
    } finally {
      pool.end();
    }
  })();
}

function dbExport(outDir) {
  const { POSTGRES_HOST = 'localhost', POSTGRES_PORT = '5432', POSTGRES_USER = 'flowtron', POSTGRES_PASSWORD = 'flowtron', POSTGRES_DB = 'flowtron' } = process.env;
  if (!outDir) {
    logError('Usage: db:export <OUT_DIR>');
    process.exit(2);
  }
  ensureDir(outDir);
  const pool = new pg.Pool({ host: POSTGRES_HOST, port: Number(POSTGRES_PORT), user: POSTGRES_USER, password: POSTGRES_PASSWORD, database: POSTGRES_DB });
  (async () => {
    const client = await pool.connect();
    try {
      const plans = await client.query('SELECT plan_id, area, vision, last_updated FROM plan');
      for (const p of plans.rows) {
        const tasks = await client.query('SELECT task_id, title, status, goal, priority FROM task WHERE plan_id = $1 ORDER BY task_id', [p.plan_id]);
        const deps = await client.query('SELECT task_id, depends_on_task_id FROM task_dependency');
        const taskList = tasks.rows.map((t) => ({
          ...t,
          dependencies: deps.rows.filter((d) => d.task_id === t.task_id).map((d) => d.depends_on_task_id)
        }));
        const planJson = {
          $schema: 'http://json-schema.org/draft-07/schema#',
          plan_id: p.plan_id,
          last_updated: p.last_updated,
          vision: p.vision ?? undefined,
          tasks: taskList
        };
        const filename = path.join(outDir, `plan-${p.area}.json`);
        writeJsonPretty(filename, planJson);
      }
      logInfo(`Exported plans to ${path.relative(ROOT, outDir)}`);
    } catch (e) {
      logError(`db:export failed: ${e.message}`);
      process.exit(1);
    } finally {
      client.release();
      pool.end();
    }
  })();
}

function dbUpdate(jsonPath) {
  const { POSTGRES_HOST = 'localhost', POSTGRES_PORT = '5432', POSTGRES_USER = 'flowtron', POSTGRES_PASSWORD = 'flowtron', POSTGRES_DB = 'flowtron' } = process.env;
  const pathToUse = jsonPath || path.join(ROOT, '.flowtron', 'current-task.json');
  if (!pathExists(pathToUse)) {
    logError(`Exchange JSON not found: ${path.relative(ROOT, pathToUse)}`);
    process.exit(2);
  }
  const exchange = readJson(pathToUse);
  const { task, tasknote } = exchange || {};
  if (!task?.task_id || !Array.isArray(tasknote?.phases)) {
    logError('Invalid exchange JSON: missing task.task_id or tasknote.phases');
    process.exit(2);
  }
  const pool = new pg.Pool({ host: POSTGRES_HOST, port: Number(POSTGRES_PORT), user: POSTGRES_USER, password: POSTGRES_PASSWORD, database: POSTGRES_DB });
  (async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Update task status/priority/goal if provided
      if (task.status || task.priority || task.goal) {
        await client.query(
          `UPDATE task SET status = COALESCE($2, status), priority = COALESCE($3, priority), goal = COALESCE($4, goal), updated_at = $5 WHERE task_id = $1`,
          [task.task_id, task.status ?? null, task.priority ?? null, task.goal ?? null, new Date().toISOString()]
        );
      }
      // Upsert tasknote and phases/steps
      await client.query(
        `INSERT INTO tasknote (task_id, summary, archived_at, metadata) VALUES ($1,$2,$3,$4)
         ON CONFLICT (task_id) DO UPDATE SET summary=EXCLUDED.summary, archived_at=EXCLUDED.archived_at, metadata=EXCLUDED.metadata`,
        [task.task_id, tasknote.summary ?? null, null, null]
      );
      // Replace phases/steps for simplicity
      await client.query(`DELETE FROM tasknote_step WHERE task_id = $1`, [task.task_id]);
      await client.query(`DELETE FROM tasknote_phase WHERE task_id = $1`, [task.task_id]);
      for (const [idx, ph] of (tasknote.phases ?? []).entries()) {
        const phaseIndex = idx + 1;
        await client.query(
          `INSERT INTO tasknote_phase (task_id, phase_index, name, status, description, completion_check)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [task.task_id, phaseIndex, ph.name ?? `Phase ${phaseIndex}`, ph.status ?? 'Pending', ph.description ?? null, JSON.stringify(ph.completion_check ?? null)]
        );
        for (const step of ph.steps ?? []) {
          await client.query(
            `INSERT INTO tasknote_step (task_id, phase_index, step_id, description, status, progress, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [task.task_id, phaseIndex, step.step_id ?? 0, step.description ?? '', step.status ?? 'Pending', JSON.stringify(step.progress ?? []), new Date().toISOString()]
          );
        }
      }
      await client.query('COMMIT');
      logInfo(`Updated task and tasknote from ${path.relative(ROOT, pathToUse)}`);
    } catch (e) {
      await client.query('ROLLBACK');
      logError(`db:update failed: ${e.message}`);
      process.exit(1);
    } finally {
      client.release();
      pool.end();
    }
  })();
}

function main() {
  const [,, cmd, ...args] = process.argv;
  switch (cmd) {
    case 'check':
      check();
      break;
    case 'scaffold':
      scaffold();
      break;
    case 'new-tasknote':
      newTasknote(args[0]);
      break;
    case 'validate':
      validateAll();
      break;
    case 'next':
      const includeDeferred = args.includes('--include-deferred');
      const area = args.find((a) => !a.startsWith('--'));
      nextAcrossPlans(area, includeDeferred);
      break;
    // --- DB subcommands (experimental) ---
    case 'db:init':
      return dbInit();
    case 'db:import':
      return dbImport(args[0]);
    case 'db:next':
      return dbNext(args[0]);
    case 'db:checkout':
      return dbCheckout(args[0]);
    case 'db:export':
      return dbExport(args[0]);
    case 'db:update':
      return dbUpdate(args[0]);
    default:
      usage();
      process.exit(cmd ? 2 : 0);
  }
}

main();


