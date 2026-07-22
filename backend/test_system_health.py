from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
  response = client.get("/health")
  print("HEALTH CHECK STATUS:", response.status_code, response.json())
  assert response.status_code == 200

def test_dashboard_stats():
  test_email = "audit_user_final@nexora.ai"
  test_password = "Password123!"

  # Register user
  client.post("/api/v1/auth/register", json={
    "email": test_email,
    "password": test_password,
    "full_name": "Audit User"
  })

  # Login user
  login_res = client.post("/api/v1/auth/login", json={
    "email": test_email,
    "password": test_password
  })
  print("LOGIN RESPONSE STATUS:", login_res.status_code)
  assert login_res.status_code == 200
  token = login_res.json()["access_token"]
  headers = {"Authorization": f"Bearer {token}"}

  # Test Dashboard Stats
  dash_res = client.get("/api/v1/dashboard/stats", headers=headers)
  print("DASHBOARD STATS:", dash_res.status_code, "OK")
  assert dash_res.status_code == 200

  # Test Projects List
  proj_res = client.get("/api/v1/projects", headers=headers)
  print("PROJECTS LIST:", proj_res.status_code, f"Returned {len(proj_res.json())} items")
  assert proj_res.status_code == 200

  # Test Documents List
  doc_res = client.get("/api/v1/documents", headers=headers)
  print("DOCUMENTS LIST:", doc_res.status_code, f"Returned {len(doc_res.json())} items")
  assert doc_res.status_code == 200

  # Test RFQs List
  rfq_res = client.get("/api/v1/rfqs", headers=headers)
  print("RFQS LIST:", rfq_res.status_code, f"Returned {len(rfq_res.json())} items")
  assert rfq_res.status_code == 200

  # Test POs List
  po_res = client.get("/api/v1/purchase-orders", headers=headers)
  print("PURCHASE ORDERS LIST:", po_res.status_code, f"Returned {len(po_res.json())} items")
  assert po_res.status_code == 200

  # Test Procurement Items List
  proc_res = client.get("/api/v1/procurement", headers=headers)
  print("PROCUREMENT ITEMS LIST:", proc_res.status_code, f"Returned {len(proc_res.json())} items")
  assert proc_res.status_code == 200

  # Test Timeline Milestones List
  time_res = client.get("/api/v1/timeline", headers=headers)
  print("TIMELINE MILESTONES LIST:", time_res.status_code, f"Returned {len(time_res.json())} items")
  assert time_res.status_code == 200

if __name__ == "__main__":
  test_health()
  test_dashboard_stats()
  print("\n🎉 ALL BACKEND API ENDPOINTS PASSED WITH 100% SUCCESS!")
