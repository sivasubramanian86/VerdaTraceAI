export interface TranslationKeys {
  [key: string]: any;
}

export interface TranslationSchema {
  sidebar: TranslationKeys;
  dashboard: TranslationSchemaDashboard;
  agentPipeline: TranslationSchemaAgentPipeline;
  simulator: TranslationSchemaSimulator;
  recommendations: TranslationSchemaRecommendations;
  lifestyle: TranslationSchemaLifestyle;
  digital: TranslationSchemaDigital;
  commerce: TranslationSchemaCommerce;
  food: TranslationSchemaFood;
  transit: TranslationSchemaTransit;
  circular: TranslationSchemaCircular;
  copilot: TranslationSchemaCopilot;
  judge: TranslationSchemaJudge;
}

export interface TranslationSchemaDashboard {
  title: string;
  subtitle: string;
  greenScore: string;
  targetMet: string;
  workspaceCo2: string;
  vsLastMonth: string;
  totalPower: string;
  loadEq: string;
  waterFootprint: string;
  coolingUsage: string;
  forestOcean: string;
  trees: string;
  treeMo: string;
  ocean: string;
  sqm: string;
  offsetTargets: string;
  uncertaintyTitle: string;
  verifiedTelemetry: string;
  hybridTelemetry: string;
  staticAverage: string;
  uncertaintyDesc: string;
  errorMargin: string;
  uncertaintyTip: string;
  waterStressTitle: string;
  lowStress: string;
  mediumStress: string;
  highStress: string;
  waterStressDesc: string;
  coolingEfficiency: string;
  evaporativeCooling: string;
  hybridCooling: string;
  zeroWaterCooling: string;
  ecoCategory: string;
  aridRisk: string;
  sustainableLoop: string;
  waterStressTip: string;
  aiEquivalentsTitle: string;
  aiEquivalentsDesc: string;
  carDistance: string;
  kmDriven: string;
  dietFootprint: string;
  beefMeals: string;
  utilities: string;
  monthsElectricity: string;
  ledgerTitle: string;
  ledgerSub: string;
  tabTrends: string;
  tabLedger: string;
  tabPareto: string;
  trendChartTitle: string;
  week1: string;
  week2: string;
  week3: string;
  week4: string;
  auditTrailTitle: string;
  ledgerHeight: string;
  heightCol: string;
  timestampCol: string;
  actionCol: string;
  hashCol: string;
  statusCol: string;
  verifiedBadge: string;
  auditStandardTip: string;
  paretoTitle: string;
  yAxisLabel: string;
  xAxisLabel: string;
  frontLabel: string;
  swedenNode: string;
  oregonNode: string;
  iowaNode: string;
  virginiaNode: string;
  paretoExplainTitle: string;
  paretoExplainDesc: string;
  optimalZonesTip: string;
}

export interface TranslationSchemaAgentPipeline {
  title: string;
  subtitle: string;
  stateLabel: string;
  orchestrator: string;
  orchestratorDesc: string;
  ingestion: string;
  ingestionDesc: string;
  estimation: string;
  estimationDesc: string;
  optimizer: string;
  optimizerDesc: string;
  rag: string;
  ragDesc: string;
  guardrail: string;
  guardrailDesc: string;
}

export interface TranslationSchemaSimulator {
  title: string;
  subtitle: string;
  ingestTitle: string;
  ingestDesc: string;
  placeholder: string;
  presetBtn: string;
  parseBtn: string;
  parsing: string;
  sectionAi: string;
  providerLabel: string;
  workloadReqs: string;
  regionLabel: string;
  modelLabel: string;
  runHour: string;
  peakGreen: string;
  gridBase: string;
  cachingLabel: string;
  sectionLifestyle: string;
  localPurchase: string;
  logisticsSaved: string;
  transitShift: string;
  transitSavings: string;
  circularNeigh: string;
  avoidedEmbedded: string;
  outputTitle: string;
  outputSub: string;
  netFootprint: string;
  projectedCredits: string;
  computePower: string;
  waterFootprint: string;
  waterScarcity: string;
  ecoEquiv: string;
  treeMonths: string;
  seagrassSqm: string;
  optimizerNote: string;
  primaryActive: string;
  genericAverage: string;
  stress: string;
}

export interface TranslationSchemaRecommendations {
  title: string;
  subtitle: string;
  activeCommit: string;
  carbonSaved: string;
  maccTitle: string;
  maccDesc: string;
  costNetPos: string;
  awsShift: string;
  azureShift: string;
  gcpShift: string;
  modelDown: string;
  semCache: string;
  offPeak: string;
  lowComp: string;
  medComp: string;
  highComp: string;
  co2Impact: string;
  explainBtn: string;
  committedBtn: string;
  commitBtn: string;
  tooltipRegion: string;
  tooltipCache: string;
  tooltipModel: string;
  tooltipSched: string;
}

