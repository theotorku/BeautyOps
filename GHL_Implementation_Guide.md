# BeautyOps × GoHighLevel — Implementation Guide

**Version:** 1.0.0  
**Target Audience:** GHL Administrators / Agencies  
**Purpose:** This guide details the specific configuration steps required inside GoHighLevel (GHL) to prepare a Sub-Account for integration with BeautyOps.

---

## 🛑 Important Pre-Requisites

1.  **Fresh Sub-Account**: It is highly recommended to use a clean Sub-Account for each Brand integration to avoid field conflict.
2.  **Strict Naming**: You **MUST** copy-paste field names and keys exactly. The integration code relies on these specific string keys.
3.  **One-Way Sync**: Do not build GHL Workflows that attempt to update these fields back to BeautyOps.

---

## 1. Custom Fields Configuration

BeautyOps uses custom fields to link its internal IDs with GHL records. You must create these fields in **Settings > Custom Fields**.

### A. Contact Fields
*These fields store the BeautyOps User ID and Role for the Account Executive.*

| Field Name | Object | Data Type | Group | Technical Key (Crucial) |
| :--- | :--- | :--- | :--- | :--- |
| **BeautyOps User** | Contact | Text | General Info | `bo_user_id` |
| **BeautyOps Role** | Contact | Text | General Info | `bo_role` |

### B. Opportunity Fields
*These fields track the specific Pilot/Campaign data.*

| Field Name | Object | Data Type | Group | Technical Key (Crucial) |
| :--- | :--- | :--- | :--- | :--- |
| **BeautyOps Pilot ID** | Opportunity | Text | Opportunity Details | `bo_pilot_id` |
| **Pilot Start Date** | Opportunity | Date | Opportunity Details | `bo_start_date` |
| **Risk Reason** | Opportunity | Text | Opportunity Details | `risk_reason` |

> **⚠️ Implementation Note:** When creating these fields, GHL generates a key like `contact.custom_bo_user_id`. You must ensure the *Name* is "BeautyOps User" but the integration mapping will handle the internal key resolution.

---

## 2. Pipeline Configuration

You must create a specific pipeline to visualize the state of Pilots.

1.  Go to **Opportunities > Pipelines**.
2.  Click **Create New Pipeline**.
3.  **Pipeline Name:** `BeautyOps Pilots` (Case Sensitive).

### Stage Configuration
Add the following stages in this exact order:

1.  **Active**
    *   *Usage:* Pilot is live and execution is normal.
2.  **At Risk**
    *   *Usage:* Triggered by BeautyOps when compliance < 80% or issues undetected.
3.  **Review Needed**
    *   *Usage:* Manager intervention required.
4.  **Completed**
    *   *Usage:* Pilot finished successfully (Won).
5.  **Churned**
    *   *Usage:* Pilot cancelled or failed (Lost).

---

## 3. Tag Management

The integration applies specific tags to Contacts. You do not strictly need to pre-create them (GHL creates them on the fly), but defining them helps with cleanliness.

*   `beautyops-user`: Applied to any Contact that is a BeautyOps user.
*   `role:field-rep`: Applied to AEs.
*   `role:manager`: Applied to Regional Managers.
*   `customer:active`: Applied when `contract.signed` event fires.

---

## 4. API & Webhook Keys

To connect the backend, you will need the specific keys for this Sub-Account.

1.  Go to **Settings > Business Profile**.
2.  Copy the **Location ID** (e.g., `C123456789`).
    *   *Where to put it:* This goes into the `brands` table in the BeautyOps database for this tenant.
3.  (For OAuth Apps) Go to **Marketplace** (if using a private app) or generate access tokens via the GHL Developer Portal.

---

## 5. Verification Checklist

Before turning on the integration, verify:

- [ ] Pipeline `BeautyOps Pilots` exists with 5 stages.
- [ ] Custom Field `BeautyOps User` exists for Contacts.
- [ ] Custom Field `BeautyOps Pilot ID` exists for Opportunities.
- [ ] You have the `Location ID` ready for the backend config.

---

## 6. Automation Rules (Optional)

While BeautyOps owns the logic, you *can* set up "Last Mile" notifications in GHL.

**Example: Notify Manager on Risk**
*   **Trigger**: Opportunity Changed
    *   In Pipeline: `BeautyOps Pilots`
    *   Stage Changed To: `At Risk`
*   **Action**: Send SMS to Assigned User (Manager)
    *   *Message:* "⚠️ Pilot Alert: {{contact.name}}'s pilot is now At Risk. Reason: {{opportunity.risk_reason}}"
