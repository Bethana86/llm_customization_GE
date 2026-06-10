// Main Application Coordinator & State Manager
import { DATASETS_SEED, CUSTOM_MODELS_SEED, JOBS_SEED, AUDIT_TRAIL_SEED } from './mockData.js';
import { initDashboard, destroyDashboard } from './viewDashboard.js';
import { initDatasets } from './viewDatasets.js';
import { initTraining, destroyTraining } from './viewTraining.js';
import { initPlayground, destroyPlayground } from './viewPlayground.js';
import { initEvaluation } from './viewEvaluation.js';
import { initAgents } from './viewAgents.js';
import { initGovernance } from './viewGovernance.js';

// Global App State
export const AppState = {
    datasets: [...DATASETS_SEED],
    customModels: [...CUSTOM_MODELS_SEED],
    jobs: [...JOBS_SEED],
    auditTrail: [...AUDIT_TRAIL_SEED],
    activeView: 'dashboard',
    playgroundModelId: 'gemini-1.5-pro-finance-v2',
    evaluationBaseId: 'gemini-1.5-pro',
    evaluationTunedId: 'gemini-1.5-pro-finance-v2'
};

// View Registrar Mapping
const views = {
    dashboard: {
        title: 'Operations Hub',
        init: initDashboard,
        destroy: destroyDashboard
    },
    datasets: {
        title: 'Dataset Factory',
        init: initDatasets
    },
    training: {
        title: 'Tuning & Distillation',
        init: initTraining,
        destroy: destroyTraining
    },
    playground: {
        title: 'Prompt Sandbox',
        init: initPlayground,
        destroy: destroyPlayground
    },
    evaluation: {
        title: 'Evaluation Matrix',
        init: initEvaluation
    },
    agents: {
        title: 'Agent Publisher',
        init: initAgents
    },
    governance: {
        title: 'Governance & Auditing',
        init: initGovernance
    }
};

// Initialize the Application
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    switchView('dashboard');
    showToast('Factory Ready', 'Platform workspace loaded successfully.', 'success');
});

// Setup sidebar event handling
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetView = btn.getAttribute('data-view');
            switchView(targetView);
        });
    });
}

// Switch View Engine
export function switchView(viewName) {
    if (!views[viewName]) return;

    // Call teardown for active view if exists
    const currentActiveView = views[AppState.activeView];
    if (currentActiveView && currentActiveView.destroy) {
        currentActiveView.destroy();
    }

    // Update state
    AppState.activeView = viewName;

    // Update UI Active Sidebar Class
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-view') === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update Header breadcrumb
    const headerTitle = document.getElementById('current-view-title');
    if (headerTitle) {
        headerTitle.textContent = views[viewName].title;
    }

    // Reset Viewport container
    const viewport = document.getElementById('viewport');
    viewport.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading view...</p>
        </div>
    `;

    // Initialize View template
    setTimeout(() => {
        viewport.innerHTML = ''; // Clear loading
        views[viewName].init(viewport);
    }, 150);
}

// Toast Notification System
export function showToast(title, desc, type = 'info') {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon selection
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" /></svg>`;
    } else if (type === 'warning') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" /></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>`;
    } else {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>`;
    }

    toast.innerHTML = `
        <div style="margin-top: 2px;">${iconSvg}</div>
        <div class="toast-body">
            <span class="toast-title">${title}</span>
            <span class="toast-desc">${desc}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;

    // Close listener
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
        setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
            setTimeout(() => toast.remove(), 250);
        }
    }, 4000);
}

// Modal Control System
export function showModal(title, bodyHtml, footerHtml = '', onClose = null) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-title">${title}</span>
                <button class="modal-close" id="modal-btn-close">&times;</button>
            </div>
            <div class="modal-body">
                ${bodyHtml}
            </div>
            ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
        </div>
    `;

    modalContainer.classList.remove('hidden');

    const closeBtn = document.getElementById('modal-btn-close');
    const dismissModal = () => {
        modalContainer.classList.add('hidden');
        if (onClose) onClose();
    };

    closeBtn.addEventListener('click', dismissModal);
    
    // Close on overlay click
    modalContainer.onclick = (e) => {
        if (e.target === modalContainer) dismissModal();
    };
}

export function hideModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) modalContainer.classList.add('hidden');
}

// Global Audit logger helper
export function addAuditLog(action, target, status = 'SUCCESS') {
    const userStr = 'Admin Engineer (AE)';
    const ipStr = '10.24.95.8';
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    AppState.auditTrail.unshift({
        time: timeStr,
        user: userStr,
        action: action,
        target: target,
        ip: ipStr,
        status: status
    });
}
