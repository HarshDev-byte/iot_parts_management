from fastapi import FastAPI

app = FastAPI(title="IoT Parts Management API")

@app.get("/")
def read_root():
    return {"message": "IoT Parts Management Backend Running 🚀"}
