import asyncio
from fpdf import FPDF
from httpx import AsyncClient, ASGITransport
from app.main import app

async def test_association_and_rag():
    # 1. Create a sample EPC technical specification PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="NEXORA EPC Project Spec - Al Zour Refinery", ln=1, align='C')
    pdf.cell(200, 10, txt="Cooling Systems: 50 Heavy Duty Cooling Towers required.", ln=1)
    pdf.cell(200, 10, txt="Power Generation: 4 Turbines of 100MW each.", ln=1)
    pdf.cell(200, 10, txt="Safety Protocol: ISO 45001 compliance mandatory.", ln=1)
    pdf_filename = "al_zour_spec.pdf"
    pdf.output(pdf_filename)
    print("Created test PDF:", pdf_filename)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 2. Create an EPC Project
        project_payload = {
            "project_name": "Al Zour Refinery Expansion",
            "client_name": "KNPC",
            "location": "Kuwait",
            "project_type": "Refinery EPC",
            "budget": 500000000.0,
            "status": "IN_PROGRESS",
            "description": "Refinery expansion and heavy machinery installation."
        }
        p_res = await client.post("/api/v1/projects", json=project_payload)
        print("1. Create Project response:", p_res.status_code)
        assert p_res.status_code == 201
        project_data = p_res.json()
        project_id = project_data["id"]
        print(f"Created Project ID: {project_id}")

        # 3. Upload Document associated with project_id
        with open(pdf_filename, "rb") as f:
            files = {"file": (pdf_filename, f, "application/pdf")}
            data = {"project_id": project_id}
            up_res = await client.post("/api/v1/documents/upload", files=files, data=data)
        
        print("2. Upload Document associated with Project response:", up_res.status_code)
        assert up_res.status_code == 201
        doc_data = up_res.json()
        doc_id = doc_data["id"]
        assert doc_data["project_id"] == project_id
        print(f"Uploaded Document ID: {doc_id} linked to Project ID: {doc_data['project_id']}")

        # 4. Filter Documents by project_id
        filter_res = await client.get(f"/api/v1/documents?project_id={project_id}")
        print("3. Filter Documents by project_id response:", filter_res.status_code)
        assert filter_res.status_code == 200
        filtered_docs = filter_res.json()
        assert len(filtered_docs) == 1
        assert filtered_docs[0]["id"] == doc_id
        print("Document-to-Project Association successfully verified in GET /documents!")

        # 5. RAG Vector Search & AI Synthesis (All Projects)
        search_payload = {
            "query": "How many cooling towers and turbines are required?",
            "top_k": 5,
            "generate_answer": True
        }
        s_res = await client.post("/api/v1/search", json=search_payload)
        print("4. Global RAG Search response:", s_res.status_code)
        assert s_res.status_code == 200
        search_data = s_res.json()
        print("Search Query:", search_data["query"])
        print("AI RAG Answer:", search_data["answer"])
        print("Retrieved Matches Count:", search_data["total_matches"])
        matched_doc_ids = [r["document_id"] for r in search_data["results"]]
        assert doc_id in matched_doc_ids


        # 6. RAG Vector Search filtered by specific project_id
        project_search_payload = {
            "query": "What are the power generation requirements?",
            "project_id": project_id,
            "top_k": 3,
            "generate_answer": True
        }
        ps_res = await client.post("/api/v1/search", json=project_search_payload)
        print("5. Project-filtered RAG Search response:", ps_res.status_code)
        assert ps_res.status_code == 200
        ps_data = ps_res.json()
        assert ps_data["project_id"] == project_id
        print("Project Search Answer:", ps_data["answer"])
        print("Project Matches Count:", ps_data["total_matches"])
        assert ps_data["total_matches"] >= 1

        print("\nSUCCESS: Document-to-Project Association and RAG Vector Search fully working!")

if __name__ == "__main__":
    asyncio.run(test_association_and_rag())
