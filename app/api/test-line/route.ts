import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("key");
  if (secret !== "bei-da-test-2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const adminId = process.env.LINE_ADMIN_USER_ID || "(not set)";
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || "(not set)";
  const channelSecret = process.env.LINE_CHANNEL_SECRET || "(not set)";

  // Show partial values for debugging (hide most of the token)
  const info = {
    adminId_preview: adminId.length > 10 ? adminId.slice(0, 6) + "..." + adminId.slice(-4) : adminId,
    token_preview: token.length > 10 ? token.slice(0, 6) + "..." + token.slice(-4) : token,
    secret_preview: channelSecret.length > 10 ? channelSecret.slice(0, 6) + "..." + channelSecret.slice(-4) : channelSecret,
    adminId_length: adminId.length,
    token_length: token.length,
    secret_length: channelSecret.length,
  };

  // Actually call LINE API and capture response
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: adminId,
        messages: [{ type: "text", text: "✅ LINE 測試成功！" }],
      }),
    });

    const responseText = await res.text();
    return NextResponse.json({
      env: info,
      line_api: {
        status: res.status,
        statusText: res.statusText,
        body: responseText,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ env: info, error: message }, { status: 500 });
  }
}
