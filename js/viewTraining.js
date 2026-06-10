// Tuning & Distillation View Component
import { AppState, showToast, addAuditLog } from './app.js';

let trainingInterval = null;
let animationFrameId = null;

export function initTraining(container) {
    let activeJob = null;
    let epochsCount = 5;
    let baseModelId = 'gemini-1.5-pro';
    let method = 'lora';
    let datasetName = AppState.datasets[0] ? AppState.datasets[0].name : 'Corporate_Finance_QnA.jsonl';

    const render = () => {
        const datasetsOptions = AppState.datasets.map(ds => `<option value="${ds.name}">${ds.name}</option>`).join('');

        const html = `
            <div class="view-container">
                <div class="view-header">
                    <h1 class="view-title">Model Tuning & Distillation</h1>
                    <p class="view-desc">Configure parameters for custom model tuning, compile weights, and orchestrate low-rank adaptors (LoRA) or student-teacher distillation pipelines.</p>
                </div>

                <div class="grid-main">
                    <!-- Left Panel: Job configuration wizard OR running monitor -->
                    <div id="training-main-card">
                        ${activeJob ? renderSimulatorHTML(activeJob) : renderConfiguratorHTML(datasetsOptions)}
                    </div>

                    <!-- Right Panel: Hyperparameter Guidelines -->
                    <div class="glass-panel" style="display: flex; flex-direction: column; gap: 20px; height: fit-content;">
                        <div class="panel-header" style="margin-bottom: 8px;">
                            <h2 class="panel-title">
                                <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                Tuning Recommendations
                            </h2>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 16px; font-size: 0.85rem; line-height: 1.5;">
                            <div>
                                <span style="font-weight: 600; color: white; display: block; margin-bottom: 4px;">Low-Rank Adaptation (LoRA)</span>
                                <span style="color: hsl(var(--text-mid));">Recommended for domain specialization (e.g. Finance terminology). Keeps memory foot-print small and prevents model drift. Use Rank 16 or 32 for complex reasoning tasks.</span>
                            </div>
                            <div style="border-top: 1px solid hsl(var(--border-color)/40%); padding-top: 12px;">
                                <span style="font-weight: 600; color: white; display: block; margin-bottom: 4px;">Knowledge Distillation</span>
                                <span style="color: hsl(var(--text-mid));">Transfers complex capability from Gemini 1.5 Pro (Teacher) into Gemini 1.5 Flash (Student). Perfect for optimizing latency while maintaining quality output.</span>
                            </div>
                            <div style="border-top: 1px solid hsl(var(--border-color)/40%); padding-top: 12px;">
                                <span style="font-weight: 600; color: white; display: block; margin-bottom: 4px;">Hyperparameters Guidance</span>
                                <span style="color: hsl(var(--text-mid));">Use learning rate of 1e-4 for LoRA, and 5e-5 for full tuning. Larger batch sizes increase compile stability but require higher GPU node allocations.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        attachEventListeners();

        if (activeJob && activeJob.status === 'running') {
            startTrainingSimulation(activeJob);
        }
    };

    const renderConfiguratorHTML = (datasetsOptions) => `
        <div class="glass-panel">
            <div class="panel-header">
                <h2 class="panel-title">
                    <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                    Tuning Workspace Configurations
                </h2>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tuning Job Name</label>
                <input type="text" class="form-input" id="cfg-job-name" value="Gemini-Custom-Run-${Date.now().toString().slice(-4)}" />
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Select Base Model</label>
                    <select class="form-select" id="cfg-base-model">
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (High Reasoning)</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Low Latency)</option>
                        <option value="gemini-ultra-1.0">Gemini Ultra 1.0 (Expert Logic)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Training Methodology</label>
                    <select class="form-select" id="cfg-method">
                        <option value="lora" selected>LoRA (Low-Rank Adaptation)</option>
                        <option value="full">Full Parameter Tuning</option>
                        <option value="distillation">Model Distillation (Pro -> Flash)</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Training Dataset</label>
                    <select class="form-select" id="cfg-dataset">
                        ${datasetsOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Target Epochs</label>
                    <select class="form-select" id="cfg-epochs">
                        <option value="3">3 Epochs</option>
                        <option value="5" selected>5 Epochs</option>
                        <option value="10">10 Epochs (Deep Fit)</option>
                    </select>
                </div>
            </div>

            <div class="form-group" style="margin-top: 8px;">
                <label class="form-label">Learning Rate Optimization</label>
                <div class="range-slider-container">
                    <input type="range" class="range-slider" id="cfg-lr" min="1" max="10" value="5" />
                    <span class="slider-value" id="cfg-lr-val">5.0e-5</span>
                </div>
            </div>

            <!-- Dynamic LoRA Parameters -->
            <div id="lora-params-subform" style="margin-top: 16px; border: 1px solid hsl(var(--border-color)/50%); border-radius: var(--border-radius-md); padding: 16px; background-color: hsl(var(--bg-obsidian)/40%);">
                <h3 style="font-size: 0.85rem; font-weight: 600; color: white; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background-color: hsl(var(--nebula-purple)); border-radius: 50%;"></span>
                    LoRA Adapter Hyperparameters
                </h3>
                <div class="form-row" style="margin-bottom: 0;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">LoRA Rank (r)</label>
                        <select class="form-select" id="cfg-lora-rank">
                            <option value="8">Rank 8 (Minimum)</option>
                            <option value="16" selected>Rank 16 (Standard)</option>
                            <option value="32">Rank 32 (Complex QA)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">LoRA Alpha</label>
                        <select class="form-select" id="cfg-lora-alpha">
                            <option value="16">16 (Conservative)</option>
                            <option value="32" selected>32 (Balanced)</option>
                            <option value="64">64 (Aggressive)</option>
                        </select>
                    </div>
                </div>
            </div>

            <button class="btn btn-primary" id="btn-start-tuning" style="width: 100%; margin-top: 24px;">
                Allocate GPU Cluster & Start Tuning
            </button>
        </div>
    `;

    const renderSimulatorHTML = (job) => `
        <div class="glass-panel" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="panel-header">
                <h2 class="panel-title">
                    <span class="status-dot online" style="margin-right: 6px;"></span>
                    Active Tuning: ${job.name}
                </h2>
                <div style="font-size: 0.8rem; font-family: var(--font-family-mono); color: hsl(var(--cyber-teal));">
                    GPU Node: GCP-H100-8x
                </div>
            </div>

            <!-- Loss graph wrapper -->
            <div class="live-loss-container">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.88rem; font-weight: 600; color: white;">Convergence Curves (Loss vs Iterations)</span>
                    <div style="display: flex; gap: 12px; font-size: 0.76rem;">
                        <span style="color: hsl(var(--nebula-purple)); display: flex; align-items: center; gap: 4px;">
                            <span style="width: 8px; height: 2px; background-color: hsl(var(--nebula-purple)); display: inline-block;"></span>
                            Train Loss
                        </span>
                        <span style="color: hsl(var(--cyber-teal)); display: flex; align-items: center; gap: 4px;">
                            <span style="width: 8px; height: 2px; background-color: hsl(var(--cyber-teal)); display: inline-block;"></span>
                            Val Loss
                        </span>
                    </div>
                </div>
                
                <div class="chart-canvas-wrapper">
                    <canvas id="loss-chart" class="loss-canvas"></canvas>
                </div>

                <!-- Numerical metrics strip -->
                <div class="live-metrics-strip">
                    <div class="metric-strip-card">
                        <span class="metric-strip-label">Current Loss</span>
                        <span class="metric-strip-val" id="val-loss">-</span>
                    </div>
                    <div class="metric-strip-card">
                        <span class="metric-strip-label">Epoch Progress</span>
                        <span class="metric-strip-val" id="val-epoch">-</span>
                    </div>
                    <div class="metric-strip-card">
                        <span class="metric-strip-label">Throughput</span>
                        <span class="metric-strip-val" id="val-throughput">1,420 t/s</span>
                    </div>
                    <div class="metric-strip-card">
                        <span class="metric-strip-label">Time Remaining</span>
                        <span class="metric-strip-val" id="val-eta">-</span>
                    </div>
                </div>
            </div>

            <!-- Terminal stdout logs -->
            <div>
                <span style="font-size: 0.85rem; font-weight: 600; color: white; display: block; margin-bottom: 8px;">GPU Kernel Logs (Stdout)</span>
                <div class="console-terminal" id="stdout-terminal"></div>
            </div>

            <!-- Actions control footer -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid hsl(var(--border-color)); padding-top: 16px;">
                <button class="btn btn-secondary" id="btn-cancel-job" style="color: hsl(var(--warning-coral)); border-color: hsl(var(--warning-coral)/30%);">
                    Abort Execution
                </button>
                <button class="btn btn-primary" id="btn-register-tuned-model" disabled>
                    Finalize & Register Custom Model
                </button>
            </div>
        </div>
    `;

    const attachEventListeners = () => {
        // LR Slider listener
        const lrInput = document.getElementById('cfg-lr');
        const lrVal = document.getElementById('cfg-lr-val');
        if (lrInput && lrVal) {
            lrInput.addEventListener('input', (e) => {
                const exponent = parseInt(e.target.value);
                lrVal.textContent = `${exponent.toFixed(1)}.0e-5`;
            });
        }

        // Method change sub-form controller
        const cfgMethod = document.getElementById('cfg-method');
        const loraSubform = document.getElementById('lora-params-subform');
        if (cfgMethod && loraSubform) {
            cfgMethod.addEventListener('change', (e) => {
                if (e.target.value === 'lora') {
                    loraSubform.style.display = 'block';
                } else {
                    loraSubform.style.display = 'none';
                }
                method = e.target.value;
            });
        }

        // Base Model mapping
        const cfgBaseModel = document.getElementById('cfg-base-model');
        if (cfgBaseModel) {
            cfgBaseModel.addEventListener('change', (e) => {
                baseModelId = e.target.value;
            });
        }

        // Start Tuning Action
        const btnStartTuning = document.getElementById('btn-start-tuning');
        if (btnStartTuning) {
            btnStartTuning.addEventListener('click', () => {
                const jobName = document.getElementById('cfg-job-name').value.trim();
                epochsCount = parseInt(document.getElementById('cfg-epochs').value);

                if (!jobName) {
                    showToast('Job Parameter Error', 'Please supply a non-empty name for this job run.', 'warning');
                    return;
                }

                // Initialize job states
                activeJob = {
                    id: 'job-' + Date.now().toString().slice(-4),
                    name: jobName,
                    baseModel: AppState.customModels.find(m => m.id === baseModelId)?.name || baseModelId,
                    dataset: datasetName,
                    tuningMethod: method === 'lora' ? 'LoRA' : method === 'distillation' ? 'Distillation' : 'Full Parameter',
                    epochs: epochsCount,
                    status: 'running',
                    progress: 0,
                    historyLoss: [],
                    historyValLoss: []
                };

                addAuditLog('STARTED_TUNING_PIPELINE', `${activeJob.name} (${activeJob.tuningMethod})`);
                showToast('Cluster Allocated', `GPU node allocated. Initiating training execution...`, 'success');
                render();
            });
        }

        // Cancel Job run Action
        const btnCancel = document.getElementById('btn-cancel-job');
        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                clearSimulation();
                activeJob = null;
                showToast('Job Aborted', 'Training job execution has been manually terminated.', 'warning');
                render();
            });
        }

        // Register Model Action
        const btnRegister = document.getElementById('btn-register-tuned-model');
        if (btnRegister && activeJob) {
            btnRegister.addEventListener('click', () => {
                const newModelName = `${activeJob.baseModel.replace('Base Model', '')} - ${activeJob.name}`;
                const newModel = {
                    id: 'gemini-custom-' + Date.now().toString().slice(-4),
                    name: newModelName,
                    baseModel: activeJob.baseModel,
                    tuningMethod: activeJob.tuningMethod,
                    dataset: activeJob.dataset,
                    qualityScore: (88 + Math.random() * 9).toFixed(1),
                    status: 'completed',
                    createdDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    description: `Custom model tuned via ${activeJob.tuningMethod} pipeline over ${activeJob.epochs} epochs.`
                };

                // Add to models registry
                AppState.customModels.unshift(newModel);

                // Add job history record
                AppState.jobs.unshift({
                    id: activeJob.id,
                    name: activeJob.name,
                    baseModel: activeJob.baseModel,
                    dataset: activeJob.dataset,
                    tuningMethod: activeJob.tuningMethod,
                    epochs: activeJob.epochs,
                    status: 'completed',
                    date: new Date().toISOString().slice(0, 10),
                    duration: '22m 14s'
                });

                addAuditLog('REGISTERED_CUSTOM_MODEL', newModel.name);
                showToast('Model Registered', `${newModel.name} successfully deployed to GCP registry.`, 'success');
                
                activeJob = null;
                render();
            });
        }
    };

    // Simulated GPU Training Execution Loop
    const startTrainingSimulation = (job) => {
        const terminal = document.getElementById('stdout-terminal');
        const lossValText = document.getElementById('val-loss');
        const epochText = document.getElementById('val-epoch');
        const etaText = document.getElementById('val-eta');
        const btnRegister = document.getElementById('btn-register-tuned-model');

        // Chart setup
        const canvas = document.getElementById('loss-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Set dimensions explicitly
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        let step = 0;
        const totalSteps = job.epochs * 50; // 50 steps per epoch
        
        let trainLoss = 2.8;
        let valLoss = 3.0;

        const printTerminalLine = (text, type = 'info') => {
            if (!terminal) return;
            const line = document.createElement('div');
            line.className = `terminal-line ${type}`;
            line.textContent = `[${new Date().toTimeString().slice(0, 8)}] ${text}`;
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
        };

        printTerminalLine('Initializing GCP GPU compiler workspace...', 'system');
        printTerminalLine(`Binding training node to cluster: GCP-H100-8x...`, 'info');
        printTerminalLine(`Mounting dataset disk: ${job.dataset}...`, 'info');
        printTerminalLine(`Downloading base checkpoint weights for ${job.baseModel}...`, 'info');

        // Animation draw loop
        const drawLossChart = () => {
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const paddingLeft = 40;
            const paddingBottom = 30;
            const paddingTop = 20;
            const paddingRight = 20;
            const plotWidth = canvas.width - paddingLeft - paddingRight;
            const plotHeight = canvas.height - paddingTop - paddingBottom;

            // Draw grids & borders
            ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
            ctx.lineWidth = 1;
            
            // horizontal grid lines
            for (let i = 0; i <= 4; i++) {
                const y = paddingTop + (plotHeight / 4) * i;
                ctx.beginPath();
                ctx.moveTo(paddingLeft, y);
                ctx.lineTo(canvas.width - paddingRight, y);
                ctx.stroke();
                
                // Y-labels (Loss bounds from 3.0 down to 0)
                ctx.fillStyle = '#64748b';
                ctx.font = '9px monospace';
                ctx.fillText((3.0 - 0.75 * i).toFixed(2), 10, y + 3);
            }

            // Draw X grid lines
            for (let i = 0; i <= 5; i++) {
                const x = paddingLeft + (plotWidth / 5) * i;
                ctx.beginPath();
                ctx.moveTo(x, paddingTop);
                ctx.lineTo(x, canvas.height - paddingBottom);
                ctx.stroke();

                // X-labels (Epochs)
                ctx.fillStyle = '#64748b';
                ctx.font = '9px Outfit';
                ctx.fillText(`Epoch ${Math.max(1, i)}`, x - 15, canvas.height - 12);
            }

            // Draw Train Loss Curve (Purple)
            if (job.historyLoss.length > 1) {
                ctx.strokeStyle = '#a044ff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                for (let idx = 0; idx < job.historyLoss.length; idx++) {
                    const x = paddingLeft + (plotWidth * (idx / totalSteps));
                    const lossVal = job.historyLoss[idx];
                    const y = paddingTop + plotHeight * (1 - (lossVal / 3.0));
                    if (idx === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Draw Val Loss Curve (Teal)
            if (job.historyValLoss.length > 1) {
                ctx.strokeStyle = '#00f5d4';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let idx = 0; idx < job.historyValLoss.length; idx++) {
                    const x = paddingLeft + (plotWidth * (idx / totalSteps));
                    const lossVal = job.historyValLoss[idx];
                    const y = paddingTop + plotHeight * (1 - (lossVal / 3.0));
                    if (idx === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(drawLossChart);
        };

        // Fire chart animation loop
        drawLossChart();

        // Step intervals simulating SGD step descent
        trainingInterval = setInterval(() => {
            if (step >= totalSteps) {
                clearSimulation();
                job.status = 'completed';
                printTerminalLine('Weights compiling completed. Final validation scores match registry limits.', 'success');
                printTerminalLine('Deployment check: 100% of pipeline nodes resolved successfully.', 'success');
                printTerminalLine('Custom weights registered to node registry location: gcp-eu-west4.', 'system');
                
                if (btnRegister) btnRegister.disabled = false;
                if (etaText) etaText.textContent = '0m 0s';
                showToast('Compile Finished', 'Model weights compiled successfully.', 'success');
                return;
            }

            step++;
            const currentEpoch = Math.ceil(step / 50);

            // Simulating loss decay curve
            const trainDecay = 2.3 * Math.exp(-step / (totalSteps * 0.45)) + 0.15 + Math.random() * 0.08;
            const valDecay = 2.4 * Math.exp(-step / (totalSteps * 0.5)) + 0.25 + Math.random() * 0.12;

            job.historyLoss.push(trainDecay);
            job.historyValLoss.push(valDecay);

            // Update DOM metrics
            if (lossValText) lossValText.textContent = trainDecay.toFixed(4);
            if (epochText) epochText.textContent = `Epoch ${currentEpoch}/${job.epochs} (Step ${step}/${totalSteps})`;
            if (etaText) {
                const remainingSecs = Math.ceil((totalSteps - step) * 0.4); // 0.4 seconds per step
                const mins = Math.floor(remainingSecs / 60);
                const secs = remainingSecs % 60;
                etaText.textContent = `${mins}m ${secs}s`;
            }

            // Print output text lines occasionally
            if (step === 5) {
                printTerminalLine('Tokenizing dataset completed. 1,450 sample instructions encoded.', 'success');
                printTerminalLine('Gradient descent optimizer initialized. Learning Rate: 5e-5', 'info');
            } else if (step % 20 === 0) {
                printTerminalLine(`Epoch ${currentEpoch} - Iteration ${step} - Training Loss: ${trainDecay.toFixed(4)} - Validation Loss: ${valDecay.toFixed(4)}`, 'info');
            } else if (step === Math.floor(totalSteps / 2)) {
                printTerminalLine('Evaluation check: Midpoint evaluation validation delta confirms continuous optimization.', 'warning');
            }

        }, 400); // 400ms per step simulation speed
    };

    const clearSimulation = () => {
        if (trainingInterval) {
            clearInterval(trainingInterval);
            trainingInterval = null;
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };

    // Draw first view state
    render();
}

export function destroyTraining() {
    if (trainingInterval) {
        clearInterval(trainingInterval);
        trainingInterval = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}
