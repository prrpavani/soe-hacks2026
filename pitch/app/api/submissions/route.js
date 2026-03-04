import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "soehacks";
const FILE_PATH = path.join(process.cwd(), "data", "submissions.json");

function isAuthorized(url) {
  return url.searchParams.get("password") === ADMIN_PASSWORD;
}

async function ensureFile() {
  await mkdir(path.dirname(FILE_PATH), { recursive: true });
  try {
    await access(FILE_PATH, constants.F_OK);
  } catch {
    await writeFile(FILE_PATH, "[]", "utf8");
  }
}

async function readSubmissions() {
  await ensureFile();
  const raw = await readFile(FILE_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSubmissions(submissions) {
  await ensureFile();
  await writeFile(FILE_PATH, JSON.stringify(submissions, null, 2), "utf8");
}

function sanitize(body) {
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const funFact = String(body?.funFact || "").trim();
  const openSeat = String(body?.openSeat || "").trim();
  const connectionDifficulty = String(body?.connectionDifficulty || "").trim();
  const accessToNewPeople = String(body?.accessToNewPeople || "").trim();
  const seatOptions = ["Yes", "No", "Depends"];
  const connectionOptions = ["Very Difficult", "Difficult", "N/A", "Easy", "Very Easy"];

  if (
    !name ||
    !email ||
    !funFact ||
    !seatOptions.includes(openSeat) ||
    !connectionOptions.includes(connectionDifficulty) ||
    !connectionOptions.includes(accessToNewPeople)
  ) {
    return null;
  }

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    funFact,
    openSeat,
    connectionDifficulty,
    accessToNewPeople,
    createdAt: new Date().toISOString(),
  };
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  if (!isAuthorized(requestUrl)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const submissions = await readSubmissions();
  return NextResponse.json({ submissions }, { status: 200 });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const submission = sanitize(body);

  if (!submission) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const submissions = await readSubmissions();
  submissions.push(submission);
  await writeSubmissions(submissions);

  return NextResponse.json({ ok: true, submission }, { status: 201 });
}

export async function DELETE(request) {
  const requestUrl = new URL(request.url);
  if (!isAuthorized(requestUrl)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await writeSubmissions([]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
