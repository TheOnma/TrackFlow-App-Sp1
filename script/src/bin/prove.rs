use sp1_sdk::{include_elf, ProverClient, SP1Stdin};
use std::env;

/// RISC-V ELF file for the TrackFlow proof program.
pub const TRACKFLOW_ELF: &[u8] = include_elf!("trackflow_program");

fn main() {
    // Setup logger
    sp1_sdk::utils::setup_logger();
    
    // Setup prover client
    let client = ProverClient::from_env();
    
    // Read tasks from environment variable
    let tasks_json = env::var("TASKS_JSON").expect("TASKS_JSON must be set");
    
    // Setup stdin
    let mut stdin = SP1Stdin::new();
    stdin.write(&tasks_json);
    
    // Generate proof
    let (pk, vk) = client.setup(TRACKFLOW_ELF);
    let proof = client.prove(&pk, stdin);
    
    // Verify proof
    client.verify(&proof, &vk);
    
    // Print proof result
    println!("Proof generated and verified successfully!");
    println!("Total tasks: {}", proof.public_values[0]);
    println!("Completed tasks: {}", proof.public_values[1]);
    println!("Proof hash: {:?}", proof.public_values[2..]);
} 