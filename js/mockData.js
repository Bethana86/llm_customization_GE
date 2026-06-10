// Mock Database Layer for Gemini Enterprise Customization Factory

export const BASE_MODELS = [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'Base Model', context: '2.0M tokens', description: 'Optimized for complex reasoning, multi-turn coding, and large document analysis.' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', type: 'Base Model', context: '1.0M tokens', description: 'Fast, lightweight model engineered for high speed, low latency, and cost efficiency.' },
    { id: 'gemini-ultra-1.0', name: 'Gemini Ultra 1.0', type: 'Base Model', context: '32k tokens', description: 'Largest capacity model for highly complex logical tasks and scientific workflows.' }
];

export const CUSTOM_MODELS_SEED = [
    { 
        id: 'gemini-1.5-pro-finance-v2', 
        name: 'Gemini 1.5 Pro - Finance Analyzer', 
        baseModel: 'Gemini 1.5 Pro', 
        tuningMethod: 'LoRA (Rank 16)', 
        dataset: 'Q1_Financial_Disclosures.jsonl',
        qualityScore: 94.6, 
        status: 'completed',
        createdDate: '2026-06-08 14:23',
        description: 'Tuned specifically on corporate balance sheets, regulatory reports, and earnings call transcripts.'
    },
    { 
        id: 'gemini-1.5-flash-legal-v1', 
        name: 'Gemini 1.5 Flash - Contract Drafter', 
        baseModel: 'Gemini 1.5 Flash', 
        tuningMethod: 'Full Tuning', 
        dataset: 'Corporate_NDA_Templates.jsonl',
        qualityScore: 91.2, 
        status: 'completed',
        createdDate: '2026-06-09 09:12',
        description: 'Optimized to write, scan, and extract liabilities from standard legal NDAs and supply-chain agreements.'
    },
    { 
        id: 'gemini-1.5-pro-medical-trial', 
        name: 'Gemini 1.5 Pro - MedScribe Assistant', 
        baseModel: 'Gemini 1.5 Pro', 
        tuningMethod: 'Distillation', 
        dataset: 'Clinical_Trial_Summaries.jsonl',
        qualityScore: 96.8, 
        status: 'completed',
        createdDate: '2026-06-10 11:45',
        description: 'Distilled knowledge model to summarize doctor-patient consultations and translate medical jargon.'
    }
];

export const DATASETS_SEED = [
    {
        id: 'ds-01',
        name: 'Corporate_Finance_QnA.jsonl',
        rows: 1450,
        tokens: '1.2M tokens',
        quality: 'Excellent',
        status: 'Cleaned',
        createdDate: '2026-06-05 10:20',
        creator: 'Sarah Chen (Finance Lead)'
    },
    {
        id: 'ds-02',
        name: 'NDA_Legal_Drafting_v3.jsonl',
        rows: 850,
        tokens: '620k tokens',
        quality: 'Good',
        status: 'Cleaned',
        createdDate: '2026-06-07 16:45',
        creator: 'Marcus Vance (Compliance)'
    },
    {
        id: 'ds-03',
        name: 'Uncleaned_Customer_Feedback.csv',
        rows: 3200,
        tokens: '450k tokens',
        quality: 'Poor (12% duplicate prompts)',
        status: 'Needs Cleaning',
        createdDate: '2026-06-10 14:10',
        creator: 'Admin Engineer'
    }
];

