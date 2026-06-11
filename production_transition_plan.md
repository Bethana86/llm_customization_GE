# Production Transition Roadmap: Gemini Customization Factory

This document provides a technical and operational roadmap for transitioning the **Gemini Customization Factory** prototype into an enterprise-grade, production-ready application integrated with Google Cloud Platform (GCP).

---

## 1. Architecture Transition Mapping

To scale the frontend prototype, mock capabilities must be mapped directly to enterprise GCP cloud services:

```
+--------------------------------------------------------+
|                      React UI / SPA                    |
+--------------------------------------------------------+
                           |
                           v
+--------------------------------------------------------+
|               FastAPI / Go API Gateway                 |
+--------------------------------------------------------+
       |                  |                    |
       v                  v                    v
+--------------+   +--------------+   +------------------+
| Vertex AI    |   | GCS Bucket   |   | Cloud DLP API    |
| Tuning Jobs  |   | (Dataset Store|  | (PII Masking)    |
+--------------+   +--------------+   +------------------+
       |
       v
+--------------+
| Model        |
| Registry     |
+--------------+
       |
       v
+--------------+
| Vertex AI    |
| Endpoints    |
+--------------+
```

| Prototype Module | Production GCP Mapping | Description |
| :--- | :--- | :--- |
| **Dataset Factory** | **GCS + Cloud DLP API** | Store datasets in secure Google Cloud Storage (GCS) buckets. Run the **Cloud Data Loss Prevention (DLP) API** to inspect, redact, and mask PII/HIPAA data on upload. |
| **Tuning Simulator** | **Vertex AI Pipelines** | Replace the simulator with calls to the **Vertex AI SDK** (`aiplatform.TuningJob.create_with_reinforcement_learning` or custom pipeline templates) running on GCP GPU clusters. |
| **Console Logs** | **Cloud Logging (Stackdriver)** | Stream real-time standard training logs (`stdout`/`stderr`) from Vertex containers to the frontend using **WebSockets**. |
| **Prompt Sandbox** | **Vertex AI Prompt Management** | Save, version, and compare system prompt templates in **Vertex AI Prompt Management** (Vertex AI Studio). |
| **Evaluation Matrix** | **Vertex GenAI Evaluation Service** | Integrate automated evaluations (MMLU, GSM8K, custom datasets) using Vertex AI GenAI Evaluation tools to calculate accuracy, latency, and costs. |
| **Agent Publisher** | **Vertex AI Agent Builder** | Package customized models directly into agents using the **Vertex AI Agent Builder** (Data Store, Tools, and Integrations). |
| **Governance Hub** | **IAM + Cloud Audit Logs + BigQuery** | Enforce access using GCP IAM roles (RBAC). Feed activity logs to **Cloud Audit Logs** and export them to **BigQuery** for compliance audits. |

---

## 2. Infrastructure & Pipeline Details

### A. Automated Dataset Pipeline
1.  **Ingestion**: Frontend uploads file chunks to a signed GCS URL.
2.  **Validation**: A Cloud Function triggers on file finalization to verify format schema (JSONL/CSV).
3.  **DLP Scanning**: The Cloud Function streams content blocks through the **DLP API** using predefined infoTypes (e.g. `US_SOCIAL_SECURITY_NUMBER`, `EMAIL_ADDRESS`, `PHONE_NUMBER`) to mask/tokenize sensitive data.
4.  **Registration**: Metadata (token count, token distribution, cleaning score) is saved to a PostgreSQL database (e.g. **Cloud SQL**), making the dataset available in the UI catalog.

### B. Vertex AI Custom Tuning Execution
1.  **Triggering**: The user clicks "Start Tuning". The backend API invokes the Vertex AI pipeline.
2.  **Resource Configuration**: Configure GPU node pools (e.g. standard machine type `a2-highgpu-1g` with NVIDIA A100/H100 GPUs).
3.  **Real-Time Status**: The backend listens to Vertex job pub/sub messages and broadcasts progress updates (loss rates, epochs) to the client web browser using WebSockets.
4.  **Registry Publishing**: On completion, Vertex automatically saves the model weights to the **Vertex Model Registry**.

---

## 3. Security, Access & Cost Controls

1.  **Identity Management (SSO)**:
    *   Integrate frontend auth with corporate identity providers (Azure AD, Okta, Google Workspace) using **OpenID Connect (OIDC)**.
2.  **Role-Based Access Control (RBAC)**:
    *   *Compliance Officer*: Can manage DLP sanitization filters and view audit trails.
    *   *Data Engineer*: Can import datasets and configure preprocessing.
    *   *AI Developer*: Can configure and trigger tuning runs, and test prompts in the playground.
    *   *Operator/CxO*: Views cost reports and sets budget constraints.
3.  **GPU Cost Quota System**:
    *   Enforce max limits on budget thresholds in the backend database.
    *   Use **GCP Budgets & Alerts API** to trigger automatic training job cancellations if monthly expenditures exceed the department limit.
4.  **Network Isolation**:
    *   Run all API services and GPU nodes inside private VPCs. Protect public endpoints using **Google Cloud Load Balancing** and **Cloud Armor** (WAF).

---

## 4. Production Transition Steps (Phase-by-Phase)

### Phase 1: Re-architect Frontend & Build API Server (Weeks 1-3)
*   Port the HTML/CSS/JS dashboard into a framework like **React** or **Next.js** for state control.
*   Implement a **FastAPI** (Python) backend to handle authentication, manage state metadata (Cloud SQL), and handle file upload signatures.

### Phase 2: Vertex AI API Integrations (Weeks 4-6)
*   Integrate backend with Google Cloud SDK to upload files to GCS and call DLP.
*   Write pipeline templates to trigger Vertex AI model tuning and query active status.
*   Establish WebSockets to stream training output logs.

### Phase 3: Agent Publisher & Deployments (Weeks 7-8)
*   Set up Vertex AI endpoints with autoscaling configurations (minimum 1 node, scaling up on demand).
*   Create automated evaluation workflows to score new checkpoints against standard benchmark test-suites.

### Phase 4: CI/CD & Launch (Weeks 9-10)
*   Define infrastructure components (VPC, Cloud SQL, GCS, IAM roles) via **Terraform**.
*   Write CI/CD scripts (e.g. GitHub Actions) to run unit/linting tests, compile frontend bundles, and deploy backend Docker images to **Cloud Run** or **GKE**.
