# Beauty Ops × Go High Level Integration — Internal Engineering Specification

**Version:** 1.0.0  
**Status:** DRAFT  
**Date:** 2026-01-07  
**Author:** BeautyOps Engineering

---

## 1. Executive Summary

This document defines the architectural standard for integrating **BeautyOps** (the System of Record) with **GoHighLevel (GHL)** (the Downstream CRM & Commercial Execution Layer). 

**Core Principle:** BeautyOps owns all state, scoring, compliant logic, and data authority. GoHighLevel is utilized strictly as a dumb pipe for communication triggers and a mirror for commercial execution state (sales pipelines).

The integration is **uni-directional (BeautyOps → GHL)** for state synchronization, **event-driven**, **idempotent**, **replay-safe**, and **multi-tenant**.

---

## 2. Architectural Principles

1.  **BeautyOps is the Source of Truth**: No business logic exists in GHL. GHL automations (Workflows) must not calculate scores or decide *if* an action should happen. They only execute *what* BeautyOps instructs.
2.  **Multi-Tenancy via Sub-Accounts**: Each **Brand** in BeautyOps maps 1:1 to a **Sub-Account (Location)** in GHL. API interactions must be scoped by the generic `Location-Id` header.
3.  **Event-Driven Sync**: Updates are pushed to GHL via a durable job queue triggered by BeautyOps domain events.
4.  **Idempotency & Replayability**: All events carry a unique `event_id` and `idempotency_key`. Retrying a webhook must result in the same state in GHL.
5.  **Failure Isolation**: A failure in GHL sync (e.g., API downtime) must not block BeautyOps core operations.

---

## 3. Data Ownership & Authorization

| Entity | Owner (Write Authority) | GHL Role (Read/Trigger) | Sync Strategy |
| :--- | :--- | :--- | :--- |
| **Brands** | BeautyOps | Sub-Account | Manual Provisioning (Phase 1) / API (Phase 2) |
| **Contacts (AEs)** | BeautyOps | Contact | Upsert on `user.created` / `user.updated` |
| **Stores** | BeautyOps | Custom Object / Company | Upsert on `store.created` |
| **Visits** | BeautyOps | Task / Note | Append on `visit.completed` |
| **Pilots (Campaigns)**| BeautyOps | Opportunity | State Sync on `pilot.*` events |
| **Risk/Scores** | BeautyOps | Custom Field | Overwrite on `score.updated` |

---

## 4. Canonical Webhook Event Envelope

All integration events must be wrapped in this standard JSON envelope for processing by the implementation layer.

```json
{
  "event_id": "evt_1234567890",
  "event_type": "domain.entity.action", 
  "timestamp": "2026-01-07T14:30:00Z",
  "data_version": "v1",
  "producer": "beautyops-core",
  "tenant_id": "brand_uuid_8888",
  "payload": {
    // Event-specific data
  },
  "metadata": {
    "attempt": 1,
    "trace_id": "trc_abc123"
  }
}
```

---

## 5. Domain Events & Integration Specs

### 5.1. Brand / Account Provisioning
*Note: Brands map to GHL Sub-Accounts. For MVP, we assume the Sub-Account ID is stored in BeautyOps `brands` table.*

#### Event: `brand.created`
*   **Trigger**: New brand signs up or is provisioned in BeautyOps.
*   **GHL Entity**: `Location` (Sub-Account)
*   **Action**: Store mapping (Internal Config).
*   **Note**: Automating Sub-Account creation is out of scope for Phase 1. We assume `ghl_location_id` is manually added to the Brand record.

---

### 5.2. User Management (AEs)

#### Event: `user.created` / `user.updated`
*   **Description**: An Account Executive is added or details change.
*   **GHL Endpoint**: `POST /v1/contacts/` (Upsert)
*   **Mutated Entity**: `Contact`
*   **Custom Fields Required**:
    *   `bo_user_id` (Unique Key)
    *   `bo_role` (e.g., "Field Rep", "Manager")
*   **Payload**:
    ```json
    {
      "email": "ae@brand.com",
      "firstName": "Sarah",
      "lastName": "Smith",
      "phone": "+15550009999",
      "tags": ["beautyops-user", "role:field-rep"],
      "customField": {
        "bo_user_id": "user_uuid_555",
        "bo_role": "Field Rep"
      }
    }
    ```

---

### 5.3. Pilot & Pipeline Execution

#### Event: `pilot.started`
*   **Description**: A new pilot program (e.g., "Sephora Q1 Launch") is initiated.
*   **GHL Endpoint**: `POST /v1/pipelines/{pipelineId}/opportunities/`
*   **Mutated Entity**: `Opportunity`
*   **Pre-requisites**: GHL Pipeline named "BeautyOps Pilots".
*   **Stages**: `Active`, `At Risk`, `Completed`, `Churned`.
*   **Payload**:
    ```json
    {
      "title": "Sephora Q1 Launch - NYC",
      "status": "open",
      "stageId": "{{stage_active_id}}",
      "monetaryValue": 10000,
      "contactId": "{{ghl_contact_id_for_primary_ae}}",
      "customFields": {
        "bo_pilot_id": "pilot_uuid_777",
        "bo_start_date": "2026-02-01"
      }
    }
    ```

