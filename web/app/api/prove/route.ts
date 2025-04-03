import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    console.log("Received request to /api/prove");
    const { tasks } = await req.json();
    console.log("Tasks received:", tasks);
    
    // Format tasks for SP1
    const tasksJson = JSON.stringify(tasks);
    console.log("Formatted tasks JSON:", tasksJson);
    
    // Get the absolute path to the program directory
    const programDir = path.join(process.cwd(), "..", "program");
    console.log("Program directory:", programDir);
    
    // Ensure program directory exists
    try {
      await fs.access(programDir);
    } catch (error) {
      console.error("Program directory not found:", programDir);
      throw new Error("Program directory not found");
    }
    
    // Create a temporary file for the tasks
    const tempFile = path.join(programDir, "tasks.json");
    await fs.writeFile(tempFile, tasksJson);
    console.log("Created temporary file:", tempFile);
    
    try {
      // Run the program with the tasks file
      console.log("Running cargo command...");
      const { stdout, stderr } = await execAsync("cargo run --release tasks.json", {
        cwd: programDir,
        env: { ...process.env }
      });
      console.log("Command stdout:", stdout);
      if (stderr) console.log("Command stderr:", stderr);
      
      // Parse the proof result
      const proof = JSON.parse(stdout);
      console.log("Parsed proof:", proof);
      
      return NextResponse.json({ 
        proof,
        success: true 
      });
    } finally {
      // Clean up the temporary file
      try {
        await fs.unlink(tempFile);
        console.log("Cleaned up temporary file");
      } catch (error) {
        console.error("Error cleaning up temporary file:", error);
      }
    }
  } catch (error) {
    console.error("Error in proof generation:", error);
    return NextResponse.json(
      { error: String(error), success: false },
      { status: 500 }
    );
  }
} 