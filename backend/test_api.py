import requests
import time
import json
import os
from fpdf import FPDF

# Create a dummy PDF
pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="NEXORA Dummy Technical Specification", ln=1, align='C')
pdf.cell(200, 10, txt="This is a test document for the Document Intelligence Service.", ln=1)
pdf.cell(200, 10, txt="Key requirements: 200 HVAC units, 5 backup generators.", ln=1)
pdf.output("dummy_spec.pdf")

print("Created dummy_spec.pdf")

# Upload the PDF
url = "http://127.0.0.1:8001/api/v1/documents/upload"
files = {'file': open('dummy_spec.pdf', 'rb')}
response = requests.post(url, files=files)

print("Upload response:", response.status_code, response.text)

if response.status_code == 200:
    doc_data = response.json()
    doc_id = doc_data['id']
    print(f"Document uploaded. ID: {doc_id}")
    
    # Poll for status
    for i in range(5):
        time.sleep(2)
        get_url = f"http://127.0.0.1:8001/api/v1/documents/{doc_id}"
        res = requests.get(get_url)
        if res.status_code == 200:
            current_status = res.json().get("status")
            print(f"Polling [{i+1}/5] Status: {current_status}")
            if current_status in ["EXTRACTED", "FAILED"]:
                print("Final Document Data:")
                break
        else:
            print("Error polling:", res.text)
            
    print("Testing Parse Endpoint...")
    parse_url = f"http://127.0.0.1:8001/api/v1/documents/{doc_id}/parse"
    parse_res = requests.post(parse_url)
    
    if parse_res.status_code == 200:
        print("Parse Successful! Structured JSON:")
        print(json.dumps(parse_res.json(), indent=2))
    else:
        print("Parse Failed:", parse_res.text)

    print("\nTesting Manual Ingestion...")
    ingest_url = f"http://127.0.0.1:8001/api/v1/documents/{doc_id}/ingest"
    ingest_res = requests.post(ingest_url)
    if ingest_res.status_code == 200:
        print("Ingestion Successful!")
    else:
        print("Ingestion Failed:", ingest_res.text)
        
    print("\nTesting Search Endpoint...")
    search_url = "http://127.0.0.1:8001/api/v1/documents/search"
    search_payload = {
        "query": "HVAC units",
        "top_k": 2
    }
    search_res = requests.post(search_url, json=search_payload)
    
    if search_res.status_code == 200:
        print("Search Successful! Results:")
        print(json.dumps(search_res.json(), indent=2))
    else:
        print("Search Failed:", search_res.text)
