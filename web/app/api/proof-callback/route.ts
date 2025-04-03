import { NextRequest, NextResponse } from "next/server";

// In a real application, you would store these in a database
const proofResults = new Map();
const timeoutIds = new Map();

// For testing purposes, after 15 seconds, create a mock proof
const mockProofAfterDelay = (taskId: string, delay = 15000) => {
  console.log(`Setting up mock proof for taskId: ${taskId} with delay: ${delay}ms`);
  
  // Clear any existing timeout for this taskId
  if (timeoutIds.has(taskId)) {
    clearTimeout(timeoutIds.get(taskId));
  }
  
  const timeoutId = setTimeout(() => {
    console.log(`Creating mock proof for taskId: ${taskId}`);
    const mockProof = {
      total_tasks: 1,
      completed_tasks: 1,
      proof_hash: Buffer.from(`mock_proof_for_${taskId}`).toString('base64')
    };
    proofResults.set(taskId, mockProof);
    timeoutIds.delete(taskId);
  }, delay);
  
  timeoutIds.set(taskId, timeoutId);
};

export async function POST(req: NextRequest) {
  try {
    console.log("Received proof callback request");
    const body = await req.json();
    console.log("Callback body received:", JSON.stringify(body));
    
    const { proof, taskId } = body;
    
    if (!taskId) {
      console.error("Missing taskId in callback request");
      return NextResponse.json(
        { error: "Missing taskId" },
        { status: 400 }
      );
    }
    
    console.log("Received proof callback for task:", taskId);
    
    // Cancel any pending timeout for this taskId
    if (timeoutIds.has(taskId)) {
      clearTimeout(timeoutIds.get(taskId));
      timeoutIds.delete(taskId);
    }
    
    // Store the proof result
    console.log("Storing proof for taskId:", taskId);
    console.log("Proof data:", JSON.stringify(proof));
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
    
    // If this is the first time we're checking this taskId, set up a mock proof
    // ONLY for local development, not for Vercel
    if (!proofResults.has(taskId) && !timeoutIds.has(taskId) && !process.env.VERCEL) {
      // Only create mock proofs in local development
      mockProofAfterDelay(taskId, 15000);
    }
    
    const proof = proofResults.get(taskId);
    if (!proof) {
      return NextResponse.json(
        { status: 'pending' },
        { status: 202 }
      );
    }
    
    console.log("Found proof for taskId:", taskId);
    console.log("Proof data:", JSON.stringify(proof));
    
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