import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, MainNavSection } from './components/common/Sidebar';
import { OverviewPage } from './components/views/OverviewPage';
import { DatasetsPage } from './components/views/DatasetsPage';
import { DatasetProfilePage } from './components/views/DatasetProfilePage';
import { UploadDatasetModal } from './components/views/UploadDatasetModal';
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
  const [currentProject, setCurrentProject] = useState<string>('Cardiometabolic Study 2026');
  const [dataMode, setDataMode] = useState<AppDataSourceMode>(apiClient.getMode());

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [complianceModalOpen, setComplianceModalOpen] = useState(false);
  const [landingModalOpen, setLandingModalOpen] = useState(false);

  // Data states
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('ds-clinical-001');
  const [viewingProfileDatasetId, setViewingProfileDatasetId] = useState<string | null>(null);
  const [activeSchema, setActiveSchema] = useState<ColumnSchema[]>([]);

  const [runs, setRuns] = useState<GenerationRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string>('HG-2026-001');
  const [validationReport, setValidationReport] = useState<FullValidationReport | null>(null);

  // Initialize data from services
  useEffect(() => {
    datasetService.getDatasets().then((res) => {
      setDatasets(res.datasets);
    });

    datasetService.getDatasetById(selectedDatasetId).then((res) => {
      if (res.schema) setActiveSchema(res.schema);
    });

    generationService.getRuns().then((res) => {
      setRuns(res.runs);
      if (res.runs.length > 0) {
        setActiveRunId(res.runs[0].runId);
      }
    });

    validationService.getValidationReport('HG-2026-001').then((res) => {
      setValidationReport(res.report);
    });

    return apiClient.onModeChange((mode) => {
      setDataMode(mode);
    });
  }, [selectedDatasetId]);

  const currentDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0] || null;
  const activeRun = runs.find((r) => r.runId === activeRunId) || runs[0] || null;

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
    setCurrentSection('cohort_builder');
  };

  const handleStartGeneration = async (config: CohortConfiguration) => {
    const res = await generationService.startGeneration(config);
    const newRun: GenerationRun = {
      runId: res.runId,
      datasetName: currentDataset ? currentDataset.name : 'Cardiometabolic Study',
      patientCount: config.targetPatients,
      model:
        config.modelType === 'causal_generator'
          ? 'HealthGrid Causal Generator'
          : 'Gaussian Copula Baseline',
      createdAt: 'Just now',
      status: 'Validated',
      executionTimeSec: 8.1,
      cohortConfig: config,
    };

    setRuns([newRun, ...runs]);
    setActiveRunId(newRun.runId);
    setCurrentSection('generation_runs');
  };

  const handleUploadSuccess = (newDatasetId: string) => {
    datasetService.getDatasets().then((res) => {
      setDatasets(res.datasets);
      handleInspectProfile(newDatasetId);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      {/* Top Application Header */}
      <Header
        currentProject={currentProject}
        onSelectProject={(proj) => setCurrentProject(proj)}
        onOpenLanding={() => setLandingModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(sec) => {
            setViewingProfileDatasetId(null);
            setCurrentSection(sec);
          }}
          onOpenComplianceNotes={() => setComplianceModalOpen(true)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0">
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
                  onOpenUpload={() => setUploadModalOpen(true)}
                  isDemoMode={dataMode === 'demo_preview'}
                />
              )}

              {currentSection === 'datasets' && (
                <DatasetsPage
                  datasets={datasets}
                  onOpenUpload={() => setUploadModalOpen(true)}
                  onInspectProfile={handleInspectProfile}
                  onBuildCohort={handleBuildCohort}
                />
              )}

              {currentSection === 'cohort_builder' && currentDataset && (
                <CohortBuilderPage
                  dataset={currentDataset}
                  onStartRun={handleStartGeneration}
                />
              )}

              {currentSection === 'generation_runs' && (
                <GenerationRunsPage
                  runs={runs}
                  activeRun={activeRun}
                  onReviewValidation={() => setCurrentSection('validation')}
                  onViewPassport={() => setCurrentSection('cohort_passport')}
                  onNewCohort={() => setCurrentSection('cohort_builder')}
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
      </div>

      {/* Upload Dataset Modal */}
      <UploadDatasetModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

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
          setCurrentSection('cohort_builder');
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
