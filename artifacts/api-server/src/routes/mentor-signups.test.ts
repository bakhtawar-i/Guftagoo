import { once } from "node:events";
import { strict as assert } from "node:assert";
import { after, before, describe, test } from "node:test";
import type { AddressInfo } from "node:net";
import app from "../app";
import { db, mentorSignupsTable, pool } from "@workspace/db";
import { eq } from "drizzle-orm";

const validSignup = {
  name: "Regression Test Mentor",
  email: "mentor-signup-regression@example.com",
  field: "Technology & engineering",
  yearsExperience: "6–10 years",
  helpOptions: ["Referrals", "Career advice"],
} as const;

let baseUrl = "";
let server: ReturnType<typeof app.listen>;

async function postSignup(payload: unknown): Promise<Response> {
  return fetch(`${baseUrl}/api/mentor-signups`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/mentor-signups", () => {
  before(async () => {
    server = app.listen(0);
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await db
      .delete(mentorSignupsTable)
      .where(eq(mentorSignupsTable.email, validSignup.email));
    await pool.end();
    server.close();
  });

  test("validates and persists a valid mentor signup", async () => {
    const response = await postSignup(validSignup);

    assert.equal(response.status, 201);
    const returned = (await response.json()) as Record<string, unknown>;
    assert.equal(returned.name, validSignup.name);
    assert.equal(returned.email, validSignup.email);
    assert.equal(returned.field, validSignup.field);
    assert.equal(returned.yearsExperience, validSignup.yearsExperience);
    assert.deepEqual(returned.helpOptions, validSignup.helpOptions);
    assert.equal(typeof returned.id, "number");
    assert.ok(returned.createdAt);

    const [saved] = await db
      .select()
      .from(mentorSignupsTable)
      .where(eq(mentorSignupsTable.email, validSignup.email));

    assert.ok(saved);
    assert.equal(saved.name, validSignup.name);
    assert.equal(saved.field, validSignup.field);
    assert.equal(saved.yearsExperience, validSignup.yearsExperience);
    assert.deepEqual(saved.helpOptions, validSignup.helpOptions);
  });

  const invalidPayloads = [
    {
      label: "an invalid field",
      payload: { ...validSignup, field: "Software & technology" },
    },
    {
      label: "an invalid email",
      payload: { ...validSignup, email: "not-an-email" },
    },
    {
      label: "an invalid experience range",
      payload: { ...validSignup, yearsExperience: "11–20 years" },
    },
    {
      label: "an invalid help option",
      payload: { ...validSignup, helpOptions: ["Office tours"] },
    },
  ] as const;

  for (const { label, payload } of invalidPayloads) {
    test(`rejects ${label}`, async () => {
      const response = await postSignup(payload);

      assert.equal(response.status, 400);
      const body = (await response.json()) as Record<string, unknown>;
      assert.equal(typeof body.error, "string");
    });
  }

  test("rejects duplicate help options", async () => {
    const response = await postSignup({
      ...validSignup,
      helpOptions: ["Referrals", "Referrals"],
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "Help options must be unique.",
    });
  });
});