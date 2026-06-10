// Evaluation Matrix View Component
import { AppState, showToast, addAuditLog } from './app.js';
import { BASE_MODELS, BENCHMARKS_PRESETS } from './mockData.js';

export function initEvaluation(container) {
    let activePreset = 'financial';
    let userPromptInput = 'What is the debt-to-equity ratio threshold allowed by the credit covenants?';
    let baseModelResponse = '';
    let tunedModelResponse = '';
    let isComparing = false;

    const render = () => {
        const baseOptions = BASE_MODELS.map(m => `<option value="${m.id}" ${m.id === AppState.evaluationBaseId ? 'selected' : ''}>${m.name}</option>`).join('');
        const tunedOptions = AppState.customModels.map(m => `<option value="${m.id}" ${m.id === AppState.evaluationTunedId ? 'selected' : ''}>${m.name}</option>`).join('');

        const benchmarkScores = BENCHMARKS_PRESETS[activePreset] || BENCHMARKS_PRESETS.general;

        const html = `
            <div class="view-container">
                <div class="view-header">
                    <h1 class="view-title">Model Evaluation Matrix</h1>
                    <p class="view-desc">Compare baseline model outputs against specialized fine-tuned checkpoints across standardized corporate benchmarks and specific prompt test-suites.</p>
                </div>

                <!-- Benchmarking charts panel -->
                <div class="glass-panel" style="margin-bottom: 28px;">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                            Capability Benchmark Metrics
                        </h2>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <label class="form-label" style="font-size: 0.76rem; margin-bottom: 0;">Benchmark Profile:</label>
                            <select class="form-select btn-sm" id="eval-preset-select" style="width: auto; padding: 4px 10px; font-size: 0.76rem; height: auto;">
                                <option value="financial" ${activePreset === 'financial' ? 'selected' : ''}>Corporate Finance (SEC)</option>
                                <option value="legal" ${activePreset === 'legal' ? 'selected' : ''}>NDA Legal Drafting</option>
                                <option value="medical" ${activePreset === 'medical' ? 'selected' : ''}>Clinical Medical Scribe</option>
                                <option value="general" ${activePreset === 'general' ? 'selected' : ''}>General Capabilities (MMLU)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Scores layout -->
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <!-- Legend -->
                        <div style="display: flex; justify-content: flex-end; gap: 16px; font-size: 0.74rem; margin-bottom: 12px;">
                            <span style="color: #64748b; display: flex; align-items: center; gap: 6px;">
                                <span style="width: 10px; height: 10px; background-color: hsl(var(--border-color)/90%); display: inline-block; border-radius: 2px;"></span>
                                Baseline Model
                            </span>
                            <span style="color: hsl(var(--cyber-teal)); display: flex; align-items: center; gap: 6px;">
                                <span style="width: 10px; height: 10px; background: linear-gradient(135deg, hsl(var(--nebula-purple)), hsl(var(--cyber-teal))); display: inline-block; border-radius: 2px;"></span>
                                Customized Model
                            </span>
                        </div>

                        <!-- Progress Bar Rows -->
                        <div id="benchmark-bars-container" style="display: flex; flex-direction: column; gap: 14px;">
                            ${benchmarkScores.map(score => {
                                const delta = (score.tuned - score.base).toFixed(1);
                                return `
                                    <div class="benchmark-score-row">
                                        <div class="benchmark-title-wrap">
                                            <span class="benchmark-name">${score.category}</span>
                                            <span class="benchmark-sub">Accuracy Score</span>
                                        </div>
                                        <div class="benchmark-score-bar-grid">
                                            <div class="comparison-progress-track">
                                                <div class="progress-bar-fill base" style="width: ${score.base}%;"></div>
                                                <div class="progress-bar-fill tuned" style="width: ${score.tuned}%;"></div>
                                            </div>
                                            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                                                <span class="score-tag tuned-color">${score.tuned}%</span>
                                                <span style="font-size: 0.68rem; color: hsl(var(--success-emerald)); font-weight: 500;">+${delta}% delta</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Side-by-side prompt tester -->
                <div class="glass-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                            Side-by-Side Prompt Execution
                        </h2>
                    </div>

                    <div class="form-row" style="margin-bottom: 16px;">
                        <div class="form-group">
                            <label class="form-label">Base Reference Model</label>
                            <select class="form-select" id="eval-base-select">
                                ${baseOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tuned Target Model</label>
                            <select class="form-select" id="eval-tuned-select">
                                ${tunedOptions}
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Test Input Prompt</label>
                        <div style="display: flex; gap: 12px;">
                            <input type="text" class="form-input" id="eval-prompt-input" value="${userPromptInput}" style="flex-grow: 1;" />
                            <button class="btn btn-primary" id="btn-run-comparison" style="white-space: nowrap;">
                                Compare Output
                            </button>
                        </div>
                    </div>

                    <!-- Outputs container -->
                    <div class="eval-comparison-layout" id="eval-comparison-results" style="${isComparing || baseModelResponse ? '' : 'display: none;'}">
                        <!-- Baseline Output -->
                        <div class="compare-card">
                            <div class="compare-badge-strip">
                                <span class="compare-model-name" id="lbl-compare-base-name">Gemini 1.5 Pro</span>
                                <span class="compare-latency">Latency: <span id="val-base-latency">1,420ms</span></span>
                            </div>
                            <div class="compare-output-body" id="val-base-response">
                                ${baseModelResponse}
                            </div>
                        </div>

                        <!-- Tuned Output -->
                        <div class="compare-card">
                            <div class="compare-badge-strip">
                                <span class="compare-model-name" id="lbl-compare-tuned-name" style="color: hsl(var(--cyber-teal));">Specialized Model</span>
                                <span class="compare-latency">Latency: <span id="val-tuned-latency" style="color: hsl(var(--cyber-teal));">480ms</span></span>
                            </div>
                            <div class="compare-output-body" id="val-tuned-response" style="border-color: hsl(var(--cyber-teal)/25%); box-shadow: inset 0 0 12px rgba(0,245,212,0.03);">
                                ${tunedModelResponse}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        attachEventListeners();
    };

    const attachEventListeners = () => {
        // Preset select handler
        const presetSelect = document.getElementById('eval-preset-select');
        if (presetSelect) {
            presetSelect.addEventListener('change', (e) => {
                activePreset = e.target.value;
                // Swap input default suggestions
                if (activePreset === 'financial') {
                    userPromptInput = 'What is the debt-to-equity ratio threshold allowed by the credit covenants?';
                } else if (activePreset === 'legal') {
                    userPromptInput = 'Review indemnification obligations under section 6 of NDA template.';
                } else if (activePreset === 'medical') {
                    userPromptInput = 'Summarize clinical visit parameters for diabetic checks.';
                } else {
                    userPromptInput = 'Write a python script to implement depth first search on a graph.';
                }
                render();
            });
        }

        // Dropdowns selections mappings
        const baseSelect = document.getElementById('eval-base-select');
        if (baseSelect) {
            baseSelect.addEventListener('change', (e) => {
                AppState.evaluationBaseId = e.target.value;
            });
        }
        const tunedSelect = document.getElementById('eval-tuned-select');
        if (tunedSelect) {
            tunedSelect.addEventListener('change', (e) => {
                AppState.evaluationTunedId = e.target.value;
            });
        }

        // Compare Action
        const btnCompare = document.getElementById('btn-run-comparison');
        if (btnCompare) {
            btnCompare.addEventListener('click', () => {
                const prompt = document.getElementById('eval-prompt-input').value.trim();
                if (!prompt) return;

                userPromptInput = prompt;
                isComparing = true;
                
                // Show outputs panel with loadings
                const comparisonLayout = document.getElementById('eval-comparison-results');
                comparisonLayout.style.display = 'grid';

                const baseResponseDiv = document.getElementById('val-base-response');
                const tunedResponseDiv = document.getElementById('val-tuned-response');
                
                baseResponseDiv.innerHTML = '<span style="color: hsl(var(--text-low)); font-style: italic;">Querying baseline reference weights...</span>';
                tunedResponseDiv.innerHTML = '<span style="color: hsl(var(--text-low)); font-style: italic;">Querying custom compiled checkpoints...</span>';
                
                btnCompare.disabled = true;
                btnCompare.textContent = 'Generating comparison outputs...';

                // Set names
                const baseName = BASE_MODELS.find(m => m.id === AppState.evaluationBaseId)?.name || 'Base Model';
                const tunedName = AppState.customModels.find(m => m.id === AppState.evaluationTunedId)?.name || 'Custom Model';
                
                document.getElementById('lbl-compare-base-name').textContent = baseName;
                document.getElementById('lbl-compare-tuned-name').textContent = tunedName;

                // Simulate latencies
                setTimeout(() => {
                    // Responses mappings
                    let baseResp = `Standard base outputs are resolving: "${prompt}". Please note that generic base models require few-shot templates or explicit context framing to capture target covenants. Debt-to-equity ratios generally scale based on general business standards (1.5x - 2.5x).`;
                    let tunedResp = `[Specialized Tuning Output]:\nAccording to Section 4.3 (c) of credit agreement protocols:\n1. The maximum allowable debt-to-equity ratio threshold is strictly set at 2.25x.\n2. Computations must be completed at the end of each fiscal quarter.\n3. Breaches warrant immediate covenant warnings, granting lenders 30 days to resolve credit terms.`;

                    if (activePreset === 'legal') {
                        baseResp = `Baseline NDA explanation: Section 6 deals with indemnity. It describes who covers losses in case of third-party claims. Usually, party A protects party B against copyright breaches. Details require manual template customization.`;
                        tunedResp = `[Specialized Tuning Output - Section 6 NDA Audited]:\n- Indemnification limits are restricted strictly to direct claims.\n- Caps are enforced at $500,000 or trailing 12-month fees.\n- Indemnity exclusions apply for negligence or willful breaches.\n- Direct clause anomalies detected: Clause 6.4 contains a unilateral obligation which deviates from corporate symmetry guidelines.`;
                    } else if (activePreset === 'medical') {
                        baseResp = `Medical description: Diabetic patients need routine checks. This includes measuring HbA1c levels, examining feet, scanning eye retina status, and testing kidney health. Maintain blood sugar levels.`;
                        tunedResp = `[Specialized Tuning Output - MedScribe Assistant]:\n- Patient consult parameters resolved: Routine Type 2 Diabetes Audit.\n- Metric logs updated: HbA1c registered at 6.8% (optimized from 7.2%).\n- Action items: prescribe daily metformin dose (500mg), review cardiovascular constraints, audit blood pressure averages (130/82 mmHg).`;
                    }

                    baseModelResponse = baseResp;
                    tunedModelResponse = tunedResp;

                    baseResponseDiv.textContent = baseResp;
                    tunedResponseDiv.textContent = tunedResp;

                    document.getElementById('val-base-latency').textContent = '1,420ms';
                    document.getElementById('val-tuned-latency').textContent = '480ms';

                    btnCompare.disabled = false;
                    btnCompare.textContent = 'Compare Output';
                    isComparing = false;
                    
                    addAuditLog('COMPARE_MODEL_OUTPUTS', `${baseName} vs ${tunedName}`);
                    showToast('Evaluation Completed', 'Comparison runs compiled side-by-side.', 'success');
                }, 1600);
            });
        }
    };

    // Draw first view state
    render();
}
