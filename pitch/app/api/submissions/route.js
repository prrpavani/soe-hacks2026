import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "soehacks";
const FILE_PATH_CANDIDATES = [];

if (process.env.SUBMISSIONS_FILE_PATH) {
  FILE_PATH_CANDIDATES.push(path.resolve(process.env.SUBMISSIONS_FILE_PATH));
}

FILE_PATH_CANDIDATES.push(path.join(process.cwd(), "public", "submissions.json"));
FILE_PATH_CANDIDATES.push("/tmp/submissions.json");

let cachedFilePath = null;

function isPermissionError(error) {
  return ["EACCES", "EISDIR", "EROFS", "EPERM", "ENOENT", "ENOTDIR"].includes(error?.code);
}

async function resolveFilePath() {
  if (cachedFilePath) return cachedFilePath;

  for (const filePath of FILE_PATH_CANDIDATES) {
    try {
      await mkdir(path.dirname(filePath), { recursive: true });

      try {
        await access(filePath, constants.F_OK);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        await writeFile(filePath, "[]", "utf8");
      }

      await access(filePath, constants.R_OK | constants.W_OK);
      cachedFilePath = filePath;
      return filePath;
    } catch (error) {
      if (!isPermissionError(error)) {
        throw error;
      }
    }
  }

  throw new Error(
    "No writable storage location found for submissions. Set SUBMISSIONS_FILE_PATH to a writable file path."
  );
}

function isAuthorized(url) {
  return url.searchParams.get("password") === ADMIN_PASSWORD;
}

async function ensureFile() {
  const FILE_PATH = await resolveFilePath();
  await mkdir(path.dirname(FILE_PATH), { recursive: true });
  try {
    await access(FILE_PATH, constants.F_OK);
  } catch {
    await writeFile(FILE_PATH, "[]", "utf8");
  }
}

async function readSubmissions() {
  await ensureFile();
  const FILE_PATH = await resolveFilePath();
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
  const FILE_PATH = await resolveFilePath();
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
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const submissions = await readSubmissions();
  return NextResponse.json(
    { submissions },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
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
