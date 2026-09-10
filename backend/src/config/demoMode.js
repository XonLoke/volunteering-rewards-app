//-----------------------------------------------------------------------
// SECTION: Public Demo Mode
// Purpose: Single source of truth for the PUBLIC_DEMO_MODE flag.
//
// Why this file exists: the app runs as a public showcase with shared
// password123 test accounts, so a handful of operations must be neutralised —
// outbound email, and the few writes that permanently change the program and
// that the periodic demo reset is forbidden to repair. Those guards live in
// different services; routing them all through one predicate means a typo in
// the flag name cannot silently disable a guard in just one of them.
//
// Read as a function, not a module-level const, so the value is re-evaluated
// per call instead of being frozen at require time — the same reason
// rateLimiter.middleware.js wraps DISABLE_RATE_LIMIT in a predicate.
//-----------------------------------------------------------------------

const isPublicDemoMode = () => process.env.PUBLIC_DEMO_MODE === "true";

module.exports = { isPublicDemoMode };
