import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function GET(req: NextRequest) {
  try {
    const cronSecret = getRequiredEnvironmentVariable("CRON_SECRET");
    const authorization = req.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = getRequiredEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = getRequiredEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    // Small query that touches Postgres and keeps the project active.
    const { error } = await supabase
      .from("bots")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
