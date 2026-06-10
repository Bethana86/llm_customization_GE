// Agent Publisher View Component
import { AppState, showToast, addAuditLog } from './app.js';

export function initAgents(container) {
    let activeTab = 'python';
    let agentName = 'Finance_Auditor_Agent';
    let selectedModelId = AppState.customModels[0] ? AppState.customModels[0].id : 'gemini-1.5-pro-finance-v2';
    
    // Tools switches
    let tools = {
        search: true,
        code: false,
        api: false
    };

    const render = () => {
        const modelOptions = AppState.customModels.map(m => `
            <option value="${m.id}" ${m.id === selectedModelId ? 'selected' : ''}>${m.name}</option>
        `).join('');

        const codeSnippets = {
            python: `import google.generativeai as genai

# Initialize Gemini Enterprise Platform client
genai.configure(api_key="GEMINI_API_KEY")

# Bind customized model checkpoint
model = genai.GenerativeModel(
    model_name="models/${selectedModelId}",
    tools=[
        ${tools.search ? '{"google_search_retrieval": {}}' : ''}${tools.search && tools.code ? ',\n        ' : ''}${tools.code ? '{"code_interpreter": {}}' : ''}
    ]
)

# Launch conversational agent loop
response = model.generate_content(
    "Analyze the liability threshold in SEC file Q1-2026.",
    generation_config={"temperature": 0.2}
)

print(response.text)`,
            nodejs: `const { GoogleGenAI } = require("@google/generativeai");

// Initialize platform context
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runAgent() {
  // Bind custom weights and tools
  const agent = await ai.models.get("${selectedModelId}");
  
  const response = await agent.generate({
    prompt: "Analyze the liability threshold in SEC file Q1-2026.",
    temperature: 0.2,
    tools: [
      ${tools.search ? "{ googleSearch: true }" : ""}${tools.search && (tools.code || tools.api) ? ",\n      " : ""}${tools.code ? "{ codeInterpreter: true }" : ""}${tools.code && tools.api ? ",\n      " : ""}${tools.api ? "{ connector: 'custom-api-spec' }" : ""}
    ]
  });

  console.log(response.text);
}

runAgent();`,
            curl: `curl https://generativelanguage.googleapis.com/v1beta/models/${selectedModelId}:generateContent?key=$GEMINI_API_KEY \\
  -H 'Content-Type: application/json' \\
  -d '{
    "contents": [{"parts":[{"text": "Analyze the liability threshold in SEC file Q1-2026."}]}],
    "generationConfig": {
        "temperature": 0.2
    },
    "tools": [
        ${tools.search ? '{"google_search": {}}' : ''}${tools.search && tools.code ? ',\n        ' : ''}${tools.code ? '{"code_interpreter": {}}' : ''}
    ]
  }'`
        };

        const html = `
            <div class="view-container">
                <div class="view-header">
                    <h1 class="view-title">Agent Publisher</h1>
                    <p class="view-desc">Package customized model checkpoints into autonomous Enterprise Agents. Bind tool resources, enforce content filters, and export SDK templates.</p>
                </div>

                <div class="grid-main">
                    <!-- Left: Agent Assembly Wizard -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div class="glass-panel">
                            <div class="panel-header">
                                <h2 class="panel-title">
                                    <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    Agent Packaging Assembly
                                </h2>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Agent Identifier Name</label>
                                <input type="text" class="form-input" id="agent-name-input" value="${agentName}" />
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Custom Model Binding</label>
                                    <select class="form-select" id="agent-model-select">
                                        ${modelOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Deployment Registry Environment</label>
                                    <select class="form-select">
                                        <option value="prod">Production Cluster (US-Central)</option>
                                        <option value="staging">Staging Sandbox (EU-West)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Tools Binding Section -->
                            <div style="margin-top: 12px; margin-bottom: 8px;">
                                <label class="form-label" style="margin-bottom: 12px;">Bind Platform Capabilities (Tools)</label>
                                
                                <!-- Tool 1 -->
                                <div class="tool-switch-row">
                                    <div class="tool-info">
                                        <span class="tool-title">Google Search Grounding</span>
                                        <span class="tool-description">Enables real-time web search verification to prevent factual hallucinations.</span>
                                    </div>
                                    <label class="switch-control">
                                        <input type="checkbox" id="tool-search-toggle" ${tools.search ? 'checked' : ''} />
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>

                                <!-- Tool 2 -->
                                <div class="tool-switch-row">
                                    <div class="tool-info">
                                        <span class="tool-title">Secure Code Interpreter</span>
                                        <span class="tool-description">Executes python code scripts inside an isolated sandboxed workspace.</span>
                                    </div>
                                    <label class="switch-control">
                                        <input type="checkbox" id="tool-code-toggle" ${tools.code ? 'checked' : ''} />
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>

                                <!-- Tool 3 -->
                                <div class="tool-switch-row">
                                    <div class="tool-info">
                                        <span class="tool-title">Enterprise OpenAPI Connector</span>
                                        <span class="tool-description">Binds backend systems (Databases, CRMs) via OpenAPI schemas.</span>
                                    </div>
                                    <label class="switch-control">
                                        <input type="checkbox" id="tool-api-toggle" ${tools.api ? 'checked' : ''} />
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <button class="btn btn-teal" id="btn-publish-agent" style="width: 100%; margin-top: 16px;">
                                Compile & Publish Agent to Cluster Hub
                            </button>
                        </div>
                    </div>

                    <!-- Right: Developer SDK Exports -->
                    <div class="glass-panel" style="display: flex; flex-direction: column;">
                        <div class="panel-header" style="margin-bottom: 12px;">
                            <h2 class="panel-title">
                                <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18L22 12L16 6M8 6L2 12L8 18" /></svg>
                                Integration SDK Boilerplate
                            </h2>
                        </div>

                        <div class="integration-tab-bar">
                            <button class="integration-tab ${activeTab === 'python' ? 'active' : ''}" data-tab="python">Python SDK</button>
                            <button class="integration-tab ${activeTab === 'nodejs' ? 'active' : ''}" data-tab="nodejs">Node.js</button>
                            <button class="integration-tab ${activeTab === 'curl' ? 'active' : ''}" data-tab="curl">cURL API</button>
                        </div>

                        <div class="code-viewer-panel">
                            <pre class="code-block" id="sdk-code-display"><code>${codeSnippets[activeTab]}</code></pre>
                            <button class="copy-btn" id="btn-copy-code">Copy Code</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        attachEventListeners();
    };

    const attachEventListeners = () => {
        // Tab switching
        const tabs = document.querySelectorAll('.integration-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                activeTab = tab.getAttribute('data-tab');
                render();
            });
        });

        // Model binding updates
        const modelSelect = document.getElementById('agent-model-select');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                selectedModelId = e.target.value;
                render();
            });
        }

        // Agent Name text listener
        const agentNameInput = document.getElementById('agent-name-input');
        if (agentNameInput) {
            agentNameInput.addEventListener('input', (e) => {
                agentName = e.target.value.trim();
            });
        }

        // Tool toggling switches
        const searchToggle = document.getElementById('tool-search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('change', (e) => {
                tools.search = e.target.checked;
                render();
            });
        }

        const codeToggle = document.getElementById('tool-code-toggle');
        if (codeToggle) {
            codeToggle.addEventListener('change', (e) => {
                tools.code = e.target.checked;
                render();
            });
        }

        const apiToggle = document.getElementById('tool-api-toggle');
        if (apiToggle) {
            apiToggle.addEventListener('change', (e) => {
                tools.api = e.target.checked;
                render();
            });
        }

        // Copy Code to Clipboard
        const btnCopy = document.getElementById('btn-copy-code');
        if (btnCopy) {
            btnCopy.addEventListener('click', () => {
                const codeText = document.querySelector('#sdk-code-display code').textContent;
                navigator.clipboard.writeText(codeText).then(() => {
                    btnCopy.textContent = 'Copied!';
                    showToast('Boilerplate Copied', 'Integration script copied to clipboard.', 'success');
                    setTimeout(() => {
                        btnCopy.textContent = 'Copy Code';
                    }, 2000);
                }).catch(err => {
                    showToast('Clipboard Error', 'Could not copy snippet automatically.', 'error');
                });
            });
        }

        // Publish Agent Action
        const btnPublish = document.getElementById('btn-publish-agent');
        if (btnPublish) {
            btnPublish.addEventListener('click', () => {
                if (!agentName) {
                    showToast('Parameter Error', 'Please specify an identifier for the Agent.', 'warning');
                    return;
                }

                btnPublish.disabled = true;
                btnPublish.textContent = 'Compiling configurations...';

                setTimeout(() => {
                    addAuditLog('PUBLISHED_AGENT', `${agentName} (${selectedModelId})`);
                    showToast('Agent Published', `${agentName} successfully deployed to GCP Gateway.`, 'success');
                    btnPublish.disabled = false;
                    btnPublish.textContent = 'Compile & Publish Agent to Cluster Hub';
                }, 1600);
            });
        }
    };

    // Draw first view state
    render();
}
