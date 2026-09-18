import { TemporalTrajectoryPoint } from '../../types';

export const DEMO_LONGITUDINAL_TRAJECTORY: TemporalTrajectoryPoint[] = [
  {
    week: 0,
    realSBPMean: 132.8,
    syntheticSBPMean: 133.4,
    baselineCopulaSBPMean: 133.0,
    syntheticSBPMin: 104,
    syntheticSBPMax: 168,
    adherenceRate: 94.2,
    retentionRate: 100.0,
    dropoutPct: 0.0,
  },
  {
    week: 2,
    realSBPMean: 130.4,
    syntheticSBPMean: 131.1,
    baselineCopulaSBPMean: 132.8,
    syntheticSBPMin: 102,
    syntheticSBPMax: 165,
    adherenceRate: 88.5,
    retentionRate: 98.2,
    dropoutPct: 1.8,
  },
  {
    week: 4,
    realSBPMean: 127.2,
    syntheticSBPMean: 128.0,
    baselineCopulaSBPMean: 132.9,
    syntheticSBPMin: 98,
    syntheticSBPMax: 161,
    adherenceRate: 81.3,
    retentionRate: 94.6,
    dropoutPct: 5.4,
  },
  {
    week: 8,
    realSBPMean: 124.9,
    syntheticSBPMean: 125.6,
    baselineCopulaSBPMean: 132.7, // Baseline failed to model treatment response
    syntheticSBPMin: 95,
    syntheticSBPMax: 158,
    adherenceRate: 76.1,
    retentionRate: 89.4,
    dropoutPct: 10.6,
  },
  {
    week: 12,
    realSBPMean: 123.5,
    syntheticSBPMean: 124.1,
    baselineCopulaSBPMean: 132.5,
    syntheticSBPMin: 94,
    syntheticSBPMax: 156,
    adherenceRate: 72.8,
    retentionRate: 84.1,
    dropoutPct: 15.9,
  },
];

export interface AdherenceStateDistribution {
  week: string;
  adherentPct: number;
  lapsingPct: number;
  droppedPct: number;
}

export const DEMO_ADHERENCE_MARKOV_STATES: AdherenceStateDistribution[] = [
  { week: 'Week 0', adherentPct: 92, lapsingPct: 8, droppedPct: 0 },
  { week: 'Week 2', adherentPct: 84, lapsingPct: 14, droppedPct: 2 },
  { week: 'Week 4', adherentPct: 75, lapsingPct: 19, droppedPct: 6 },
  { week: 'Week 8', adherentPct: 68, lapsingPct: 21, droppedPct: 11 },
  { week: 'Week 12', adherentPct: 62, lapsingPct: 22, droppedPct: 16 },
];

export const DEMO_MNAR_DROPOUT_DATA = [
  { subgroup: 'Normal SBP (<130) + Low Pain', realDropout: 8.2, syntheticDropout: 8.6 },
  { subgroup: 'Stage 1 HTN (130-139)', realDropout: 12.4, syntheticDropout: 13.0 },
  { subgroup: 'Stage 2 HTN (140+) + High Pain', realDropout: 24.8, syntheticDropout: 23.9 },
  { subgroup: 'Comorbid Diabetic (HbA1c > 8.0)', realDropout: 19.5, syntheticDropout: 18.7 },
];
