# Start the frontend
frontend:
	cd frontend && bun install && bun run dev

# Start the backend
backend:
	cd backend && pip install -r requirements.txt && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Start both frontend and backend concurrently
all:
	make -j 2 frontend backend