export const JOBS_SEED = [
    {
        id: 'job-9874',
        name: 'Fin-Tune-Pro-v2',
        baseModel: 'Gemini 1.5 Pro',
        dataset: 'Corporate_Finance_QnA.jsonl',
        tuningMethod: 'LoRA',
        epochs: 5,
        status: 'completed',
        date: '2026-06-08',
        duration: '1h 12m'
    },
    {
        id: 'job-9882',
        name: 'Legal-Draft-Flash-v1',
        baseModel: 'Gemini 1.5 Flash',
        dataset: 'NDA_Legal_Drafting_v3.jsonl',
        tuningMethod: 'Full Parameter',
        epochs: 3,
        status: 'completed',
        date: '2026-06-09',
        duration: '2h 45m'
    },
    {
        id: 'job-9889',
        name: 'MedScribe-Distil-Pro',
        baseModel: 'Gemini 1.5 Pro',
        dataset: 'Medical_Scribe_Distilled.jsonl',
        tuningMethod: 'Distillation',
        epochs: 4,
        status: 'completed',
        date: '2026-06-10',
        duration: '48m'
    }
];

export const AUDIT_TRAIL_SEED = [
    {
        time: '2026-06-10 15:40:22',
        user: 'Admin Engineer (AE)',
        action: 'CREATED_DATASET',
        target: 'Uncleaned_Customer_Feedback.csv',
        ip: '10.24.95.8',
        status: 'SUCCESS'
    },
    {
        time: '2026-06-10 11:45:10',
        user: 'Marcus Vance (MV)',
        action: 'DEPLOYED_AGENT',
        target: 'MedScribe Assistant (gemini-1.5-pro-medical-trial)',
        ip: '10.24.92.14',
        status: 'SUCCESS'
    },
    {
        time: '2026-06-09 16:30:15',
        user: 'Sarah Chen (SC)',
        action: 'EXPORTED_MODEL_API',
        target: 'gemini-1.5-pro-finance-v2 (NodeJS Key)',
        ip: '10.24.89.5',
        status: 'SUCCESS'
    },
    {
        time: '2026-06-08 13:10:00',
        user: 'Admin Engineer (AE)',
        action: 'STARTED_FINE_TUNING',
        target: 'Job Fin-Tune-Pro-v2 (LoRA)',
        ip: '10.24.95.8',
        status: 'SUCCESS'
    }
];

export const BENCHMARKS_PRESETS = {
    financial: [
        { category: 'Financial Reasoning (FinQA)', base: 72.4, tuned: 89.2 },
        { category: 'SEC Regulation Compliance', base: 64.0, tuned: 84.5 },
        { category: 'Information Extraction (Tables)', base: 80.1, tuned: 92.6 },
        { category: 'Cost-Reduction Metrics Accuracy', base: 68.3, tuned: 88.0 },
        { category: 'General Reasoning (MMLU)', base: 84.2, tuned: 82.5 } // Note: slight alignment tax is normal
    ],
    legal: [
        { category: 'Contract Liability Classification', base: 78.5, tuned: 93.4 },
        { category: 'Clause Anomaly Detection', base: 66.8, tuned: 88.2 },
        { category: 'SLA Drafting Synthesis', base: 74.2, tuned: 91.5 },
        { category: 'Legal Language Formalism', base: 81.0, tuned: 94.0 },
        { category: 'Hallucination Suppression', base: 79.5, tuned: 95.8 }
    ],
    medical: [
        { category: 'Clinical Diagnosis Summarization', base: 75.6, tuned: 96.1 },
        { category: 'Medical Entity Extraction (NER)', base: 82.3, tuned: 94.5 },
        { category: 'Contraindication Identification', base: 70.4, tuned: 93.2 },
        { category: 'Patient Consult Translation', base: 77.0, tuned: 95.0 },
        { category: 'Medical Safety Guidelines Audit', base: 85.6, tuned: 97.4 }
    ],
    general: [
        { category: 'Coding (HumanEval)', base: 74.2, tuned: 88.5 },
        { category: 'Reasoning (GSM8K)', base: 81.0, tuned: 89.4 },
        { category: 'Creative Dialogue Generation', base: 86.4, tuned: 92.1 },
        { category: 'Safety & Harmlessness Check', base: 89.0, tuned: 96.5 },
        { category: 'Context Window Utilization', base: 92.1, tuned: 94.2 }
    ]
};
