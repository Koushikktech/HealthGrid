import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, MainNavSection } from './components/common/Sidebar';
import { OverviewPage } from './components/views/OverviewPage';
import { DatasetProfilePage } from './components/views/DatasetProfilePage';
import { GuidedGeneratorFlow } from './components/views/GuidedGeneratorFlow';

import { CohortBuilderPage } from './components/views/CohortBuilderPage';
import { GenerationRunsPage } from './components/views/GenerationRunsPage';
import { ValidationPage } from './components/views/ValidationPage';
import { PrivacyPage } from './components/views/PrivacyPage';
import { CohortPassportPage } from './components/views/CohortPassportPage';
import { ExportsPage } from './components/views/ExportsPage';
import { ComplianceNotesModal } from './components/common/ComplianceNotesModal';
import { LandingPageModal } from './components/common/LandingPageModal';
import { apiClient, AppDataSourceMode } from './services/api/apiClient';
import { datasetService } from './services/api/datasetService';
import { generationService } from './services/api/generationService';
import { validationService } from './services/api/validationService';
import {
  DatasetSummary,
  ColumnSchema,
  GenerationRun,
  CohortConfiguration,
  FullValidationReport
} from './types';

export function App() {
  const [currentSection, setCurrentSection] = useState<MainNavSection>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dataMode, setDataMode] = useState<AppDataSourceMode>(apiClient.getMode());

  // Modals state

  const [complianceModalOpen, setComplianceModalOpen] = useState(false);
  const [landingModalOpen, setLandingModalOpen] = useState(false);

  // Data states
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [viewingProfileDatasetId, setViewingProfileDatasetId] = useState<string | null>(null);
  const [activeSchema, setActiveSchema] = useState<ColumnSchema[]>([]);

  const [runs, setRuns] = useState<GenerationRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string>('');
  const [validationReport, setValidationReport] = useState<FullValidationReport | null>(null);
  const activeRunIdRef = useRef(activeRunId);
  const pollingRunIdsRef = useRef(new Set<string>());

  function pollLiveRun(runId: string) {
    if (pollingRunIdsRef.current.has(runId)) return;
    pollingRunIdsRef.current.add(runId);
    generationService.pollRunUntilComplete(runId, (updated) => {
      setRuns((prev) => prev.map((run) => (run.runId === updated.runId ? updated : run)));
    }).then(async (completedRun) => {
      if (completedRun?.status === 'Validated') {
        const valRes = await validationService.getValidationReport(completedRun.runId);
        if (activeRunIdRef.current === completedRun.runId) {
          validationService.setActiveRun(completedRun.runId);
          setValidationReport(valRes.report);
        }
      }
    }).catch((error) => console.error(`Unable to poll run ${runId}.`, error))
      .finally(() => pollingRunIdsRef.current.delete(runId));
  }

  useEffect(() => apiClient.onModeChange(setDataMode), []);

  useEffect(() => {
    let cancelled = false;
    datasetService.getDatasets().then((res) => {
      if (cancelled) return;
      setDatasets(res.datasets);
      setSelectedDatasetId((current) => {
        const currentDataset = res.datasets.find((item) => item.id === current);
        if (currentDataset?.status === 'Ready') return current;
        return res.datasets.find((item) => item.status === 'Ready')?.id || '';
      });
    }).catch((error) => console.error('Unable to load datasets.', error));
    return () => { cancelled = true; };
  }, [dataMode]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedDatasetId) {
      setActiveSchema([]);
      return () => { cancelled = true; };
    }
    datasetService.getDatasetById(selectedDatasetId).then((res) => {
      if (!cancelled) {
        setActiveSchema(res.schema || []);
        if (res.dataset) {
          setDatasets((current) => current.map((item) => item.id === res.dataset!.id ? res.dataset! : item));
        }
      }
    }).catch((error) => {
      if (!cancelled) setActiveSchema([]);
      console.error('Unable to load dataset profile.', error);
    });
    return () => { cancelled = true; };
  }, [selectedDatasetId, dataMode]);

  useEffect(() => {
    let cancelled = false;
    generationService.getRuns().then((res) => {
      if (cancelled) return;
      setRuns(res.runs);
      setActiveRunId((current) =>
        res.runs.some((item) => item.runId === current) ? current : res.runs[0]?.runId || ''
      );
      if (dataMode === 'connected_api') {
        res.runs
          .filter((run) => run.status === 'Generating' || run.status === 'Queued')
          .forEach((run) => pollLiveRun(run.runId));
      }
    }).catch((error) => console.error('Unable to load generation runs.', error));
    return () => { cancelled = true; };
  }, [dataMode]);

  useEffect(() => {
    activeRunIdRef.current = activeRunId;
    validationService.setActiveRun(activeRunId || null);
    let cancelled = false;
    setValidationReport(null);
    if (activeRunId) {
      validationService.getValidationReport(activeRunId).then((res) => {
        if (!cancelled && activeRunIdRef.current === activeRunId) {
          validationService.setActiveRun(activeRunId);
          setValidationReport(res.report);
        }
      }).catch((error) => {
        if (!cancelled) setValidationReport(null);
        console.error('Unable to load validation results.', error);
      });
    }
    return () => { cancelled = true; };
  }, [activeRunId]);

  const currentDataset = datasets.find((d) => d.id === selectedDatasetId)
    || datasets.find((d) => d.status === 'Ready')
    || null;
  const activeRun = runs.find((r) => r.runId === activeRunId) || null;

  // Handlers
  const handleInspectProfile = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    datasetService.getDatasetById(datasetId).then((res) => {
      setActiveSchema(res.schema);
      setViewingProfileDatasetId(datasetId);
    });
  };

  const handleBuildCohort = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setViewingProfileDatasetId(null);
    setCurrentSection('generate_dataset');
  };


  const handleStartGeneration = async (
    config: CohortConfiguration,
    sourceDatasetId: string,
    onProgress: (progress: { progress: number; stage?: string; message?: string }) => void
  ) => {
    const sourceDataset = datasets.find((item) => item.id === (sourceDatasetId || selectedDatasetId));
    if (!sourceDataset || sourceDataset.status !== 'Ready') {
      throw new Error('Upload or select a dataset that has passed backend schema validation.');
    }
    const datasetId = sourceDataset.id;
    const res = await generationService.startGeneration(config, datasetId);
    const initialRun: GenerationRun = {
      runId: res.runId,
      datasetName: sourceDataset.name,
      patientCount: config.targetPatients,
      model:
        config.modelType === 'causal_generator'
          ? 'HealthGrid SCM Generator (+ Copula Baseline)'
          : 'Gaussian Copula Baseline',
      createdAt: 'Just now',
      status: 'Generating',
      progress: 10,
      stage: 'profiling',
      message: 'Profiling training distribution...',
      executionTimeSec: null,
      cohortConfig: config,
    };

    setRuns((prev) => [initialRun, ...prev.filter((r) => r.runId !== res.runId)]);
    activeRunIdRef.current = res.runId;
    setActiveRunId(res.runId);
    onProgress({ progress: 10, stage: 'queued', message: initialRun.message });

    if (res.isLive) {
      pollingRunIdsRef.current.add(res.runId);
      try {
        const completedRun = await generationService.pollRunUntilComplete(res.runId, (updated) => {
          setRuns((prev) => prev.map((run) => run.runId === updated.runId ? updated : run));
          onProgress({ progress: updated.progress ?? 0, stage: updated.stage, message: updated.message });
        });
        if (!completedRun) throw new Error('Lost connection while polling the generation run.');
        if (completedRun.status === 'Failed') throw new Error(completedRun.message || 'Generation failed.');
        const valRes = await validationService.getValidationReport(completedRun.runId);
        validationService.setActiveRun(completedRun.runId);
        setValidationReport(valRes.report);
      } finally {
        pollingRunIdsRef.current.delete(res.runId);
      }
    } else {
      const stages = [
        { progress: 30, stage: 'fitting', message: 'Fitting physiological DAG priors...' },
        { progress: 65, stage: 'generating', message: `Forward-sampling ${config.targetPatients.toLocaleString()} synthetic patients...` },
        { progress: 85, stage: 'validating', message: 'Running holdout fidelity, utility and privacy evidence...' },
        { progress: 100, stage: 'completed', message: 'Run completed. Passport generated.' },
      ];
      for (const stage of stages) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        onProgress(stage);
        setRuns((prev) => prev.map((run) => run.runId === res.runId ? {
          ...run,
          ...stage,
          status: stage.stage === 'completed' ? 'Validated' : 'Generating',
        } : run));
      }
      const valRes = await validationService.getValidationReport(res.runId);
      validationService.setActiveRun(res.runId);
      setValidationReport(valRes.report);
    }
  };

  const selectGuidedDataset = async (datasetId: string): Promise<DatasetSummary> => {
    const [list, profile] = await Promise.all([
      datasetService.getDatasets(),
      datasetService.getDatasetById(datasetId),
    ]);
    if (!profile.dataset || profile.dataset.status !== 'Ready') {
      throw new Error('Dataset has blocking schema or data-quality issues.');
    }
    setDatasets(list.datasets);
    setSelectedDatasetId(datasetId);
    setActiveSchema(profile.schema);
    return profile.dataset;
  };

  const handleGuidedUpload = async (file: File): Promise<DatasetSummary> => {
    const uploaded = await datasetService.uploadDataset(file);
    return selectGuidedDataset(uploaded.datasetId);
  };

  const handleGuidedDemo = async (): Promise<DatasetSummary> => {
    const loaded = await datasetService.loadDemoDataset();
    return selectGuidedDataset(loaded.dataset.id);
  };

  return (
    <div className="min-h-screen ambient-mesh flex flex-col text-slate-900 dark:text-slate-100 antialiased font-sans relative selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950">
      {/* Top Application Header */}
      <Header
        onOpenOverview={() => {
          setViewingProfileDatasetId(null);
          setCurrentSection('overview');
        }}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />

      {/* Collapsible Slide-over Navigation Drawer */}
      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setViewingProfileDatasetId(null);
          setCurrentSection(sec);
        }}
        onOpenComplianceNotes={() => setComplianceModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 relative z-10">
        {(['validation', 'privacy', 'cohort_passport', 'exports'] as MainNavSection[]).includes(currentSection) && (
          <div className="mb-6 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/30 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400">Current evidence context</div>
              {activeRun ? (
                <div className="text-xs text-slate-700 dark:text-slate-200 mt-1">
                  <strong>{activeRun.model}</strong> · {activeRun.patientCount.toLocaleString()} patients · {activeRun.datasetName}
                </div>
              ) : (
                <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">Select a completed run to view its evidence.</div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={activeRunId}
                onChange={(event) => setActiveRunId(event.target.value)}
                className="max-w-sm rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono"
                aria-label="Select active evidence run"
              >
                <option value="">Select completed run…</option>
                {runs.filter((run) => run.status === 'Validated').map((run) => (
                  <option key={run.runId} value={run.runId}>
                    {run.runId.slice(0, 8)} · {run.model} · {run.patientCount.toLocaleString()} patients
                  </option>
                ))}
              </select>
              <button
                onClick={() => setCurrentSection('generation_runs')}
                className="rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300"
              >
                All runs
              </button>
            </div>
          </div>
        )}

        {/* If viewing a specific dataset profile */}
        {viewingProfileDatasetId && currentDataset ? (
          <DatasetProfilePage
            dataset={currentDataset}
            schema={activeSchema}
            onBack={() => setViewingProfileDatasetId(null)}
            onBuildCohort={handleBuildCohort}
          />
        ) : (
          <>
            {currentSection === 'overview' && (
              <OverviewPage
                dataset={currentDataset}
                validationReport={validationReport}
                onNavigate={(sec) => setCurrentSection(sec)}
                isDemoMode={dataMode === 'demo_preview'}
              />
            )}

            {currentSection === 'generate_dataset' && (
              <GuidedGeneratorFlow
                dataset={currentDataset?.status === 'Ready' ? currentDataset : null}
                onUploadDataset={handleGuidedUpload}
                onLoadDemoDataset={handleGuidedDemo}
                onStartRun={handleStartGeneration}
                onNavigateToValidation={() => setCurrentSection('validation')}
                onNavigateToPassport={() => setCurrentSection('cohort_passport')}
                validationReport={validationReport}
                activeRunId={activeRunId}
                isDemoMode={dataMode === 'demo_preview'}
              />
            )}

            {currentSection === 'generation_runs' && (
              <GenerationRunsPage
                runs={runs}
                activeRun={activeRun}
                onReviewValidation={(runId) => {
                  if (runId) setActiveRunId(runId);
                  setCurrentSection('validation');
                }}
                onViewPassport={(runId) => {
                  if (runId) setActiveRunId(runId);
                  setCurrentSection('cohort_passport');
                }}
                onNewCohort={() => setCurrentSection('generate_dataset')}
              />
            )}

            {currentSection === 'validation' && (
              <ValidationPage
                report={validationReport}
                onNavigateToPassport={() => setCurrentSection('cohort_passport')}
                onNavigateToPrivacy={() => setCurrentSection('privacy')}
                isDemoMode={dataMode === 'demo_preview'}
              />
            )}

            {currentSection === 'privacy' && validationReport && (
              <PrivacyPage
                privacy={validationReport.privacy}
                onOpenComplianceNotes={() => setComplianceModalOpen(true)}
                isDemoMode={dataMode === 'demo_preview'}
              />
            )}

            {currentSection === 'cohort_passport' && (
              <CohortPassportPage
                runId={activeRunId}
                validationReport={validationReport}
                isDemoMode={dataMode === 'demo_preview'}
                onBack={() => setCurrentSection('overview')}
              />
            )}

            {currentSection === 'exports' && (
              <ExportsPage
                runId={activeRunId}
                onViewPassport={() => setCurrentSection('cohort_passport')}
                isDemoMode={dataMode === 'demo_preview'}
              />
            )}
          </>
        )}
      </main>


      {/* Compliance & Research Notes Modal */}
      <ComplianceNotesModal
        isOpen={complianceModalOpen}
        onClose={() => setComplianceModalOpen(false)}
      />

      {/* Minimal Product Landing Page Modal */}
      <LandingPageModal
        isOpen={landingModalOpen}
        onClose={() => setLandingModalOpen(false)}
        onStartCohort={() => {
          setViewingProfileDatasetId(null);
          setCurrentSection('generate_dataset');
        }}
        onExploreWorkflow={() => {
          setViewingProfileDatasetId(null);
          setCurrentSection('validation');
        }}
      />
    </div>
  );
}

export default App;
