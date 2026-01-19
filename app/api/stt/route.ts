import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get audio blob from request
    const audioBlob = await req.blob();
    
    // Convert to buffer for Deepgram
    const audioBuffer = await audioBlob.arrayBuffer();
    
    // Call Deepgram STT API
    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/webm",
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram STT error:", errorText);
      throw new Error(`Deepgram STT failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Extract transcribed text
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    
    if (!transcript) {
      throw new Error("No transcript found in response");
    }

    return NextResponse.json({ text: transcript });
  } catch (error) {
    console.error("STT error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
