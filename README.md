# TrackFlow

A minimalist task checker app with zero-knowledge proof generation using SP1.

## Features

- Task management with categories (Work, Personal, Urgent, Study, Health)
- Zero-knowledge proof generation for task completion
- Task completion sharing on X/Twitter
- Local storage persistence
- Beautiful dark theme UI with pink accents

## Prerequisites

- Node.js >= 18.17.0 (Required for Next.js 14)
- npm >= 8.0.0

### Installing Node.js and npm

1. Using nvm (recommended):
   ```bash
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Restart your terminal and install Node.js
   nvm install 18
   nvm use 18
   ```

2. Direct installation:
   - Download and install from [Node.js official website](https://nodejs.org/)
   - Choose LTS version 18.17.0 or later

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- SP1 for zero-knowledge proofs

## Project Structure

```
TrackFlow-app/
├── web/                # Next.js frontend application
│   ├── app/           # App router components
│   ├── public/        # Static assets
│   └── ...
└── program/           # SP1 proof program
    └── src/           # Rust source code
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/TheOnma/TrackFlow-App-Sp1.git
   cd TrackFlow-App-Sp1
   ```

2. Install frontend dependencies:
   ```bash
   cd web
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Frontend (Next.js)

The frontend is built with Next.js and uses:
- TypeScript for type safety
- Tailwind CSS for styling
- Local storage for data persistence

### SP1 Integration

The app integrates with SP1 for generating zero-knowledge proofs of task completion. The proof program is written in Rust and compiled to run in the SP1 environment.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT