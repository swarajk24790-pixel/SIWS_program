import uvicorn
import os
import sys

# Ensure current working directory is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if __name__ == "__main__":
    print(">> Starting UniPilot FastAPI Backend on http://127.0.0.1:8000 ...")
    print(">> Interactive Swagger Documentation: http://127.0.0.1:8000/docs")
    uvicorn.run(
        "backend.app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False
    )
