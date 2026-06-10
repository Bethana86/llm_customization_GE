// Governance & Auditing View Component
import { AppState, showToast } from './app.js';

export function initGovernance(container) {
    let residencyEurope = true;
    let residencyAsia = false;
    let enforceDataMasking = true;

    const render = () => {
        const html = `
            <div class="view-container">
                <div class="view-header">
                    <h1 class="view-title">Governance & Auditing</h1>
                    <p class="view-desc">Monitor model provenance data lineages, audit access controls, restrict regional weights hosting, and control model tuning expenditures.</p>
                </div>

                <div class="grid-main">
                    <!-- Left: Audit Trail logs -->
                    <div class="glass-panel">
                        <div class="panel-header">
                            <h2 class="panel-title">
                                <svg class="panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                Immutable Compliance Audit Trail
                            </h2>
                        </div>

                        <div class="table-wrapper">
                            <table class="custom-table" style="font-size: 0.82rem;">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Actor</th>
                                        <th>Action</th>
                                        <th>Target Resource</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="audit-tbody-container">
                                    ${AppState.auditTrail.map(log => `
                                        <tr>
                                            <td style="font-family: var(--font-family-mono); font-size: 0.74rem; color: hsl(var(--text-mid));">${log.time}</td>
                                            <td style="font-weight: 600;">${log.user}</td>
                                            <td><span style="font-family: var(--font-family-mono); background: hsl(var(--bg-surface)); border: 1px solid hsl(var(--border-color)); padding: 2px 6px; border-radius: var(--border-radius-sm); font-size: 0.72rem; color: #a5b4fc;">${log.action}</span></td>
                                            <td style="color: hsl(var(--text-high)); font-weight: 500;">${log.target}</td>
                                            <td>
                                                <span style="display: inline-flex; align-items: center; gap: 4px; color: ${log.status === 'SUCCESS' ? 'hsl(var(--success-emerald))' : 'hsl(var(--warning-coral))'}; font-weight: 600; font-size: 0.72rem;">
                                                    <span style="width: 4px; height: 4px; border-radius: 50%; background-color: ${log.status === 'SUCCESS' ? 'hsl(var(--success-emerald))' : 'hsl(var(--warning-coral))'};"></span>
                                                    ${log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Right: Compliance & Controls Panel -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        
                        <!-- Quotas card -->
                        <div class="glass-panel">
                            <div class="panel-header" style="margin-bottom: 12px;">
                                <h2 class="panel-title" style="font-size: 0.95rem;">
                                    GPU Budget Quotas
                                </h2>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 500;">
                                    <span style="color: hsl(var(--text-mid));">Monthly Expenditure</span>
                                    <span>$1,842.15 / $2,200.00 limit</span>
                                </div>
                                <div class="safety-bar-bg" style="height: 10px; border-radius: 5px;">
                                    <div class="safety-bar-fill yellow" style="width: 83.7%; height: 100%; border-radius: 5px;"></div>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.78rem; color: hsl(var(--text-low)); line-height: 1.4;">
                                <span>Note: Nearing monthly cluster limits. Additional GPU node allocations will trigger secondary approval warnings.</span>
                            </div>
                        </div>

                        <!-- Regional compliance policies -->
                        <div class="glass-panel">
                            <div class="panel-header" style="margin-bottom: 16px;">
                                <h2 class="panel-title" style="font-size: 0.95rem;">
                                    Compliance Directives
                                </h2>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 14px;">
                                <div class="tool-switch-row" style="padding: 10px 12px; margin-bottom: 0; background-color: hsl(var(--bg-obsidian)/30%);">
                                    <div class="tool-info">
                                        <span class="tool-title" style="font-size: 0.8rem;">Data Residency: EU-West</span>
                                        <span class="tool-description" style="font-size: 0.68rem;">Force storage of model weights in EU clusters.</span>
                                    </div>
                                    <label class="switch-control" style="transform: scale(0.95);">
                                        <input type="checkbox" id="residency-eu-toggle" ${residencyEurope ? 'checked' : ''} />
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>

                                <div class="tool-switch-row" style="padding: 10px 12px; margin-bottom: 0; background-color: hsl(var(--bg-obsidian)/30%);">
                                    <div class="tool-info">
                                        <span class="tool-title" style="font-size: 0.8rem;">Data Residency: Asia-East</span>
                                        <span class="tool-description" style="font-size: 0.68rem;">Force storage of model weights in Tokyo node.</span>
                                    </div>
                                    <label class="switch-control" style="transform: scale(0.95);">
                                        <input type="checkbox" id="residency-as-toggle" ${residencyAsia ? 'checked' : ''} />
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>

                                <div class="tool-switch-row" style="padding: 10px 12px; margin-bottom: 0; background-color: hsl(var(--bg-obsidian)/30%);">
                                    <div class="tool-info">
                                        <span class="tool-title" style="font-size: 0.8rem;">Clean Data Enforcer</span>
                                        <span class="tool-description" style="font-size: 0.68rem;">Block tuning on datasets lacking validation cleaning.</span>
                                    </div>
                                    <label class="switch-control" style="transform: scale(0.95);">
                                        <input type="checkbox" id="masking-toggle" ${enforceDataMasking ? 'checked' : ''} />
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>
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
        // Toggle residency Europe
        const euToggle = document.getElementById('residency-eu-toggle');
        if (euToggle) {
            euToggle.addEventListener('change', (e) => {
                residencyEurope = e.target.checked;
                showToast('Policy Updated', `EU Data Residency: ${residencyEurope ? 'ENFORCED' : 'DISABLED'}`, 'info');
            });
        }

        // Toggle residency Asia
        const asToggle = document.getElementById('residency-as-toggle');
        if (asToggle) {
            asToggle.addEventListener('change', (e) => {
                residencyAsia = e.target.checked;
                showToast('Policy Updated', `Asia Data Residency: ${residencyAsia ? 'ENFORCED' : 'DISABLED'}`, 'info');
            });
        }

        // Toggle data masking
        const maskToggle = document.getElementById('masking-toggle');
        if (maskToggle) {
            maskToggle.addEventListener('change', (e) => {
                enforceDataMasking = e.target.checked;
                showToast('Policy Updated', `Strict Dataset Clean Check: ${enforceDataMasking ? 'ENFORCED' : 'DISABLED'}`, 'info');
            });
        }
    };

    // Draw first view state
    render();
}
