Write unit tests for the email service.

## Project Context
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/email.service.js
- **Output path:** tests/unit/email.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS

Before writing tests, READ the service file first:
```
cat src/services/email.service.js
```

Then test all exported functions.

## Special Notes for email.service

This service uses **nodemailer**. You MUST mock it:
```js
const nodemailer = require("nodemailer");
// Mock the transporter creation
const mockTransporter = {
  sendMail: mock.fn(() => Promise.resolve({ messageId: "mock-id" })),
};
mock.method(nodemailer, "createTransport", () => mockTransporter);
```

## Test Pattern
```js
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
```

Cover: email sending success, error handling, edge cases (empty recipients, missing fields).

## Verification
```
cd D:\c3000c\volunteering-rewards-app\backend && npm test
```
