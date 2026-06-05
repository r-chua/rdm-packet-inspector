# RDM Packet Inspector

[Live Demo](https://beamish-jalebi-7c466d.netlify.app/)

## What This Is

A debugging tool for engineers and spec implementers to read E1.20 RDM packets in a human-friendly way. Paste in raw hex and see decoded fields and warnings.

## Getting Started

```
    git clone ...
    cd rdm-packet-inspector
    npm install
    npm test        # run the test suite
    npm run dev     # start the dev server
```

## Project Structure

    src/parser/          RDM packet parser (pure TypeScript, no UI dependencies)
    src/parser/data/     E1.20 lookup tables and constants (PIDs, NACK reasons, command classes)
    src/parser/*.test.ts Test suite (Vitest)
    src/                 React application

## Tech Stack

React · TypeScript · Vite · Vitest · Tailwind CSS

## License

MIT
