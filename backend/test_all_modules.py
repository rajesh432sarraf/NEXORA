import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def test_all_new_modules():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        print("=== 1. Testing Auth & User Registration ===")
        user_payload = {
            "email": "admin.epc@nexora.com",
            "password": "SecurePassword123!",
            "full_name": "Chief EPC Director",
            "role": "ADMIN"
        }
        res = await client.post("/api/v1/auth/register", json=user_payload)
        print("Register status:", res.status_code, res.json()["email"])
        assert res.status_code == 201

        login_payload = {
            "email": "admin.epc@nexora.com",
            "password": "SecurePassword123!"
        }
        res = await client.post("/api/v1/auth/login", json=login_payload)
        print("Login status:", res.status_code)
        assert res.status_code == 200
        token_data = res.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/auth/me", headers=headers)
        print("Auth /me status:", res.status_code, res.json()["full_name"])
        assert res.status_code == 200

        print("\n=== 2. Creating Sample EPC Project for Modules ===")
        project_payload = {
            "project_name": "NEOM Green Hydrogen Plant",
            "client_name": "NEOM Energy",
            "location": "Tabuk, Saudi Arabia",
            "project_type": "Renewable Hydrogen EPC",
            "budget": 8400000000.0,
            "status": "IN_PROGRESS",
            "description": "8.4B Green Hydrogen EPC Mega-facility."
        }
        res = await client.post("/api/v1/projects", json=project_payload, headers=headers)
        print("Create project status:", res.status_code)
        assert res.status_code == 201
        project_id = res.json()["id"]

        print("\n=== 3. Testing RFQ Module ===")
        rfq_payload = {
            "rfq_number": "RFQ-NEOM-2026-001",
            "title": "High Capacity Electrolyzer Units",
            "project_id": project_id,
            "budget": 120000000.0,
            "status": "ISSUED",
            "due_date": "2026-09-30",
            "description": "Supply of 200MW alkaline electrolyzer stacks."
        }
        res = await client.post("/api/v1/rfqs", json=rfq_payload, headers=headers)
        print("Create RFQ status:", res.status_code, res.json()["rfq_number"])
        assert res.status_code == 201

        res = await client.get(f"/api/v1/rfqs?project_id={project_id}")
        print("List RFQs status:", res.status_code, len(res.json()), "RFQs found")
        assert res.status_code == 200 and len(res.json()) >= 1

        print("\n=== 4. Testing Purchase Orders Module ===")
        po_payload = {
            "po_number": "PO-NEOM-9901",
            "project_id": project_id,
            "vendor_name": "Siemens Energy Global",
            "total_amount": 45000000.0,
            "status": "ISSUED",
            "issued_date": "2026-02-01",
            "notes": "Turbine transformers and grid integration hardware."
        }
        res = await client.post("/api/v1/purchase-orders", json=po_payload, headers=headers)
        print("Create PO status:", res.status_code, res.json()["po_number"])
        assert res.status_code == 201

        res = await client.get(f"/api/v1/purchase-orders?project_id={project_id}")
        print("List POs status:", res.status_code, len(res.json()), "POs found")
        assert res.status_code == 200 and len(res.json()) >= 1

        print("\n=== 5. Testing Procurement Items Module ===")
        proc_payload = {
            "item_name": "Stainless Steel Pressure Piping 12-inch",
            "project_id": project_id,
            "quantity": 5000.0,
            "unit": "meters",
            "estimated_cost": 1500000.0,
            "actual_cost": 1420000.0,
            "status": "ORDERED",
            "notes": "Grade 316L high-pressure piping."
        }
        res = await client.post("/api/v1/procurement", json=proc_payload, headers=headers)
        print("Create Procurement Item status:", res.status_code, res.json()["item_name"])
        assert res.status_code == 201

        res = await client.get(f"/api/v1/procurement?project_id={project_id}")
        print("List Procurement Items status:", res.status_code, len(res.json()), "items found")
        assert res.status_code == 200 and len(res.json()) >= 1

        print("\n=== 6. Testing Timeline / Milestones Module ===")
        milestone_payload = {
            "title": "Civil Engineering & Site Grading Complete",
            "project_id": project_id,
            "start_date": "2026-01-01",
            "end_date": "2026-06-30",
            "progress_percentage": 100.0,
            "status": "COMPLETED",
            "description": "Heavy foundation work completed for main electrolyzer hall."
        }
        res = await client.post("/api/v1/timeline", json=milestone_payload, headers=headers)
        print("Create Milestone status:", res.status_code, res.json()["title"])
        assert res.status_code == 201

        res = await client.get(f"/api/v1/timeline?project_id={project_id}")
        print("List Milestones status:", res.status_code, len(res.json()), "milestones found")
        assert res.status_code == 200 and len(res.json()) >= 1

        print("\n=== 7. Testing Dashboard APIs ===")
        res = await client.get("/api/v1/dashboard/stats")
        print("Dashboard Stats status:", res.status_code, res.json())
        assert res.status_code == 200
        stats = res.json()
        assert stats["total_projects"] >= 1
        assert stats["total_users"] >= 1

        print("\nSUCCESS: All remaining platform modules (100% of rating table) implemented and verified!")

if __name__ == "__main__":
    asyncio.run(test_all_new_modules())
