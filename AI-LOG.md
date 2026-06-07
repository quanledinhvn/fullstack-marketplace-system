# AI-LOG.md

Honest record of how I used AI tools in this project.

---

## What I delegated to AI

My delegation flow:

1. **I chose the flow** myself first.
2. Ran the **`grill-me` skill** to pin down what needed building and to lock the project structure up front.
3. Had **AI break the work into issues** — I reviewed every issue before any code.
4. Had **AI run each issue** — I reviewed the code at the end.

---

## One case where AI was wrong — I caught and fixed it

**AI generated its own HTTP provider instead of using NestJS's HttpModule**

I had asked it to use the NestJS `@nestjs/axios` `HttpModule`, but AI hand-rolled a custom HTTP provider instead.

**Root cause:** my fault — I hadn't written docs for this part, so AI had no constraint to follow. Fixed by pointing it back to `HttpModule` and adding the missing guidance.

---

## One thing I verified myself rather than trusting

**Job flow + the mock-service callback path**

I verified the worker job flow and what happens when we receive the callback from the mock service. In the callback-handling path, AI had **missed updating the document status** — I caught it by tracing the flow myself rather than trusting the generated code.
