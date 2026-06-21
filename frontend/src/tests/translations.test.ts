import { describe, it, expect } from 'vitest'
import { translations, supportedLanguages, getProviderLabel, getRegionLabel, getModelLabel } from '../i18n/translations'

describe('i18n Localization Suite', () => {
  it('should support all 14 registered languages', () => {
    expect(supportedLanguages.length).toBe(14)
    expect(translations).toBeDefined()
  })

  it('should have sidebar translations for every supported language', () => {
    supportedLanguages.forEach((lang) => {
      const code = lang.value
      const langTrans = translations[code]
      expect(langTrans).toBeDefined()
      expect(langTrans.sidebar).toBeDefined()
      expect(langTrans.sidebar.dashboard).toBeDefined()
      expect(langTrans.sidebar.simulator).toBeDefined()
      expect(langTrans.sidebar.copilot).toBeDefined()
    })
  })

  it('should translate Cloud Provider regions and models correctly', () => {
    // English defaults
    expect(translations['en'].sidebar.dashboard).toBe('Dashboard')
    expect(translations['es'].sidebar.dashboard).toBe('Tablero')
    expect(translations['fr'].sidebar.dashboard).toBe('Tableau de Bord')
  })

  it('should map provider labels correctly across locales', () => {
    expect(getProviderLabel('gcp', 'en')).toBe('Google Cloud Platform (GCP)')
    expect(getProviderLabel('onprem', 'es')).toBe('En las instalaciones / Nube privada')
    expect(getProviderLabel('aws', 'kn')).toBe('ಅಮೆಜಾನ್ ವೆಬ್ ಸರ್ವೀಸಸ್ (AWS)')
    expect(getProviderLabel('azure', 'ta')).toBe('மைக்ரோசாப்ட் அஸூர் (Azure)')
    expect(getProviderLabel('unknown', 'en')).toBe('unknown')
  })

  it('should map region labels correctly across locales', () => {
    expect(getRegionLabel('us-central1', 'en')).toBe('us-central1 (Iowa) - Grid Average (400g/kWh)')
    expect(getRegionLabel('swedencentral', 'es')).toBe('swedencentral (Suecia) - 100% Hidro/Nuclear (10g/kWh)')
    expect(getRegionLabel('europe-west4', 'fr')).toBe('europe-west4 (Eemshaven) - CFE Match (50g/kWh)')
    expect(getRegionLabel('unknown-region', 'en')).toBe('unknown-region')
  })

  it('should map model labels correctly across locales', () => {
    expect(getModelLabel('gemini-1.5-flash', 'en')).toBe('Gemini 1.5 Flash (Lightweight / energy efficient)')
    expect(getModelLabel('gpt-4o', 'es')).toBe('GPT-4o (Inteligencia omni / alta potencia)')
    expect(getModelLabel('unknown-model', 'en')).toBe('unknown-model')
  })
})
