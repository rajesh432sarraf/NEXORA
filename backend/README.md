# NEXORA Backend - AI-Powered EPC Project Intelligence Platform

NEXORA is an enterprise-grade AI decision support platform designed specifically for Data Center construction and EPC (Engineering, Procurement, and Construction) projects. 

This backend is built with **FastAPI** and **Python**, utilizing a strictly decoupled **Repository Pattern** to allow seamless swapping between local JSON storage and PostgreSQL. It leverages **Google Gemini** for generative intelligence and **FAISS** with `sentence-transformers` for highly constrained, hallucination-free Retrieval-Augmented Generation (RAG).

## 🧠 Core AI Engines

The backend is composed of several independent AI "Engines" that mirror a real-world procurement department:

1. **Document Intelligence & RAG Core**: Uploads large EPC PDFs, extracts text via PyMuPDF/pdfplumber, structurally parses data using Gemini, generates embeddings, and indexes them in a local FAISS vector database.
2. **Specification Compliance Engine**: Autonomously compares Vendor Proposals against Project Specifications, mathematically scoring the match and flagging missing requirements or deviations.
3. **Vendor Evaluation Engine**: Ranks multiple vendors competing for the same RFQ using multi-dimensional scoring (Technical, Commercial, Delivery, Safety) and generates AI-driven hiring recommendations.
4. **Procurement Risk Prediction Engine**: Identifies risks *before* purchase orders are signed. Uses deterministic rules to flag delays/missing warranties and Gemini to generate C-Suite mitigation strategies.
5. **Executive AI Insights Engine**: Aggregates data from Compliance, Evaluation, and Risk to calculate project-wide KPIs and generate strategic long-term recommendations.
6. **AI Procurement Copilot**: A conversational RAG interface that allows project managers to ask natural language questions about project documents. Enforces strict prompt boundaries to guarantee answers are directly cited from the FAISS database.

## 🏗️ Architecture & Stack

- **Framework**: FastAPI (Python 3)
- **Database**: PostgreSQL (via SQLAlchemy & asyncpg) / Local JSON Storage
- **AI / LLM**: Google Gemini (`google.generativeai`)
- **Vector Database**: FAISS (Facebook AI Similarity Search)
- **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Design Pattern**: Repository Pattern (for database decoupling) & Clean Architecture

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- A Google Gemini API Key

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/rajesh432sarraf/NEXORA.git
cd NEXORA/backend

# Create and activate a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Ensure you have a `.env` file in the root of the `backend` directory.

```env
# Database connections
DATABASE_URL=sqlite+aiosqlite:///./nexora.db
SYNC_DATABASE_URL=sqlite:///./nexora.db

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If switching to PostgreSQL, update the `DATABASE_URL` accordingly).*

### 4. Running the Server
```bash
# Run the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
Once running, you can interact with the API documentation at:
**[http://localhost:8000/docs](http://localhost:8000/docs)**

## 🧪 Testing

The codebase includes several local test scripts to verify the AI engines end-to-end without needing the frontend:
- `test_api.py` (Document Upload & Parsing)
- `test_compliance.py` (Specification Compliance)
- `test_evaluation.py` (Vendor Evaluation)
- `test_risk_engine.py` (Risk Prediction)
- `test_executive_insights.py` (Executive Summaries)
- `test_copilot.py` (Conversational RAG)

Run any test via the terminal:
```bash
python test_copilot.py
```
