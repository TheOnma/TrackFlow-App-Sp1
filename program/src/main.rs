use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};

#[derive(Serialize, Deserialize)]
struct Task {
    text: String,
    done: bool,
}

#[derive(Serialize, Deserialize)]
struct TaskProof {
    total_tasks: u32,
    completed_tasks: u32,
    proof_hash: [u8; 32],
}

fn process_tasks(tasks_json: String) -> TaskProof {
    let tasks: Vec<Task> = serde_json::from_str(&tasks_json).unwrap();
    
    // Calculate task statistics
    let total_tasks = tasks.len() as u32;
    let completed_tasks = tasks.iter().filter(|t| t.done).count() as u32;
    
    // Generate proof hash
    let proof_data = format!("{}{}", total_tasks, completed_tasks);
    let mut hasher = Sha256::new();
    hasher.update(proof_data.as_bytes());
    let proof_hash = hasher.finalize().into();
    
    // Create proof output
    TaskProof {
        total_tasks,
        completed_tasks,
        proof_hash,
    }
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 2 {
        eprintln!("Usage: {} <tasks.json>", args[0]);
        std::process::exit(1);
    }
    
    let tasks_json = std::fs::read_to_string(&args[1]).unwrap();
    let proof = process_tasks(tasks_json);
    println!("{}", serde_json::to_string_pretty(&proof).unwrap());
}
