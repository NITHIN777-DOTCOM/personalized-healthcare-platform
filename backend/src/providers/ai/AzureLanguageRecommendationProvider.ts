import { AIProvider } from './AIProvider';

export class AzureLanguageRecommendationProvider implements AIProvider {
  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;

  constructor() {
    this.endpoint = process.env.AZURE_AI_ENDPOINT || '';
    this.apiKey = process.env.AZURE_AI_API_KEY || '';
    this.deploymentName = process.env.AZURE_AI_DEPLOYMENT_NAME || 'gpt-4';
  }

  async generateRecommendations(vitals: { steps: string; sleep: string; bloodPressure: string }): Promise<string> {
    if (!this.endpoint || !this.apiKey) {
      console.warn('⚠️ Azure Language AI not configured. Using fallback mockup.');
      return this.getMockupResponse(vitals);
    }

    try {
      // Attempt dynamic loading of SDK if available
      try {
        const { OpenAIClient, AzureKeyCredential } = await import('@azure/openai');
        const client = new OpenAIClient(this.endpoint, new AzureKeyCredential(this.apiKey));
        const prompt = this.buildPrompt(vitals);
        const result = await client.getCompletions(this.deploymentName, [prompt], { maxTokens: 150 });
        if (result.choices && result.choices.length > 0) {
          return result.choices[0].text.trim();
        }
      } catch (sdkError) {
        // HTTP Fetch fallback if SDK is not installed or failed to load
        const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2023-05-15`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are an AI Clinical Assistant. Analyze patient vitals.' },
              { role: 'user', content: `Steps: ${vitals.steps}, Sleep: ${vitals.sleep}, BP: ${vitals.bloodPressure}` }
            ],
            max_tokens: 150
          })
        });
        const json: any = await response.json();
        if (json.choices && json.choices.length > 0) {
          return json.choices[0].message.content.trim();
        }
      }
    } catch (err) {
      console.error('❌ Azure Language Recommendation API error:', err);
    }

    return this.getMockupResponse(vitals);
  }

  private buildPrompt(vitals: any): string {
    return `You are an AI Clinical Assistant. Analyze these patient vitals and provide 3 bulleted recommendations:
    - Steps: ${vitals.steps || 'N/A'}
    - Sleep: ${vitals.sleep || 'N/A'}
    - Blood Pressure: ${vitals.bloodPressure || 'N/A'}`;
  }

  private getMockupResponse(vitals: any): string {
    return `Azure AI Recommendation (Simulation Mode):
- Steps logged: ${vitals.steps || 'N/A'}. Ensure daily cardiovascular movement stays above 7,500 steps.
- Sleep: ${vitals.sleep || 'N/A'} hours. Deep REM sleep cycle logs are key for autonomic recovery.
- Blood Pressure: ${vitals.bloodPressure || 'N/A'}. Track daily systolic parameters.`;
  }
}
