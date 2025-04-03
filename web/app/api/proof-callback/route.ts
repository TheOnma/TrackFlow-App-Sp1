import { NextRequest, NextResponse } from "next/server";

// In a real application, you would store these in a database
const proofResults = new Map();

export async function POST(req: NextRequest) {
  try {
    const { proof, taskId } = await req.json();
    console.log("Received proof callback for task:", taskId);
    
    // Store the proof result
    proofResults.set(taskId, proof);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling proof callback:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }
    
    console.log("Checking proof status for task:", taskId);
    const proof = proofResults.get(taskId);
    if (!proof) {
      return NextResponse.json(
        { status: 'pending' },
        { status: 202 }
      );
    }
    
    // Optionally, clear the result after returning it
    proofResults.delete(taskId);
    
    return NextResponse.json({
      status: 'completed',
      proof
    });
  } catch (error) {
    console.error("Error retrieving proof:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 