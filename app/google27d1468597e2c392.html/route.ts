import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    "google-site-verification: google27d1468597e2c392.html",
    { headers: { "Content-Type": "text/html" } }
  );
}
