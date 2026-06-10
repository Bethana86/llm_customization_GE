// Operations Hub View
import { AppState, switchView } from './app.js';

export function initDashboard(container) {
    // Calculate dashboard statistics
    const activeJobsCount = AppState.jobs.filter(j => j.status === 'running' || j.status === 'pending').length;
    const completedJobs = AppState.jobs.filter(j => j.status === 'completed');
    const modelCount = AppState.customModels.length;

    const html = `
        <div class="view-container">
            <div class="view-header">
                <h1 class="view-title">Operations Hub</h1>
                <p class="view-desc">Monitor your active training pipelines, registry models, GPU clusters, and enterprise tuning governance metrics.</p>
            </div>

            <!-- Stats grid -->
            <div class="grid-stats">
                <div class="glass-panel stat-card">
                    <div class="stat-content">
                        <span class="stat-label">Model Registry</span>
                        <span class="stat-val" id="stat-model-count">${modelCount} Custom</span>
                        <span class="stat-indicator up">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15" /></svg>
                            Active
                        </span>
                    </div>
                    <div class="stat-icon-wrapper">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                            <line x1="6" y1="6" x2="6.01" y2="6"/>
                            <line x1="6" y1="18" x2="6.01" y2="18"/>
                        </svg>
                    </div>
                </div>

                <div class="glass-panel stat-card">
                    <div class="stat-content">
                        <span class="stat-label">Active GPU Pipelines</span>
                        <span class="stat-val" id="stat-active-jobs">${activeJobsCount} Running</span>
                        <span class="stat-indicator ${activeJobsCount > 0 ? 'up' : 'down'}">
                            ${activeJobsCount > 0 ? 'Cluster Engaged' : 'Cluster Idle'}
                        </span>
                    </div>
                    <div class="stat-icon-wrapper" style="color: hsl(var(--cyber-teal));">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M17 21v-2a3 3 0 0 0-3-3H10a3 3 0 0 0-3 3v2"/>
                            <circle cx="12" cy="11" r="3"/>
                        </svg>
                    </div>
                </div>

                <div class="glass-panel stat-card">
                    <div class="stat-content">
                        <span class="stat-label">Avg. Benchmark Delta</span>
                        <span class="stat-val">+18.4%</span>
                        <span class="stat-indicator up">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15" /></svg>
                            vs Base Models
                        </span>
                    </div>
                    <div class="stat-icon-wrapper" style="color: hsl(var(--gold-accent));">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                </div>

                <div class="glass-panel stat-card">
                    <div class="stat-content">
                        <span class="stat-label">Total Customization Cost</span>
                        <span class="stat-val">$1,842.15</span>
                        <span class="stat-indicator down">
                            84% quota remaining
                        </span>
                    </div>
                    <div class="stat-icon-wrapper" style="color: hsl(var(--success-emerald));">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Main dashboard content splits -->
            <div class="grid-main">
                <!-- Left panel: Tuning Jobs queue -->
                <div class="glass-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            Tuning Jobs Monitor
                        </h2>
                        <button class="panel-action" id="action-go-tuning">Configure New Tuning Job &rarr;</button>
                    </div>
                    <div class="table-wrapper">
                        <table class="custom-table" id="jobs-table">
                            <thead>
                                <tr>
                                    <th>Job ID</th>
                                    <th>Name</th>
                                    <th>Base Model</th>
                                    <th>Method</th>
                                    <th>Dataset</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${AppState.jobs.map(job => `
                                    <tr>
                                        <td style="font-family: var(--font-family-mono); font-weight: 500;">${job.id}</td>
                                        <td style="font-weight: 600;">${job.name}</td>
                                        <td style="color: hsl(var(--text-mid));">${job.baseModel}</td>
                                        <td style="font-size: 0.82rem;"><span style="background: hsl(var(--bg-surface)); padding: 4px 8px; border-radius: var(--border-radius-sm); border: 1px solid hsl(var(--border-color));">${job.tuningMethod}</span></td>
                                        <td style="color: hsl(var(--text-mid));">${job.dataset}</td>
                                        <td>
                                            <span class="badge badge-${job.status}">
                                                <span class="badge-dot"></span>
                                                ${job.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Right panel: Quick Actions & Registered Models -->
                <div class="glass-panel" style="display: flex; flex-direction: column; gap: 20px;">
                    <div>
                        <div class="panel-header" style="margin-bottom: 12px; padding-bottom: 8px;">
                            <h2 class="panel-title" style="font-size: 0.95rem;">
                                Registered Custom Models
                            </h2>
                            <button class="panel-action" id="action-go-playground" style="font-size: 0.78rem;">Playground &rarr;</button>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;" id="models-list-container">
                            ${AppState.customModels.map(model => `
                                <div class="glass-panel" style="padding: 12px; border-radius: var(--border-radius-md); background: hsl(var(--bg-obsidian)/80%); border: 1px solid hsl(var(--border-color)/50%); display: flex; flex-direction: column; gap: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-weight: 600; font-size: 0.85rem; color: white;">${model.name}</span>
                                        <span style="font-size: 0.72rem; color: hsl(var(--cyber-teal)); font-weight: 600; background: hsl(var(--cyber-teal)/8%); padding: 2px 6px; border-radius: var(--border-radius-sm); border: 1px solid hsl(var(--cyber-teal)/20%);">${model.qualityScore}% Eval</span>
                                    </div>
                                    <span style="font-size: 0.74rem; color: hsl(var(--text-low)); font-family: var(--font-family-mono);">${model.baseModel} &bull; ${model.tuningMethod}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="border-top: 1px solid hsl(var(--border-color)); padding-top: 16px;">
                        <h3 style="font-size: 0.9rem; font-weight: 600; color: white; margin-bottom: 12px;">Quick Start Factory</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button class="btn btn-secondary btn-sm" id="btn-quick-upload" style="justify-content: flex-start; text-align: left;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                                Ingest New Datasets
                            </button>
                            <button class="btn btn-primary btn-sm" id="btn-quick-tune" style="justify-content: flex-start; text-align: left;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; color: #fff;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                Launch LoRA Optimizer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Attach Action Handlers
    document.getElementById('action-go-tuning').addEventListener('click', () => switchView('training'));
    document.getElementById('btn-quick-tune').addEventListener('click', () => switchView('training'));
    
    document.getElementById('btn-quick-upload').addEventListener('click', () => switchView('datasets'));
    document.getElementById('action-go-playground').addEventListener('click', () => switchView('playground'));
}

export function destroyDashboard() {
    // Component cleanup if necessary
}
