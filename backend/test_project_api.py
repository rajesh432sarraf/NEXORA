import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def test_project_crud():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/health")
        print("Health check status:", res.status_code, res.json())
        assert res.status_code == 200

        # 2. Create Project
        new_project_payload = {
            "project_name": "Al Zour Refinery EPC Phase 1",
            "client_name": "Kuwait National Petroleum Company",
            "location": "Al Zour, Kuwait",
            "project_type": "Oil & Gas EPC",
            "budget": 1250000000.0,
            "start_date": "2026-01-15",
            "end_date": "2028-12-31",
            "status": "IN_PROGRESS",
            "description": "Engineering, procurement, and construction of crude oil processing units."
        }
        res = await client.post("/api/v1/projects", json=new_project_payload)
        print("Create project status:", res.status_code, res.json())
        assert res.status_code == 201
        created_project = res.json()
        project_id = created_project["id"]
        assert created_project["project_name"] == "Al Zour Refinery EPC Phase 1"
        assert created_project["status"] == "IN_PROGRESS"

        # 3. Get All Projects
        res = await client.get("/api/v1/projects")
        print("Get all projects status:", res.status_code, len(res.json()), "projects found")
        assert res.status_code == 200
        assert len(res.json()) >= 1

        # 4. Get Project by ID
        res = await client.get(f"/api/v1/projects/{project_id}")
        print("Get project by ID status:", res.status_code, res.json())
        assert res.status_code == 200
        assert res.json()["id"] == project_id

        # 5. Update Project
        update_payload = {
            "budget": 1300000000.0,
            "status": "COMPLETED",
            "description": "Updated project budget and marked as COMPLETED."
        }
        res = await client.put(f"/api/v1/projects/{project_id}", json=update_payload)
        print("Update project status:", res.status_code, res.json())
        assert res.status_code == 200
        updated = res.json()
        assert updated["budget"] == 1300000000.0
        assert updated["status"] == "COMPLETED"

        # 6. Delete Project
        res = await client.delete(f"/api/v1/projects/{project_id}")
        print("Delete project status:", res.status_code)
        assert res.status_code == 204

        # 7. Verify Deletion
        res = await client.get(f"/api/v1/projects/{project_id}")
        print("Verify deleted project status:", res.status_code)
        assert res.status_code == 404

        print("SUCCESS: All Project CRUD operations executed successfully!")

if __name__ == "__main__":
    asyncio.run(test_project_crud())
