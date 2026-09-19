export interface SyntheticPatient {
  id: string;
  age: number;
  sex: 'Female' | 'Male';
  bmi: number;
  systolicBP: number;
  diastolicBP: number;
  hba1c: number;
  glucose: number;
  diabetes: boolean;
  hypertension: boolean;
  treatment: 'Standard Care' | 'Active Intervention' | 'Lifestyle';
  adherenceScore: number;
  riskCategory: 'Low' | 'Moderate' | 'High';
  quarantineStatus: 'Verified Clean' | 'Low Risk';
  trajectory: { week: number; sbp: number; glucose: number }[];
}

export function generateSyntheticCohort(
  count: number = 50,
  diabetesPct: number = 60,
  hypertensionPct: number = 70,
  femalePct: number = 50
): SyntheticPatient[] {
  const patients: SyntheticPatient[] = [];

  for (let i = 1; i <= count; i++) {
    const isFemale = (i * 17) % 100 < femalePct;
    const hasDiabetes = (i * 23 + 7) % 100 < diabetesPct;
    const hasHypertension = (i * 31 + 13) % 100 < hypertensionPct;

    // Age between 24 and 84
    const age = Math.round(35 + ((i * 13) % 46));

    // Physiological correlations: BMI higher with diabetes
    const baseBmi = 22.5 + ((i * 7) % 12);
    const bmi = Number((baseBmi + (hasDiabetes ? 4.5 : 0)).toFixed(1));

    // Blood pressure correlated with hypertension & age
    const baseSbp = 115 + (age > 60 ? 12 : 0) + (hasHypertension ? 26 : 0) + ((i * 5) % 15);
    const systolicBP = Math.round(baseSbp);
    const diastolicBP = Math.round(systolicBP * 0.62 + ((i * 3) % 8));

    // Glucose & HbA1c correlated with diabetes
    const hba1c = Number(
      (hasDiabetes ? 6.8 + ((i * 9) % 35) / 10 : 5.1 + ((i * 7) % 9) / 10).toFixed(1)
    );
    const glucose = Math.round(hasDiabetes ? 135 + ((i * 11) % 85) : 84 + ((i * 5) % 24));

    const treatmentTypes: SyntheticPatient['treatment'][] = [
      'Standard Care',
      'Active Intervention',
      'Lifestyle',
    ];
    const treatment = treatmentTypes[i % 3];
    const adherenceScore = Math.min(98, Math.max(52, Math.round(78 + ((i * 17) % 25) - (hasDiabetes ? 6 : 0))));

    let riskCategory: SyntheticPatient['riskCategory'] = 'Low';
    if (systolicBP > 145 || hba1c > 8.0) {
      riskCategory = 'High';
    } else if (systolicBP > 130 || hba1c > 6.5) {
      riskCategory = 'Moderate';
    }

    // 12-week longitudinal trajectory
    const trajectory = [
      { week: 0, sbp: systolicBP, glucose },
      { week: 4, sbp: Math.round(systolicBP - (treatment === 'Active Intervention' ? 6 : 2)), glucose: Math.round(glucose - (treatment === 'Active Intervention' ? 8 : 3)) },
      { week: 8, sbp: Math.round(systolicBP - (treatment === 'Active Intervention' ? 11 : 4)), glucose: Math.round(glucose - (treatment === 'Active Intervention' ? 14 : 5)) },
      { week: 12, sbp: Math.round(systolicBP - (treatment === 'Active Intervention' ? 15 : 6)), glucose: Math.round(glucose - (treatment === 'Active Intervention' ? 18 : 7)) },
    ];

    patients.push({
      id: `HG-SYN-${String(i).padStart(4, '0')}`,
      age,
      sex: isFemale ? 'Female' : 'Male',
      bmi,
      systolicBP,
      diastolicBP,
      hba1c,
      glucose,
      diabetes: hasDiabetes,
      hypertension: hasHypertension,
      treatment,
      adherenceScore,
      riskCategory,
      quarantineStatus: 'Verified Clean',
      trajectory,
    });
  }

  return patients;
}

export const INITIAL_SYNTHETIC_COHORT = generateSyntheticCohort(100);