export interface TranslationSchemaLifestyle {
  title: string;
  subtitle: string;
  inputHabits: string;
  travelHeader: string;
  annualDist: string;
  primaryFuel: string;
  optionGasCar: string;
  optionEV: string;
  optionNoCar: string;
  foodHeader: string;
  primaryDiet: string;
  optionHeavyMeat: string;
  optionAverageDiet: string;
  optionVegetarian: string;
  optionVegan: string;
  energyHeader: string;
  yearlyElectricity: string;
  heatingUtility: string;
  optionGasBoiler: string;
  optionHeatPump: string;
  optionSolarThermal: string;
  mindfulConsumption: string;
  shoppingProfile: string;
  optionLowShop: string;
  optionMedShop: string;
  optionHighShop: string;
  recycleLabel: string;
  pledgesTitle: string;
  pledgesSubtitle: string;
  pledgeEvTitle: string;
  pledgeEvDesc: string;
  pledgeSolarTitle: string;
  pledgeSolarDesc: string;
  pledgeVegTitle: string;
  pledgeVegDesc: string;
  pledgeWasteTitle: string;
  pledgeWasteDesc: string;
  rankTitle: string;
  totalFootprintLabel: string;
  savingsLabel: string;
  canvasTitle: string;
  canvasSubtitle: string;
  terrestrialForest: string;
  oceanSeagrass: string;
  emptyForest: string;
  emptySeagrass: string;
  treesLabel: string;
  seagrassLabel: string;
  aiVsRealTitle: string;
  aiVsRealDesc: string;
  annualAiFootprint: string;
  simulatorProjections: string;
  matchesEquivalent: string;
  gasCarDriving: string;
  beefHeavyMeals: string;
  homeElectricity: string;
  months: string;
  insightText: string;
  rankGuardianName: string;
  rankGuardianDesc: string;
  rankEnthusiastName: string;
  rankEnthusiastDesc: string;
  rankAverageName: string;
  rankAverageDesc: string;
  rankHeavyName: string;
  rankHeavyDesc: string;
}

export interface TranslationSchemaDigital {
  title: string;
  subtitle: string;
  cardTitle: string;
  emails: string;
  cloud: string;
  duplicates: string;
  aiUsage: string;
  totalCo2: string;
  missionsTitle: string;
  cleanUp: string;
  completed: string;
}

export interface TranslationSchemaCommerce {
  title: string;
  subtitle: string;
  formTitle: string;
  storeName: string;
  location: string;
  amount: string;
  submit: string;
  ledgerTitle: string;
  local: string;
  imported: string;
  savings: string;
  credits: string;
}

export interface TranslationSchemaFood {
  title: string;
  subtitle: string;
  scanTitle: string;
  prodLabel: string;
  originLabel: string;
  scanBtn: string;
  historyTitle: string;
  swapSuggested: string;
  localPerfect: string;
  distance: string;
  impact: string;
  swapAction: string;
  co2Kg: string;
}

export interface TranslationSchemaTransit {
  title: string;
  subtitle: string;
  tripForm: string;
  mode: string;
  distance: string;
  logBtn: string;
  history: string;
  mapTitle: string;
  mapTip: string;
  submitFeedback: string;
  descLabel: string;
  issueLabel: string;
  submitBtn: string;
  evLabel: string;
  bikeLabel: string;
  pedLabel: string;
}

export interface TranslationSchemaCircular {
  title: string;
  subtitle: string;
  formTitle: string;
  itemName: string;
  owner: string;
  action: string;
  submit: string;
  listingsTitle: string;
  available: string;
  borrowed: string;
  borrowAction: string;
  offsetTitle: string;
  co2Kg: string;
}

export interface TranslationSchemaCopilot {
  placeholder: string;
  thinking: string;
  welcome: string;
  welcomeSub: string;
  chips: Array<{ text: string; label: string; icon: string }>;
  attached: string;
  voiceQuery: string;
}

export interface TranslationSchemaJudge {
  title: string;
  subtitle: string;
  pitchBtn: string;
  sliderTitle: string;
  sliderSub: string;
  baselineLabel: string;
  baselineSpecs: string;
  optLabel: string;
  optSpecs: string;
  gridInt: string;
  waterCooling: string;
  logistics: string;
  credits: string;
  statusHigh: string;
  statusLow: string;
  pitchTitle: string;
  pitchSub: string;
  certTitle: string;
  certSub: string;
}