#### Event: `pilot.success`
*   **Description**: Pilot meets success criteria (e.g., hit sell-through target).
*   **GHL Endpoint**: `PUT /v1/pipelines/{pipelineId}/opportunities/{opportunityId}`
*   **Mutated Entity**: `Opportunity` (Status Change)
*   **Action**: Move to `Completed` (Won).
*   **Payload**:
    ```json
    {
      "status": "won",
      "stageId": "{{stage_completed_id}}"
    }
    ```

#### Event: `execution.score.low` / `compliance.risk.high`
*   **Description**: BeautyOps detects low visit compliance or execution issues.
*   **GHL Endpoint**: `PUT /v1/pipelines/{pipelineId}/opportunities/{opportunityId}`
*   **Mutated Entity**: `Opportunity` + `Task`
*   **Action**: 
    1.  Move Opportunity to `At Risk` stage.
    2.  Create a Task for the Manager.
*   **Payload (Opportunity)**:
    ```json
    {
      "stageId": "{{stage_at_risk_id}}",
      "customFields": { "risk_reason": "Low Compliance < 80%" }
    }
    ```
*   **Payload (Task)**:
    ```json
    {
      "title": "URGENT: Review Pilot Risk - Low Compliance",
      "body": "Compliance dropped to 75%. Please review field reports.",
      "dueDate": "2026-01-08T17:00:00Z",
      "assignedTo": "{{manager_contact_id}}"
    }
    ```

---

### 5.4. Contract Lifecycle

#### Event: `contract.signed`
*   **Description**: Legal contract finalized.
*   **GHL Endpoint**: `POST /v1/contacts/{contactId}/tags`
*   **Mutated Entity**: `Contact` (Tagging)
*   **Action**: Add tag `customer:active`.
*   **One-time Action**: Trigger 'Onboarding' Workflow in GHL.

---

## 6. Schema Requirements (GHL Side)

### Custom Fields
| Name | Key | format | Object |
| :--- | :--- | :--- | :--- |
| BeautyOps User ID | `bo_user_id` | Text | Contact |
| BeautyOps Role | `bo_role` | Text | Contact |
| BeautyOps Pilot ID | `bo_pilot_id` | Text | Opportunity |
| Pilot Start Date | `bo_start_date` | Date | Opportunity |
| Risk Reason | `risk_reason` | Text | Opportunity |

### Pipelines
**Name**: "BeautyOps Pilots"
*   Stage 1: **Active**
*   Stage 2: **At Risk** (Triggered by `compliance.risk.high`)
*   Stage 3: **Review Needed**
*   Stage 4: **Completed** (Won)
*   Stage 5: **Churned** (Lost)

---

## 7. Idempotency & Failure Handling

*   **Idempotency Keys**: We will store a mapping of `bo_event_id` to `ghl_resource_id` in a local `integration_logs` table.
*   **Check-before-Write**: Before creating a Contact/Opportunity, check `integration_logs` to see if we already processed this event.
*   **Retry Policy**:
    *   Exponential backoff: 5s, 30s, 5m, 1h.
    *   Dead Letter Queue (DLQ) after 5 failed attempts.
*   **Rate Limits**: Respect GHL's 10 requests/second per token limit. Implement localized leaky bucket throttling.

---

## 8. Non-Goals

1.  **Bi-directional Sync**: We will NOT listen to webhooks *from* GHL to update BeautyOps. If a user changes email in GHL, it will be overwritten by BeautyOps on next sync.
2.  **GHL UI Embed**: We are not embedding BeautyOps inside GHL iFrames.
3.  **Marketing Automation**: BeautyOps does not define email templates. It only triggers the workflow usage.

---

## 9. Database Schema (Supabase)

To support this integration, we require the following tables for idempotency and state mapping.

```sql
-- integration_logs: Tracks every outbound event for audit and debugging
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL, -- BeautyOps internal event ID
    event_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'skipped')),
    payload JSONB,
    response_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ghl_id_map: Maps BeautyOps entities to GHL entities (Idempotency)
CREATE TABLE ghl_id_map (
    bo_entity_type TEXT NOT NULL, -- e.g., 'user', 'pilot', 'store'
    bo_entity_id UUID NOT NULL,
    ghl_entity_id TEXT NOT NULL, -- GHL IDs are strings
    ghl_location_id TEXT NOT NULL, -- Sub-Account ID
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (bo_entity_type, bo_entity_id)
);

-- Index for fast lookups during sync
CREATE INDEX idx_ghl_map_lookup ON ghl_id_map(bo_entity_type, bo_entity_id);
```

