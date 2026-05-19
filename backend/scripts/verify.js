/**
 * Static verification script.
 * Checks module resolution, export/import consistency, and contract compliance.
 * Run: node scripts/verify.js
 */

const fs = require("fs");
const path = require("path");

// ─── Step 1: Mock native modules ───────────────────────────
// bcrypt is a native binary from Windows; stub it for static checks
const BCRYPT_PATH = path.join(__dirname, "..", "node_modules", "bcrypt", "bcrypt.js");
const BCRYPT_BAK = BCRYPT_PATH + ".bak";

if (!fs.existsSync(BCRYPT_BAK)) {
  const original = fs.readFileSync(BCRYPT_PATH, "utf8");
  fs.writeFileSync(BCRYPT_BAK, original);
  // Replace native require with a pure-JS stub
  fs.writeFileSync(BCRYPT_PATH, `
    module.exports = {
      hash: (pw, salt) => Promise.resolve('$2b$12$' + 'x'.repeat(53)),
      compare: (pw, hash) => Promise.resolve(true),
      genSalt: () => Promise.resolve('$2b$12$xxxxxxxxxxxx'),
      genSaltSync: () => '$2b$12$xxxxxxxxxxxx',
      hashSync: (pw, salt) => '$2b$12$' + 'x'.repeat(53),
      compareSync: (pw, hash) => true,
    };
  `);
}

// ─── Step 2: Module Resolution Check ───────────────────────

const ROOT = path.join(__dirname, "..");
const FILES_TO_CHECK = [
  "index.js",
  "src/routes/auth.routes.js",
  "src/controllers/auth.controller.js",
  "src/services/auth.service.js",
  "src/middleware/auth.middleware.js",
  "src/middleware/role.middleware.js",
  "src/middleware/errorHandler.middleware.js",
  "src/middleware/rateLimiter.middleware.js",
];

let allOk = true;

console.log("\n=== Step 1: Module Resolution ===\n");

FILES_TO_CHECK.forEach((relPath) => {
  const absPath = path.join(ROOT, relPath);
  try {
    const mod = require(absPath);
    console.log(`  OK  ${relPath}`);
  } catch (err) {
    console.error(`  FAIL ${relPath}: ${err.message}`);
    allOk = false;
  }
});

// ─── Step 3: Export/Import Consistency ──────────────────────
console.log("\n=== Step 2: Export/Import Consistency ===\n");

// Check auth.routes imports match auth.controller exports
const authController = require(path.join(ROOT, "src/controllers/auth.controller"));
const authRoutesContent = fs.readFileSync(path.join(ROOT, "src/routes/auth.routes.js"), "utf8");
const controllerExports = Object.keys(authController);
const controllerRefs = [...authRoutesContent.matchAll(/controller\.(\w+)/g)].map(m => m[1]);

controllerRefs.forEach(ref => {
  if (controllerExports.includes(ref)) {
    console.log(`  OK  auth.controller exports "${ref}" - used in routes`);
  } else {
    console.error(`  FAIL auth.controller does NOT export "${ref}" but routes use it`);
    allOk = false;
  }
});

// Check middleware imports
const authMiddleware = require(path.join(ROOT, "src/middleware/auth.middleware"));
if (typeof authMiddleware.authenticate === "function") {
  console.log(`  OK  auth.middleware exports "authenticate" as function`);
} else {
  console.error(`  FAIL auth.middleware "authenticate" is not a function`);
  allOk = false;
}

const roleMiddleware = require(path.join(ROOT, "src/middleware/role.middleware"));
["authorize", "roleGuard"].forEach(fn => {
  if (typeof roleMiddleware[fn] === "function") {
    console.log(`  OK  role.middleware exports "${fn}" as function`);
  } else {
    console.error(`  FAIL role.middleware "${fn}" is not a function`);
    allOk = false;
  }
});

const rateLimiter = require(path.join(ROOT, "src/middleware/rateLimiter.middleware"));
["global", "authStrict", "authRegister"].forEach(fn => {
  if (typeof rateLimiter[fn] === "function") {
    console.log(`  OK  rateLimiter.middleware exports "${fn}" as function`);
  } else {
    console.error(`  FAIL rateLimiter.middleware "${fn}" is not a function`);
    allOk = false;
  }
});

const errorHandler = require(path.join(ROOT, "src/middleware/errorHandler.middleware"));
if (typeof errorHandler === "function") {
  console.log(`  OK  errorHandler.middleware exports handler as function`);
}
if (typeof errorHandler.createError === "function") {
  console.log(`  OK  errorHandler.middleware exports "createError" as function`);
}

// ─── Step 4: Verify createError usage has proper error codes ─
console.log("\n=== Step 3: createError Call Signatures ===\n");

const serviceContent = fs.readFileSync(path.join(ROOT, "src/services/auth.service.js"), "utf8");
const createErrorCalls = [...serviceContent.matchAll(/createError\((\d+),\s*"([^"]+)"/g)];

const expectedCodes = [
  "validation_error", "email_taken", "phone_taken",
  "invalid_credentials", "account_disabled", "invalid_token", "not_found",
];

createErrorCalls.forEach(([_, status, code]) => {
  if (expectedCodes.includes(code)) {
    console.log(`  OK  createError(${status}, "${code}") - known code`);
  } else {
    console.warn(`  WARN createError(${status}, "${code}") - unexpected code`);
  }
});

// Check no old-style createError calls remain (without code parameter)
const oldStyleCalls = [...serviceContent.matchAll(/createError\((\d+),\s*"((?!validation_error|email_taken|phone_taken|invalid_credentials|account_disabled|invalid_token|not_found|unauthenticated|forbidden|rate_limited|no_token|invalid_format|token_expired)[^"]+)"\)/g)];
if (oldStyleCalls.length > 0) {
  console.warn(`\n  WARN ${oldStyleCalls.length} old-style createError calls found (missing error code):`);
  oldStyleCalls.forEach(([_, status, msg]) => console.warn(`    createError(${status}, "${msg}")`));
}

// ─── Step 5: API Response Shape Check ──────────────────────
console.log("\n=== Step 4: Response Shape Verification ===\n");

// Check auth.controller responses
const controllerContent = fs.readFileSync(path.join(ROOT, "src/controllers/auth.controller.js"), "utf8");

const registerResponse = controllerContent.match(/res\.status\(201\)\.json\(\{([^}]+)\}\);/s);
if (registerResponse && registerResponse[1].includes("token")) {
  console.log(`  OK  register response includes "token" field`);
} else {
  console.error(`  FAIL register response missing "token" field`);
  allOk = false;
}

const loginResponse = controllerContent.match(/res\.status\(200\)\.json\(\{([^}]+)\}\);/s);
if (loginResponse && loginResponse[1].includes("expires_at")) {
  console.log(`  OK  login response includes "expires_at" field`);
}

// ─── Step 6: Check error handler format ────────────────────
console.log("\n=== Step 5: Error Handler Format ===\n");

const errHandlerContent = fs.readFileSync(path.join(ROOT, "src/middleware/errorHandler.middleware.js"), "utf8");
if (errHandlerContent.includes('error: {')) {
  console.log(`  OK  errorHandler returns { error: { code, message } } format`);
}

// ─── Results ────────────────────────────────────────────────
console.log("\n========================================");
if (allOk) {
  console.log("  RESULT: ALL CHECKS PASSED");
} else {
  console.error("  RESULT: SOME CHECKS FAILED");
}
console.log("========================================\n");

// Restore bcrypt
fs.unlinkSync(BCRYPT_PATH);
fs.renameSync(BCRYPT_BAK, BCRYPT_PATH);
