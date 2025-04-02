use sp1_zkvm::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Task {
    text: String,
    done: bool,
}

#[derive(Serialize, Deserialize)]
struct TaskList {
    tasks: Vec<Task>,
}

#[derive(Serialize, Deserialize)]
struct ProofResult {
    total_tasks: u32,
    completed_tasks: u32,
}

program! {
    fn main() {
        // Read the task list from stdin
        let task_list: TaskList = env::read();
        
        // Calculate task statistics
        let total_tasks = task_list.tasks.len() as u32;
        let completed_tasks = task_list.tasks.iter()
            .filter(|task| task.done)
            .count() as u32;
        
        // Create proof result
        let result = ProofResult {
            total_tasks,
            completed_tasks,
        };
        
        // Write result to stdout
        env::write(&result);
    }
} 