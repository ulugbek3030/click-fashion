import { NextRequest, NextResponse } from "next/server";

// POST /api/payments/acquirer/webhook — handle card acquiring callback
// Stub: to be implemented when acquiring bank provides API specification
export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Acquirer webhook received:", body);

  return NextResponse.json({
    error: "Not implemented",
    message: "Card acquiring webhook is not yet configured",
  }, { status: 501 });
}
