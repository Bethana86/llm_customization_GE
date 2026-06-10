# Gemini Enterprise Customization Factory

A comprehensive, interactive web control center and development environment for managing datasets, simulating fine-tuning pipelines, red-teaming system instructions, executing side-by-side model evaluations, and publishing Gemini Enterprise Agents.

## 🚀 Key Features

*   **Operations Hub**: Real-time status cards of the model registry, active GPU compile tasks, benchmarking gains, and quota logs.
*   **Dataset Factory**: File ingestion validation, diagnostic data cleaning checklist, and a simulated **Gemini Synthetic Generator** to generate instruction tuning datasets.
*   **Tuning & Distillation**: Configuration panel supporting LoRA (Low-Rank Adaptation), Full Parameter, and Distillation hyperparameter options (Rank, Alpha, Epochs, Learning Rate). Integrates an animated Canvas training convergence loss curve and streaming stdout logs.
*   **Prompt Sandbox**: System instructions editor with an Auto-Optimizer assistant, dynamic variable interpolation, and a real-time **Red-Team Security Scan** auditing jailbreak, leakage, toxicity, and policy compliance levels.
*   **Evaluation Matrix**: Radar charts comparing accuracy scores across customized categories, and side-by-side execution output testers showing latency and response differences.
*   **Agent Publisher**: Binds custom models to platform tools (Google Search, Code Interpreter, OpenAPI schemas) and exports Node.js, Python, and cURL integration scripts.
*   **Governance & Auditing**: Tracks an immutable audit trail log, controls credit quotas, and sets strict regional hosting constraints.

---

## 🛠️ Tech Stack

*   **Core**: Pure semantic HTML5 and vanilla JavaScript (ES6 modules).
*   **Styling**: Responsive Vanilla CSS3 using HSL color models, obsidian-dark themes, neon accents, glassmorphic card elements, and micro-animations.
*   **Server**: Built-in PowerShell static server (`serve.ps1`) for local HTTP hosting without external Node/Python dependencies.

---

## 📦 Getting Started

### Prerequisites

To test the Python SDK integration scripts exported by the Agent Publisher, install the dependencies listed in `requirements.txt`:

```bash
pip install -r requirements.txt
```

### Running the App Locally

Since the application uses modern JavaScript ES6 modules, it must be served over `http://` or `https://` protocols to avoid CORS browser security blocks. 

A native PowerShell script is provided to start a local static server on port `8080`:

1.  Open PowerShell.
2.  Navigate to the project directory:
    ```powershell
    cd C:\Users\ASUA\.gemini\antigravity\scratch\gemini-customization-factory
    ```
3.  Execute the server:
    ```powershell
    powershell -ExecutionPolicy Bypass -File .\serve.ps1
    ```
4.  Open your browser and navigate to:
    **[http://localhost:8080/](http://localhost:8080/)**

---

## 📂 Project Architecture

```
gemini-customization-factory/
├── index.html                   # Core shell layout and views container
├── README.md                    # Project documentation
├── requirements.txt             # Python dependencies
├── serve.ps1                    # Pure PowerShell static web server
├── css/
│   └── styles.css               # Obsidian theme, glassmorphic assets, animations
└── js/
    ├── app.js                   # State coordinator, router, notifications toast broker
    ├── mockData.js              # Seed dataset, registry, jobs, audits, and evaluation metrics
    ├── viewDashboard.js         # Operations dashboard view
    ├── viewDatasets.js          # Ingest, clean, and synthetic dataset wizard
    ├── viewTraining.js          # Live GPU compiler pipeline training simulator (Canvas loss curves)
    ├── viewPlayground.js        # Prompt playground, auto-optimizer, safety red-teaming scans
    ├── viewEvaluation.js        # Radar benchmark matrix and side-by-side prompt debugger
    ├── viewAgents.js            # Custom tool configurations and Node/Python SDK template exports
    └── viewGovernance.js        # Regional directive controls and auditing logs
```
