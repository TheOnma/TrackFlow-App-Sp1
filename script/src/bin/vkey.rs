use sp1_sdk::{include_elf, HashableKey, ProverClient};

/// RISC-V ELF file for the TrackFlow proof program.
pub const TRACKFLOW_ELF: &[u8] = include_elf!("trackflow_program");

fn main() {
    // Setup prover client
    let client = ProverClient::from_env();
    
    // Get verification key for the program
    let (_, vk) = client.setup(TRACKFLOW_ELF);
    
    // Print verification key
    println!("Program VKey: {}", vk.bytes32());
}