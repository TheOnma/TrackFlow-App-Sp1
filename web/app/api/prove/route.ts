import { NextRequest, NextResponse } from "next/server";

const GITHUB_PAT = process.env.NEXT_PUBLIC_GITHUB_PAT;
if (!GITHUB_PAT) {
  console.warn('NEXT_PUBLIC_GITHUB_PAT environment variable is not set');
}

export async function POST(req: NextRequest) {
  try {
    console.log("Received request to /api/prove");
    const { tasks } = await req.json();
    console.log("Tasks received:", tasks);
    
    if (!GITHUB_PAT) {
      throw new Error('GitHub token not configured');
    }
    
    // Generate a unique task ID
    const taskId = Math.random().toString(36).substring(7);
    
    // Trigger GitHub Action
    const response = await fetch(
      `https://api.github.com/repos/TheOnma/TrackFlow-App-Sp1/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${GITHUB_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'generate_proof',
          client_payload: {
            tasks,
            taskId
          }
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API response:', errorText);
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    
    // Return the task ID that the client can use to check the status
    return NextResponse.json({ 
      success: true,
      taskId,
      message: "Proof generation started. Check status using the taskId."
    });
    
  } catch (error) {
    console.error("Error triggering proof generation:", error);
    return NextResponse.json(
      { error: String(error), success: false },
      { status: 500 }
    );
  }
} 