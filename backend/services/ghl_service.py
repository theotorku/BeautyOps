from datetime import datetime
from typing import Optional, Dict, Any
import uuid
import json
from schemas.ghl import GHLEventEnvelope, GHLEventMetadata, GHLContactPayload
from db import supabase

class GHLService:
    def __init__(self):
        self.db = supabase

    def _create_event_envelope(self, event_type: str, tenant_id: str, payload: Dict[str, Any]) -> GHLEventEnvelope:
        return GHLEventEnvelope(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            timestamp=datetime.utcnow(),
            data_version="v1",
            producer="beautyops-core",
            tenant_id=tenant_id,
            payload=payload,
            metadata=GHLEventMetadata(attempt=1, trace_id=f"trc_{uuid.uuid4().hex[:8]}")
        )

    def log_event(self, envelope: GHLEventEnvelope, status: str = "pending"):
        """
        Logs the event to the database for processing.
        """
        data = {
            "event_id": envelope.event_id,
            "event_type": envelope.event_type,
            "status": status,
            "payload": envelope.payload,
            # 'created_at' is handled by DB default
        }
        # In a real sync, we should convert UUIDs in payload to strings or use a custom encoder
        # For supabase-py, passing dict is usually fine if JSONB column expects it.
        
        response = self.db.table("integration_logs").insert(data).execute()
        return response

    async def sync_user(self, user_id: str, user_data: Dict[str, Any], brand_id: str):
        """
        Prepares a user sync event.
        """
        # 1. Map data to GHL Payload
        payload = GHLContactPayload(
            email=user_data.get("email"),
            firstName=user_data.get("first_name", ""),
            lastName=user_data.get("last_name", ""),
            phone=user_data.get("phone"),
            tags=["beautyops-user", f"role:{user_data.get('role', 'user')}"],
            customField={
                "bo_user_id": user_id,
                "bo_role": user_data.get("role")
            }
        )

        # 2. Create Envelope
        envelope = self._create_event_envelope(
            event_type="user.created",  # or user.updated
            tenant_id=brand_id,
            payload=payload.dict()
        )

        # 3. Log to DB (The Worker would pick this up)
        # For now, we just log it as 'pending'
        self.log_event(envelope, status="pending")
        
        return envelope

    async def sync_task(self, title: str, description: str, due_date: str, assignee_id: str, brand_id: str):
        """
        Prepares a task sync event.
        """
        # Import GHLTaskPayload inside method or ensure it is imported at top
        from schemas.ghl import GHLTaskPayload
        
        payload = GHLTaskPayload(
            title=title,
            body=description,
            dueDate=due_date,
            assignedTo=assignee_id
        )

        envelope = self._create_event_envelope(
            event_type="task.created",
            tenant_id=brand_id,
            payload=payload.dict()
        )

        self.log_event(envelope, status="pending")
        return envelope

    # Helper to check mapping
    def get_ghl_id(self, bo_entity_type: str, bo_entity_id: str) -> Optional[str]:
        response = self.db.table("ghl_id_map").select("ghl_entity_id").eq("bo_entity_type", bo_entity_type).eq("bo_entity_id", bo_entity_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]["ghl_entity_id"]
        return None
