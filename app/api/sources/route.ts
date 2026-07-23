import { NextResponse } from "next/server";

import { getSourceOptions } from "@/lib/sources";

export async function GET() {
  const items = await getSourceOptions();

  return NextResponse.json({ items });
}

