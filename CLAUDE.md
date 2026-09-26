# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands
- Run everything: `./start.sh`
- Run backend tests: `cd backend && pytest`

## Architecture
- **Frontend**: Next.js (runs on port 3000)
- **Backend**: FastAPI (runs on port 8000)
- **AI Integration**: Uses Ollama (localhost:11434) with the `llama3.2:3b` model.

## Project Rules
- The user is a beginner; explain all changes simply.
- Run tests after every change.
