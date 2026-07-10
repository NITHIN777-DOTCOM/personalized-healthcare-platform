export interface AIProvider {
  generateRecommendations(vitals: { steps: string; sleep: string; bloodPressure: string }): Promise<string>;
}
