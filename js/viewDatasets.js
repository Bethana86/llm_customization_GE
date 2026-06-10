// Dataset Factory View Component
import { AppState, showToast, addAuditLog } from './app.js';

export function initDatasets(container) {
    let uploadedFile = null;
    let selectedCleaningTools = new Set(['pii', 'dup']); // default cleaning parameters

    const render = () => {
        const html = `
            <div class="view-container">
                <div class="view-header">
                    <h1 class="view-title">Dataset Factory</h1>
                    <p class="view-desc">Ingest corporate documents, parse JSONL/CSV training pairs, sanitize PII, and generate high-fidelity synthetic prompt-response datasets.</p>
                </div>

                <div class="grid-main">
                    <!-- Left: Ingestion & Generator panels -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        
                        <!-- Upload Section -->
                        <div class="glass-panel">
                            <div class="panel-header">
                                <h2 class="panel-title">
                                    <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                                    Dataset Ingestion & Validation
                                </h2>
                            </div>
                            
                            <div class="drag-zone" id="dataset-drag-zone">
                                <svg class="drag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span class="drag-text" id="drag-text-label">Drag and drop training datasets here (.jsonl, .csv, .txt)</span>
                                <span class="drag-sub">Supports system-instruction pair format or plain context text files</span>
                                <input type="file" id="dataset-file-input" style="display: none;" accept=".jsonl,.csv,.txt" />
                            </div>

                            <!-- Uploaded file summary -->
                            <div id="upload-summary-container" class="dataset-summary-box ${uploadedFile ? '' : 'hidden'}" style="${uploadedFile ? '' : 'display: none;'}">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: 600; font-size: 0.95rem; color: white;" id="summary-file-name">${uploadedFile ? uploadedFile.name : ''}</span>
                                    <button class="panel-action" id="btn-remove-file" style="color: hsl(var(--warning-coral));">Remove</button>
                                </div>
                                <div class="summary-pill-grid">
                                    <div class="summary-pill">
                                        <span class="pill-label">Detected Pairs</span>
                                        <span class="pill-val" id="summary-rows">${uploadedFile ? uploadedFile.rows : 0}</span>
                                    </div>
                                    <div class="summary-pill">
                                        <span class="pill-label">Token Estimate</span>
                                        <span class="pill-val" id="summary-tokens">${uploadedFile ? uploadedFile.tokens : '0'}</span>
                                    </div>
                                    <div class="summary-pill">
                                        <span class="pill-label">Raw Quality Score</span>
                                        <span class="pill-val" id="summary-quality">${uploadedFile ? uploadedFile.quality : '0%'}</span>
                                    </div>
                                </div>

                                <!-- Cleaning & Preprocessing Suite -->
                                <div style="border-top: 1px solid hsl(var(--border-color)); padding-top: 16px; margin-top: 8px;">
                                    <h3 style="font-size: 0.88rem; font-weight: 600; color: white; margin-bottom: 12px;">Diagnostic Preprocessing Rules</h3>
                                    <div class="cleaning-checklist">
                                        <div class="check-item">
                                            <div class="check-box ${selectedCleaningTools.has('pii') ? 'checked' : ''}" data-tool="pii">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <span>Mask HIPAA/PII sensitive tokens (Names, Socials, Medical IDs)</span>
                                        </div>
                                        <div class="check-item">
                                            <div class="check-box ${selectedCleaningTools.has('dup') ? 'checked' : ''}" data-tool="dup">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <span>De-duplicate exact and near-match prompt pairings</span>
                                        </div>
                                        <div class="check-item">
                                            <div class="check-box ${selectedCleaningTools.has('token') ? 'checked' : ''}" data-tool="token">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <span>Prune outlier inputs exceeding 128k sequence threshold</span>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary" id="btn-run-cleaning" style="width: 100%; margin-top: 20px;">
                                        Execute Pipeline & Clean Dataset
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Synthetic Generator Section -->
                        <div class="glass-panel">
                            <div class="panel-header">
                                <h2 class="panel-title">
                                    <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    Gemini Synthetic Data Generator
                                </h2>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Generation Objective / Use Case</label>
                                <textarea class="form-textarea" id="gen-objective" placeholder="e.g., Generate technical customer support pairs responding to SQL database performance, deadlocks, and connection timeout warnings."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Number of Pairs</label>
                                    <select class="form-select" id="gen-count">
                                        <option value="5">5 pairs (Fast test)</option>
                                        <option value="15" selected>15 pairs (Recommended)</option>
                                        <option value="50">50 pairs (Complete seed)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Response Dialect / Persona</label>
                                    <select class="form-select" id="gen-persona">
                                        <option value="expert">Senior Cloud Support Architect</option>
                                        <option value="empathetic">Friendly/Empathetic Agent</option>
                                        <option value="formal">Legal Regulatory Officer</option>
                                    </select>
                                </div>
                            </div>
                            <button class="btn btn-teal" id="btn-trigger-generation" style="width: 100%;">
                                Generate Synthetic Dataset
                            </button>

                            <!-- Generation output placeholder -->
                            <div id="gen-results-container" class="hidden" style="display: none; margin-top: 24px; border-top: 1px solid hsl(var(--border-color)); padding-top: 20px;">
                                <h3 style="font-size: 0.95rem; font-weight: 600; color: white; margin-bottom: 12px;">Generated Pairs Output</h3>
                                <div class="table-wrapper" style="max-height: 220px; overflow-y: auto;">
                                    <table class="custom-table" style="font-size: 0.78rem;">
                                        <thead>
                                            <tr>
                                                <th style="width: 40%;">Prompt</th>
                                                <th>Response</th>
                                            </tr>
                                        </thead>
                                        <tbody id="gen-results-tbody"></tbody>
                                    </table>
                                </div>
                                <div class="form-group" style="margin-top: 16px; margin-bottom: 0;">
                                    <label class="form-label">Save Dataset As</label>
                                    <div style="display: flex; gap: 12px;">
                                        <input type="text" class="form-input" id="save-gen-name" placeholder="Synthetic_Support_Data.jsonl" style="flex-grow: 1;" />
                                        <button class="btn btn-primary" id="btn-save-synthetic" style="white-space: nowrap;">Register Dataset</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Right: Dataset registry list -->
                    <div class="glass-panel" style="display: flex; flex-direction: column; gap: 20px; height: fit-content;">
                        <div class="panel-header" style="margin-bottom: 10px;">
                            <h2 class="panel-title">
                                <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18M4 6h16M4 12h16M4 18h16" /></svg>
                                Dataset Registry Catalog
                            </h2>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 14px;" id="datasets-list-render">
                            ${AppState.datasets.map(ds => `
                                <div class="glass-panel" style="padding: 16px; border-radius: var(--border-radius-md); background: hsl(var(--bg-obsidian)/80%); border: 1px solid hsl(var(--border-color)/50%); display: flex; flex-direction: column; gap: 8px;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                        <span style="font-weight: 600; font-size: 0.9rem; color: white; word-break: break-all; margin-right: 8px;">${ds.name}</span>
                                        <span class="badge badge-${ds.status === 'Cleaned' ? 'completed' : 'pending'}" style="font-size: 0.68rem; padding: 2px 6px;">
                                            ${ds.status}
                                        </span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: hsl(var(--text-mid)); font-family: var(--font-family-mono);">
                                        <span>${ds.rows} entries</span>
                                        <span>${ds.tokens}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid hsl(var(--border-color)/30%); padding-top: 8px; font-size: 0.72rem; color: hsl(var(--text-low));">
                                        <span>By ${ds.creator}</span>
                                        <span style="color: ${ds.quality.includes('Poor') ? 'hsl(var(--warning-coral))' : 'hsl(var(--cyber-teal))'}">${ds.quality}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        attachEventListeners();
    };

    const attachEventListeners = () => {
        const dragZone = document.getElementById('dataset-drag-zone');
        const fileInput = document.getElementById('dataset-file-input');

        // Drag events
        dragZone.addEventListener('click', () => fileInput.click());
        dragZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dragZone.classList.add('dragging');
        });
        dragZone.addEventListener('dragleave', () => dragZone.classList.remove('dragging'));
        dragZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dragZone.classList.remove('dragging');
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });

        // Remove file
        const btnRemove = document.getElementById('btn-remove-file');
        if (btnRemove) {
            btnRemove.addEventListener('click', () => {
                uploadedFile = null;
                render();
                showToast('File Cleared', 'The selected upload was removed.', 'info');
            });
        }

        // Checklist check-box toggling
        const checkBoxes = document.querySelectorAll('.check-box');
        checkBoxes.forEach(box => {
            box.addEventListener('click', () => {
                const toolName = box.getAttribute('data-tool');
                if (selectedCleaningTools.has(toolName)) {
                    selectedCleaningTools.delete(toolName);
                } else {
                    selectedCleaningTools.add(toolName);
                }
                render(); // redraw checked status
            });
        });

        // Cleaning Action
        const btnRunCleaning = document.getElementById('btn-run-cleaning');
        if (btnRunCleaning) {
            btnRunCleaning.addEventListener('click', () => {
                btnRunCleaning.disabled = true;
                btnRunCleaning.textContent = 'Executing Preprocessing Rules...';
                
                setTimeout(() => {
                    // Update dataset details in global state or notify
                    const cleanedDataset = {
                        id: 'ds-' + Date.now(),
                        name: uploadedFile.name.replace(/\.[^/.]+$/, "") + '_cleaned.jsonl',
                        rows: Math.floor(uploadedFile.rows * 0.94), // simulating pruning
                        tokens: uploadedFile.tokens,
                        quality: 'Excellent',
                        status: 'Cleaned',
                        createdDate: new Date().toISOString().slice(0,10) + ' ' + new Date().toTimeString().slice(0,5),
                        creator: 'Admin Engineer'
                    };

                    AppState.datasets.unshift(cleanedDataset);
                    addAuditLog('CLEANED_DATASET', cleanedDataset.name);
                    showToast('Pipeline Completed', `${cleanedDataset.name} was saved to the registry.`, 'success');
                    
                    uploadedFile = null;
                    render();
                }, 1800);
            });
        }

        // Synthetic Generator Action
        const btnTriggerGen = document.getElementById('btn-trigger-generation');
        if (btnTriggerGen) {
            btnTriggerGen.addEventListener('click', () => {
                const objective = document.getElementById('gen-objective').value.trim();
                if (!objective) {
                    showToast('Missing Parameters', 'Please define the generation objective first.', 'warning');
                    return;
                }

                btnTriggerGen.disabled = true;
                btnTriggerGen.textContent = 'Invoking Gemini Platform Generator...';

                // Generate mock records based on objective
                setTimeout(() => {
                    const count = parseInt(document.getElementById('gen-count').value);
                    const persona = document.getElementById('gen-persona').value;
                    const resultsTableBody = document.getElementById('gen-results-tbody');
                    resultsTableBody.innerHTML = '';

                    const syntheticPairs = [];
                    for(let i=1; i<=count; i++) {
                        let promptText = `Provide debugging diagnostics for error code ${1000 + i*15} inside database workspace.`;
                        let responseText = `[Persona: ${persona}] This alert is caused by lock resource contention. Execute 'SHOW ENGINE INNODB STATUS' to locate current blockers.`;
                        if (objective.toLowerCase().includes('sql') || objective.toLowerCase().includes('database')) {
                            promptText = `What triggers SQL transaction deadlock warning #${200 + i}?`;
                            responseText = `Deadlocks occur when two transactions hold lock resources needed by each other. Recommendations: (1) Keep transactions brief, (2) Index query components, (3) Use read-committed isolation.`;
                        } else if (objective.toLowerCase().includes('nda') || objective.toLowerCase().includes('contract')) {
                            promptText = `Verify the non-compete clause duration limits in NDA template draft ${i}.`;
                            responseText = `Standard limits are set to 12 months. Geographic radius is constrained to 25 miles of office workspace. Compliance requires local state regulations check.`;
                        }

                        syntheticPairs.push({ prompt: promptText, response: responseText });
                        
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td style="font-weight: 500; border-right: 1px solid hsl(var(--border-color)/30%);">${promptText}</td>
                            <td style="color: hsl(var(--text-mid));">${responseText}</td>
                        `;
                        resultsTableBody.appendChild(tr);
                    }

                    // Store temp pairs on dataset generator form
                    window.lastGeneratedPairs = syntheticPairs;

                    // Show container
                    const genResultsContainer = document.getElementById('gen-results-container');
                    genResultsContainer.classList.remove('hidden');
                    genResultsContainer.style.display = 'block';

                    // Update filename suggestion
                    document.getElementById('save-gen-name').value = `Gemini_Synthetic_${objective.split(' ').slice(0,2).join('_') || 'Support'}_${Date.now().toString().slice(-4)}.jsonl`;

                    btnTriggerGen.disabled = false;
                    btnTriggerGen.textContent = 'Generate Synthetic Dataset';
                    showToast('Synthesis Finished', `Successfully synthesized ${count} instruction pairs.`, 'success');
                }, 2200);
            });
        }

        // Save Synthetic Dataset Action
        const btnSaveSynthetic = document.getElementById('btn-save-synthetic');
        if (btnSaveSynthetic) {
            btnSaveSynthetic.addEventListener('click', () => {
                const name = document.getElementById('save-gen-name').value.trim();
                if (!name) {
                    showToast('Filename Missing', 'Please enter a name for the output file.', 'warning');
                    return;
                }

                const newDs = {
                    id: 'ds-' + Date.now(),
                    name: name,
                    rows: window.lastGeneratedPairs ? window.lastGeneratedPairs.length : 15,
                    tokens: '14.2k tokens',
                    quality: 'Excellent (High Diversity)',
                    status: 'Cleaned',
                    createdDate: new Date().toISOString().slice(0,10) + ' ' + new Date().toTimeString().slice(0,5),
                    creator: 'Gemini Agent API'
                };

                AppState.datasets.unshift(newDs);
                addAuditLog('SAVED_SYNTHETIC_DATASET', newDs.name);
                showToast('Dataset Saved', `${newDs.name} has been added to the catalog.`, 'success');

                // Clear synthesis view
                document.getElementById('gen-results-container').style.display = 'none';
                document.getElementById('gen-objective').value = '';
                window.lastGeneratedPairs = null;
                
                render();
            });
        }
    };

    const handleFileUpload = (file) => {
        // Simulating parsing of upload file
        uploadedFile = {
            name: file.name,
            rows: Math.floor(200 + Math.random() * 2000),
            tokens: (Math.random() * 2).toFixed(1) + 'M tokens',
            quality: Math.random() > 0.4 ? 'Good (8% low token length)' : 'Poor (12% duplicate prompts)',
            status: 'Needs Cleaning'
        };

        render();
        showToast('Dataset Uploaded', `File ${file.name} was successfully validation-checked.`, 'info');
    };

    // Draw first view state
    render();
}
