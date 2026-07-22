import { NextRequest, NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/ai/groq";

export async function GET(req: NextRequest) {
  try {
    const testMessage = "Your bank account has been suspended. Click here immediately.";
    const result = await analyzeMessage(testMessage);

    return NextResponse.json({
      success: true,
      message: "Groq integration test successful.",
      result,
    });
  } catch (error) {
    console.error("[test-groq] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Groq integration test failed.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
