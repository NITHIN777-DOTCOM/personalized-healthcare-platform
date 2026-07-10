import { AIProvider } from './AIProvider';

export class LocalRecommendationProvider implements AIProvider {
  async generateRecommendations(vitals: { steps: string; sleep: string; bloodPressure: string }): Promise<string> {
    const steps = parseInt(vitals.steps) || 0;
    const sleep = parseFloat(vitals.sleep) || 0;
    const bp = vitals.bloodPressure || '';

    const tips: string[] = [];
    if (steps > 0 && steps < 7000) {
      tips.push('Increase physical mobility to at least 7,000 steps daily to support heart strength.');
    }
    if (sleep > 0 && sleep < 7) {
      tips.push('Aim for 7-8 hours of sleep to improve cognitive and physical recovery.');
    }
    if (bp) {
      const parts = bp.split('/');
      if (parts.length === 2) {
        const systolic = parseInt(parts[0]);
        const diastolic = parseInt(parts[1]);
        if (systolic > 130 || diastolic > 80) {
          tips.push('Systolic or Diastolic BP is elevated. Consider dietary sodium restriction.');
        }
      }
    }
    if (tips.length === 0) {
      tips.push('All bio-vitals are within standard optimal thresholds. Maintain active routine.');
    }

    return `Local Clinician Rulebase Recommendations:\n- ${tips.join('\n- ')}`;
  }
}
