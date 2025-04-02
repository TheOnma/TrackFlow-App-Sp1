import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json();
    
    // Calculate task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: { done: boolean }) => t.done).length;
    
    // Format the result
    const result = `Proved: ${totalTasks} tasks, ${completedTasks} completed`;
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in proof generation:", error);
    return NextResponse.json(
      { error: "Failed to generate proof" },
      { status: 500 }
    );
  }
} 