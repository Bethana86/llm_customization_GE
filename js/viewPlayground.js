// Prompt Sandbox View Component
import { AppState, showToast, addAuditLog } from './app.js';
import { BASE_MODELS } from './mockData.js';

export function initPlayground(container) {
    let chatHistory = [];
    let systemInstruction = 'You are a professional financial advisor assisting enterprise clients with balance sheet auditing and risk assessment.';
    
    // Default safety parameters
    let safetyGauges = {
        injection: 12,
        leakage: 8,
        toxicity: 2,
        compliance: 98
    };

    const render = () => {
        // Collect all models
        const availableModels = [...BASE_MODELS, ...AppState.customModels];
        const modelOptions = availableModels.map(m => `
            <option value="${m.id}" ${m.id === AppState.playgroundModelId ? 'selected' : ''}>
                ${m.name} (${m.type || 'Custom Model'})
            </option>
        `).join('');

        const html = `
            <div class="view-container">
                <div class="view-header">
                    <h1 class="view-title">Prompt Sandbox</h1>
                    <p class="view-desc">Refine system instructions, structure complex variables, execute auto-prompt optimizations, and perform live safety auditing scans.</p>
                </div>

                <div class="playground-grid">
                    <!-- Left: Model System prompt & parameters config -->
                    <div class="prompt-sidebar">
                        <div class="glass-panel">
                            <div class="panel-header">
                                <h2 class="panel-title">
                                    <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M5 20h.01M19 4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /></svg>
                                    Prompt Configuration
                                </h2>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Active Model Instance</label>
                                <select class="form-select" id="play-model-select">
                                    ${modelOptions}
                                </select>
                            </div>

                            <div class="form-group">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <label class="form-label">System Instructions</label>
                                    <button class="panel-action" id="btn-auto-optimize" style="font-size: 0.78rem; color: hsl(var(--cyber-teal));">
                                        Auto-Optimize Prompt &sparkles;
                                    </button>
                                </div>
                                <textarea class="form-textarea" id="play-system-prompt" style="min-height: 140px; font-family: var(--font-family-sans); font-size: 0.86rem; line-height: 1.4;">${systemInstruction}</textarea>
                            </div>

                            <div class="form-row" style="margin-bottom: 0;">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Temperature</label>
                                    <div class="range-slider-container">
                                        <input type="range" class="range-slider" id="play-temp" min="0" max="100" value="40" />
                                        <span class="slider-value" id="play-temp-val">0.40</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Safety Scanner audit -->
                        <div class="glass-panel safety-check-panel">
                            <div class="panel-header" style="margin-bottom: 10px;">
                                <h2 class="panel-title" style="font-size: 0.95rem;">
                                    <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                    Red-Team Security Scan
                                </h2>
                                <button class="panel-action" id="btn-trigger-scan" style="font-size: 0.76rem;">Execute Diagnostics</button>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <!-- Meter 1 -->
                                <div class="safety-meter-row">
                                    <div class="safety-meter-info">
                                        <span class="safety-meter-label">Jailbreak / Injection Risk</span>
                                        <span class="safety-meter-status ${getSafetyClass(safetyGauges.injection)}" id="lbl-scan-inj">${safetyGauges.injection}%</span>
                                    </div>
                                    <div class="safety-bar-bg">
                                        <div class="safety-bar-fill ${getSafetyBarColor(safetyGauges.injection)}" id="bar-scan-inj" style="width: ${safetyGauges.injection}%;"></div>
                                    </div>
                                </div>

                                <!-- Meter 2 -->
                                <div class="safety-meter-row">
                                    <div class="safety-meter-info">
                                        <span class="safety-meter-label">Sensitive Data Leakage Risk</span>
                                        <span class="safety-meter-status ${getSafetyClass(safetyGauges.leakage)}" id="lbl-scan-leak">${safetyGauges.leakage}%</span>
                                    </div>
                                    <div class="safety-bar-bg">
                                        <div class="safety-bar-fill ${getSafetyBarColor(safetyGauges.leakage)}" id="bar-scan-leak" style="width: ${safetyGauges.leakage}%;"></div>
                                    </div>
                                </div>

                                <!-- Meter 3 -->
                                <div class="safety-meter-row">
                                    <div class="safety-meter-info">
                                        <span class="safety-meter-label">Toxic Content Generation</span>
                                        <span class="safety-meter-status ${getSafetyClass(safetyGauges.toxicity)}" id="lbl-scan-tox">${safetyGauges.toxicity}%</span>
                                    </div>
                                    <div class="safety-bar-bg">
                                        <div class="safety-bar-fill ${getSafetyBarColor(safetyGauges.toxicity)}" id="bar-scan-tox" style="width: ${safetyGauges.toxicity}%;"></div>
                                    </div>
                                </div>

                                <!-- Meter 4 -->
                                <div class="safety-meter-row">
                                    <div class="safety-meter-info">
                                        <span class="safety-meter-label">Enterprise Policy Alignment</span>
                                        <span class="safety-meter-status ${getComplianceClass(safetyGauges.compliance)}" id="lbl-scan-comp">${safetyGauges.compliance}%</span>
                                    </div>
                                    <div class="safety-bar-bg">
                                        <div class="safety-bar-fill ${getComplianceBarColor(safetyGauges.compliance)}" id="bar-scan-comp" style="width: ${safetyGauges.compliance}%;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Playground Sandbox Chat Console -->
                    <div class="glass-panel playground-editor-panel">
                        <div class="panel-header">
                            <h2 class="panel-title">
                                <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                Interactive Output Sandbox
                            </h2>
                            <button class="panel-action" id="btn-clear-chat" style="font-size: 0.78rem;">Clear Session</button>
                        </div>

                        <!-- Chat message thread -->
                        <div class="sandbox-chat-area" id="playground-chat-thread">
                            ${chatHistory.length === 0 ? `
                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: hsl(var(--text-low)); font-size: 0.85rem; gap: 8px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                                    <span>Send a message to test active prompt custom adjustments.</span>
                                </div>
                            ` : chatHistory.map(msg => `
                                <div class="chat-bubble ${msg.role}">
                                    <span class="bubble-sender">${msg.role === 'user' ? 'Test Auditor' : 'Gemini Output'}</span>
                                    <span>${msg.text}</span>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Chat input toolbar -->
                        <div class="chat-input-bar">
                            <input type="text" class="form-input chat-field" id="play-chat-input" placeholder="Enter test query here..." />
                            <button class="btn btn-primary" id="btn-chat-send" style="padding: 10px 16px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        attachEventListeners();
    };

    const getSafetyClass = (val) => val > 40 ? 'high' : val > 15 ? 'med' : 'low';
    const getSafetyBarColor = (val) => val > 40 ? 'red' : val > 15 ? 'yellow' : 'green';
    const getComplianceClass = (val) => val > 85 ? 'low' : val > 60 ? 'med' : 'high';
    const getComplianceBarColor = (val) => val > 85 ? 'green' : val > 60 ? 'yellow' : 'red';

    const attachEventListeners = () => {
        // Model change handler
        const modelSelect = document.getElementById('play-model-select');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                AppState.playgroundModelId = e.target.value;
                // Reset session
                chatHistory = [];
                render();
                showToast('Model Loaded', `Switched playground interface to target model.`, 'info');
            });
        }

        // System prompt instruction text listener
        const sysPromptArea = document.getElementById('play-system-prompt');
        if (sysPromptArea) {
            sysPromptArea.addEventListener('input', (e) => {
                systemInstruction = e.target.value;
            });
        }

        // Temperature slider selector
        const tempInput = document.getElementById('play-temp');
        const tempVal = document.getElementById('play-temp-val');
        if (tempInput && tempVal) {
            tempInput.addEventListener('input', (e) => {
                const num = parseFloat(e.target.value) / 100;
                tempVal.textContent = num.toFixed(2);
            });
        }

        // Chat send triggers
        const chatInput = document.getElementById('play-chat-input');
        const btnSend = document.getElementById('btn-chat-send');

        const handleSendMessage = () => {
            const query = chatInput.value.trim();
            if (!query) return;

            chatHistory.push({ role: 'user', text: query });
            chatInput.value = '';
            render();

            // Scroll chat down
            const chatThread = document.getElementById('playground-chat-thread');
            chatThread.scrollTop = chatThread.scrollHeight;

            // Generate typing simulation model response
            setTimeout(() => {
                let reply = `Based on your query: "${query}", the active customized prompt guidelines are resolving queries according to workspace policies. Please audit validation data to verify liability.`;
                
                // Add domain specifics
                const activeModel = [...BASE_MODELS, ...AppState.customModels].find(m => m.id === AppState.playgroundModelId);
                const modelNameLower = activeModel ? activeModel.name.toLowerCase() : '';
                
                if (modelNameLower.includes('finance')) {
                    reply = `[Finance Custom Model Response]: Accessing corporate Q1 balance data sheet summaries. Gross leverage remains constrained to 2.4x EBITDA, complying with loan covenants. Current EBITDA interest coverage ratio sits at 5.2x.`;
                } else if (modelNameLower.includes('legal')) {
                    reply = `[Legal Custom Model Response]: I have analyzed standard NDAs. Under Section 4.2 (Limitation of Liability), damages are capped at direct losses not exceeding aggregate fees paid during the trailing 12 months. This is compliant with corporate guidelines.`;
                } else if (modelNameLower.includes('medical')) {
                    reply = `[Medical Custom Model Response]: Summarizing patient consult note. Patient reports mild persistent database fatigue. Diagnosed with custom LoRA optimizer configuration dependencies. Action item: deploy full param checks.`;
                }

                chatHistory.push({ role: 'model', text: reply });
                render();
                
                const ct = document.getElementById('playground-chat-thread');
                ct.scrollTop = ct.scrollHeight;
            }, 1200);
        };

        if (btnSend) {
            btnSend.addEventListener('click', handleSendMessage);
        }
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSendMessage();
            });
        }

        // Clear Session
        const btnClear = document.getElementById('btn-clear-chat');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                chatHistory = [];
                render();
                showToast('Playground Reset', 'Sandbox dialogue session cleared.', 'info');
            });
        }

        // Auto Optimize Prompt Action
        const btnOptimize = document.getElementById('btn-auto-optimize');
        if (btnOptimize) {
            btnOptimize.addEventListener('click', () => {
                btnOptimize.disabled = true;
                btnOptimize.textContent = 'Optimizing Instructions...';

                setTimeout(() => {
                    systemInstruction = `[System instructions initialized under instruction-tuning rules]:\nRole: Senior Corporate Advisory Agent.\nTask: Audit balance sheets and analyze SEC disclosures.\nRules:\n1. Limit summaries to bulleted data points.\n2. Clearly demarcate liabilities, covenants, and credit ratios.\n3. Include data lineage references.\n4. Avoid speculating on market projections.`;
                    
                    // Update safety score simulation improvements
                    safetyGauges = {
                        injection: 4,
                        leakage: 3,
                        toxicity: 0,
                        compliance: 100
                    };

                    addAuditLog('AUTO_OPTIMIZED_PROMPT', AppState.playgroundModelId);
                    showToast('Prompt Enhanced', 'Optimized instruction-following rules template loaded.', 'success');
                    
                    btnOptimize.disabled = false;
                    btnOptimize.textContent = 'Auto-Optimize Prompt ✦';
                    render();
                }, 1800);
            });
        }

        // Safety Scanner Diagnostic
        const btnScan = document.getElementById('btn-trigger-scan');
        if (btnScan) {
            btnScan.addEventListener('click', () => {
                btnScan.disabled = true;
                btnScan.textContent = 'Scanning...';

                setTimeout(() => {
                    // Randomize slightly to demonstrate dynamic evaluation
                    const activeModel = [...BASE_MODELS, ...AppState.customModels].find(m => m.id === AppState.playgroundModelId);
                    const isBase = activeModel && activeModel.type === 'Base Model';

                    safetyGauges = {
                        injection: isBase ? Math.floor(15 + Math.random() * 20) : Math.floor(3 + Math.random() * 10),
                        leakage: isBase ? Math.floor(10 + Math.random() * 15) : Math.floor(2 + Math.random() * 6),
                        toxicity: Math.floor(Math.random() * 4),
                        compliance: isBase ? Math.floor(75 + Math.random() * 10) : Math.floor(92 + Math.random() * 8)
                    };

                    addAuditLog('RUN_RED_TEAM_SCAN', activeModel?.name || 'Playground Model');
                    showToast('Scan Completed', 'System diagnostic analysis updated.', 'success');
                    btnScan.disabled = false;
                    btnScan.textContent = 'Execute Diagnostics';
                    render();
                }, 1500);
            });
        }
    };

    // Draw first view state
    render();
}

export function destroyPlayground() {
    // Teardown if necessary
}
