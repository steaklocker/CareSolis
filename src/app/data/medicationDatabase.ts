/**
 * COMPREHENSIVE MEDICATION DATABASE
 * For ages 60-90 demographic
 * Total: 200+ medications
 */

export interface MedicationDefinition {
  name: string;
  dosages: string[];
  purpose: string;
  timeCritical: boolean;
  typicalDoses: number; // doses per day
  timingRecommendation?: string; // For time-critical medications
}

export const MEDICATION_DATABASE: MedicationDefinition[] = [
  // CARDIOVASCULAR - Blood Pressure & Heart (45 medications)
  {
    name: 'Lisinopril',
    dosages: ['2.5mg', '5mg', '10mg', '20mg', '40mg'],
    purpose: 'Blood pressure control (ACE inhibitor)',
    timeCritical: false,
    typicalDoses: 1,
    timingRecommendation: 'Take at the same time each day. Can be taken with or without food. May cause dizziness when standing up.'
  },
  {
    name: 'Amlodipine',
    dosages: ['2.5mg', '5mg', '10mg'],
    purpose: 'Blood pressure control (calcium channel blocker)',
    timeCritical: false,
    typicalDoses: 1,
    timingRecommendation: 'Take at the same time each day. Can be taken with or without food. May cause swelling in ankles/feet.'
  },
  {
    name: 'Losartan',
    dosages: ['25mg', '50mg', '100mg'],
    purpose: 'Blood pressure control (ARB)',
    timeCritical: false,
    typicalDoses: 1,
    timingRecommendation: 'Take at the same time each day. Can be taken with or without food.'
  },
  {
    name: 'Carvedilol',
    dosages: ['3.125mg', '6.25mg', '12.5mg', '25mg'],
    purpose: 'Heart failure / blood pressure (beta blocker)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food. Take at same time each day. Do not stop suddenly without consulting doctor.'
  },
  {
    name: 'Metoprolol',
    dosages: ['25mg', '50mg', '100mg', '200mg'],
    purpose: 'Blood pressure / heart rate control (beta blocker)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Atenolol',
    dosages: ['25mg', '50mg', '100mg'],
    purpose: 'Blood pressure / angina (beta blocker)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Valsartan',
    dosages: ['40mg', '80mg', '160mg', '320mg'],
    purpose: 'Blood pressure / heart failure (ARB)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Enalapril',
    dosages: ['2.5mg', '5mg', '10mg', '20mg'],
    purpose: 'Blood pressure / heart failure (ACE inhibitor)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Diltiazem',
    dosages: ['30mg', '60mg', '90mg', '120mg', '180mg', '240mg'],
    purpose: 'Blood pressure / heart rhythm (calcium channel blocker)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Hydralazine',
    dosages: ['10mg', '25mg', '50mg', '100mg'],
    purpose: 'Blood pressure (vasodilator)',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Clonidine',
    dosages: ['0.1mg', '0.2mg', '0.3mg'],
    purpose: 'Blood pressure control',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Amiodarone',
    dosages: ['100mg', '200mg', '400mg'],
    purpose: 'Heart rhythm control (antiarrhythmic)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Digoxin',
    dosages: ['0.125mg', '0.25mg'],
    purpose: 'Heart failure / atrial fibrillation',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Furosemide',
    dosages: ['20mg', '40mg', '80mg'],
    purpose: 'Diuretic (water pill) for heart failure/edema',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Spironolactone',
    dosages: ['25mg', '50mg', '100mg'],
    purpose: 'Heart failure / blood pressure (diuretic)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Hydrochlorothiazide',
    dosages: ['12.5mg', '25mg', '50mg'],
    purpose: 'Blood pressure / fluid retention (diuretic)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Bumetanide',
    dosages: ['0.5mg', '1mg', '2mg'],
    purpose: 'Edema / fluid retention (loop diuretic)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Isosorbide Mononitrate',
    dosages: ['30mg', '60mg', '120mg'],
    purpose: 'Angina / chest pain prevention',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Atorvastatin',
    dosages: ['10mg', '20mg', '40mg', '80mg'],
    purpose: 'Cholesterol reduction (statin)',
    timeCritical: false,
    typicalDoses: 1,
    timingRecommendation: 'Take at bedtime for best effect. Can be taken with or without food. Avoid grapefruit juice.'
  },
  {
    name: 'Simvastatin',
    dosages: ['5mg', '10mg', '20mg', '40mg', '80mg'],
    purpose: 'Cholesterol reduction (statin)',
    timeCritical: false,
    typicalDoses: 1,
    timingRecommendation: 'Take at bedtime. Avoid grapefruit juice.'
  },
  {
    name: 'Rosuvastatin',
    dosages: ['5mg', '10mg', '20mg', '40mg'],
    purpose: 'Cholesterol reduction (statin)',
    timeCritical: false,
    typicalDoses: 1,
    timingRecommendation: 'Can be taken any time of day, with or without food. Avoid grapefruit juice.'
  },
  {
    name: 'Pravastatin',
    dosages: ['10mg', '20mg', '40mg', '80mg'],
    purpose: 'Cholesterol reduction (statin)',
    timeCritical: false,
    typicalDoses: 1,
    timingRecommendation: 'Can be taken any time of day, with or without food.'
  },
  {
    name: 'Ezetimibe',
    dosages: ['10mg'],
    purpose: 'Cholesterol reduction (absorption inhibitor)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Fenofibrate',
    dosages: ['48mg', '145mg'],
    purpose: 'Triglyceride / cholesterol reduction',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Aspirin',
    dosages: ['81mg', '325mg'],
    purpose: 'Blood thinner / cardiovascular protection',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Clopidogrel',
    dosages: ['75mg'],
    purpose: 'Blood thinner (antiplatelet)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Warfarin',
    dosages: ['1mg', '2mg', '2.5mg', '3mg', '4mg', '5mg', '6mg', '7.5mg', '10mg'],
    purpose: 'Blood thinner (anticoagulant)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Apixaban',
    dosages: ['2.5mg', '5mg'],
    purpose: 'Blood thinner (anticoagulant for AFib/DVT)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Rivaroxaban',
    dosages: ['10mg', '15mg', '20mg'],
    purpose: 'Blood thinner (anticoagulant)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Dabigatran',
    dosages: ['75mg', '110mg', '150mg'],
    purpose: 'Blood thinner (anticoagulant)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Edoxaban',
    dosages: ['30mg', '60mg'],
    purpose: 'Blood thinner (anticoagulant)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Eplerenone',
    dosages: ['25mg', '50mg'],
    purpose: 'Heart failure / blood pressure',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Sacubitril-Valsartan',
    dosages: ['24-26mg', '49-51mg', '97-103mg'],
    purpose: 'Heart failure (ARNI)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Nitroglycerin',
    dosages: ['0.3mg', '0.4mg', '0.6mg'],
    purpose: 'Angina / chest pain (emergency)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Ranolazine',
    dosages: ['500mg', '1000mg'],
    purpose: 'Chronic angina',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Ivabradine',
    dosages: ['5mg', '7.5mg'],
    purpose: 'Heart failure / chronic heart failure',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Torsemide',
    dosages: ['5mg', '10mg', '20mg', '100mg'],
    purpose: 'Heart failure / edema (loop diuretic)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Nebivolol',
    dosages: ['2.5mg', '5mg', '10mg', '20mg'],
    purpose: 'Blood pressure (beta blocker)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Bisoprolol',
    dosages: ['2.5mg', '5mg', '10mg'],
    purpose: 'Heart failure / blood pressure (beta blocker)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Isosorbide Dinitrate',
    dosages: ['5mg', '10mg', '20mg', '30mg'],
    purpose: 'Angina prevention',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Dofetilide',
    dosages: ['125mcg', '250mcg', '500mcg'],
    purpose: 'Atrial fibrillation (antiarrhythmic)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Sotalol',
    dosages: ['80mg', '120mg', '160mg', '240mg'],
    purpose: 'Heart rhythm control (antiarrhythmic)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Flecainide',
    dosages: ['50mg', '100mg', '150mg'],
    purpose: 'Heart rhythm control (antiarrhythmic)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Propranolol',
    dosages: ['10mg', '20mg', '40mg', '60mg', '80mg'],
    purpose: 'Blood pressure / tremor / migraine (beta blocker)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Triamterene-HCTZ',
    dosages: ['37.5-25mg', '75-50mg'],
    purpose: 'Blood pressure / fluid retention (diuretic combo)',
    timeCritical: false,
    typicalDoses: 1
  },

  // DIABETES (12 medications)
  {
    name: 'Metformin',
    dosages: ['500mg', '850mg', '1000mg'],
    purpose: 'Type 2 diabetes management',
    timeCritical: false,
    typicalDoses: 2,
    timingRecommendation: 'Take with meals to reduce stomach upset. Take at the same times each day.'
  },
  {
    name: 'Glipizide',
    dosages: ['2.5mg', '5mg', '10mg'],
    purpose: 'Type 2 diabetes (sulfonylurea)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Glyburide',
    dosages: ['1.25mg', '2.5mg', '5mg'],
    purpose: 'Type 2 diabetes (sulfonylurea)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Sitagliptin',
    dosages: ['25mg', '50mg', '100mg'],
    purpose: 'Type 2 diabetes (DPP-4 inhibitor)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Empagliflozin',
    dosages: ['10mg', '25mg'],
    purpose: 'Type 2 diabetes / heart failure (SGLT2 inhibitor)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Dapagliflozin',
    dosages: ['5mg', '10mg'],
    purpose: 'Type 2 diabetes / heart failure (SGLT2 inhibitor)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Insulin Glargine',
    dosages: ['100 units/mL', '300 units/mL'],
    purpose: 'Long-acting insulin for diabetes',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Insulin Lispro',
    dosages: ['100 units/mL'],
    purpose: 'Rapid-acting insulin for diabetes',
    timeCritical: true,
    typicalDoses: 3,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Semaglutide',
    dosages: ['0.25mg', '0.5mg', '1mg', '2mg'],
    purpose: 'Type 2 diabetes / weight management (GLP-1)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Pioglitazone',
    dosages: ['15mg', '30mg', '45mg'],
    purpose: 'Type 2 diabetes (thiazolidinedione)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Dulaglutide',
    dosages: ['0.75mg', '1.5mg'],
    purpose: 'Type 2 diabetes (GLP-1 weekly injection)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Liraglutide',
    dosages: ['0.6mg', '1.2mg', '1.8mg'],
    purpose: 'Type 2 diabetes / weight management (GLP-1)',
    timeCritical: false,
    typicalDoses: 1
  },

  // THYROID & HORMONES (4 medications)
  {
    name: 'Levothyroxine',
    dosages: ['25mcg', '50mcg', '75mcg', '88mcg', '100mcg', '112mcg', '125mcg', '137mcg', '150mcg', '175mcg', '200mcg'],
    purpose: 'Thyroid hormone replacement',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Liothyronine',
    dosages: ['5mcg', '25mcg', '50mcg'],
    purpose: 'Thyroid hormone (T3) replacement',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Methimazole',
    dosages: ['5mg', '10mg', '20mg'],
    purpose: 'Hyperthyroidism (overactive thyroid)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Testosterone',
    dosages: ['1% gel', '50mg patch', '100mg injection'],
    purpose: 'Low testosterone replacement',
    timeCritical: false,
    typicalDoses: 1
  },

  // GASTROINTESTINAL (14 medications)
  {
    name: 'Omeprazole',
    dosages: ['10mg', '20mg', '40mg'],
    purpose: 'Acid reflux/GERD (proton pump inhibitor)',
    timeCritical: false,
    typicalDoses: 1,
    timingRecommendation: 'Take before breakfast (30-60 minutes before eating). Do not crush or chew capsules.'
  },
  {
    name: 'Pantoprazole',
    dosages: ['20mg', '40mg'],
    purpose: 'Acid reflux/GERD (proton pump inhibitor)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Esomeprazole',
    dosages: ['20mg', '40mg'],
    purpose: 'Acid reflux/GERD (proton pump inhibitor)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Lansoprazole',
    dosages: ['15mg', '30mg'],
    purpose: 'Acid reflux/GERD (proton pump inhibitor)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Ranitidine',
    dosages: ['75mg', '150mg', '300mg'],
    purpose: 'Heartburn / stomach acid (H2 blocker)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Famotidine',
    dosages: ['10mg', '20mg', '40mg'],
    purpose: 'Heartburn / stomach acid (H2 blocker)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Polyethylene Glycol 3350',
    dosages: ['17g powder'],
    purpose: 'Constipation relief (osmotic laxative)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Docusate',
    dosages: ['100mg', '250mg'],
    purpose: 'Stool softener for constipation',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Senna',
    dosages: ['8.6mg'],
    purpose: 'Constipation relief (stimulant laxative)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Loperamide',
    dosages: ['2mg'],
    purpose: 'Diarrhea control',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Dicyclomine',
    dosages: ['10mg', '20mg'],
    purpose: 'IBS / abdominal cramping',
    timeCritical: false,
    typicalDoses: 4
  },
  {
    name: 'Hyoscyamine',
    dosages: ['0.125mg', '0.375mg'],
    purpose: 'IBS / stomach cramps',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Sucralfate',
    dosages: ['1g'],
    purpose: 'Stomach ulcers',
    timeCritical: false,
    typicalDoses: 4
  },
  {
    name: 'Lactulose',
    dosages: ['10g/15mL'],
    purpose: 'Constipation / hepatic encephalopathy',
    timeCritical: false,
    typicalDoses: 2
  },

  // PAIN & INFLAMMATION (18 medications)
  {
    name: 'Acetaminophen',
    dosages: ['325mg', '500mg', '650mg'],
    purpose: 'Pain relief / fever reduction',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Ibuprofen',
    dosages: ['200mg', '400mg', '600mg', '800mg'],
    purpose: 'Pain / inflammation (NSAID)',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Naproxen',
    dosages: ['220mg', '375mg', '500mg'],
    purpose: 'Pain / inflammation (NSAID)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Celecoxib',
    dosages: ['100mg', '200mg'],
    purpose: 'Arthritis pain (COX-2 inhibitor)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Meloxicam',
    dosages: ['7.5mg', '15mg'],
    purpose: 'Arthritis / joint pain (NSAID)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Tramadol',
    dosages: ['50mg', '100mg'],
    purpose: 'Moderate pain relief (opioid-like)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Gabapentin',
    dosages: ['100mg', '300mg', '400mg', '600mg', '800mg'],
    purpose: 'Nerve pain / seizure control',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Pregabalin',
    dosages: ['25mg', '50mg', '75mg', '100mg', '150mg', '200mg', '300mg'],
    purpose: 'Nerve pain / fibromyalgia',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Cyclobenzaprine',
    dosages: ['5mg', '10mg'],
    purpose: 'Muscle spasm / back pain',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Baclofen',
    dosages: ['5mg', '10mg', '20mg'],
    purpose: 'Muscle spasm / spasticity',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Prednisone',
    dosages: ['1mg', '2.5mg', '5mg', '10mg', '20mg', '50mg'],
    purpose: 'Anti-inflammatory / immune suppression',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Methylprednisolone',
    dosages: ['4mg', '8mg', '16mg', '32mg'],
    purpose: 'Anti-inflammatory / immune suppression',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Hydrocodone-Acetaminophen',
    dosages: ['5-325mg', '7.5-325mg', '10-325mg'],
    purpose: 'Moderate to severe pain (opioid)',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Oxycodone',
    dosages: ['5mg', '10mg', '15mg', '20mg', '30mg'],
    purpose: 'Severe pain (opioid)',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Morphine',
    dosages: ['15mg', '30mg', '60mg', '100mg'],
    purpose: 'Severe pain (opioid)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Diclofenac',
    dosages: ['50mg', '75mg'],
    purpose: 'Pain / inflammation (NSAID)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Indomethacin',
    dosages: ['25mg', '50mg'],
    purpose: 'Pain / inflammation / gout (NSAID)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Methocarbamol',
    dosages: ['500mg', '750mg'],
    purpose: 'Muscle spasm / back pain',
    timeCritical: false,
    typicalDoses: 3
  },

  // RESPIRATORY (11 medications)
  {
    name: 'Albuterol',
    dosages: ['90mcg inhaler', '2.5mg nebulizer'],
    purpose: 'Asthma / COPD quick relief (bronchodilator)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Fluticasone',
    dosages: ['44mcg', '110mcg', '220mcg'],
    purpose: 'Asthma / allergy prevention (inhaled steroid)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Budesonide',
    dosages: ['0.25mg', '0.5mg', '1mg'],
    purpose: 'Asthma / COPD prevention (inhaled steroid)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Tiotropium',
    dosages: ['18mcg'],
    purpose: 'COPD maintenance (long-acting bronchodilator)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Montelukast',
    dosages: ['4mg', '5mg', '10mg'],
    purpose: 'Asthma / allergies (leukotriene blocker)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Ipratropium',
    dosages: ['17mcg'],
    purpose: 'COPD / bronchitis (bronchodilator)',
    timeCritical: false,
    typicalDoses: 4
  },
  {
    name: 'Benzonatate',
    dosages: ['100mg', '200mg'],
    purpose: 'Cough suppressant',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Fluticasone-Salmeterol',
    dosages: ['100-50mcg', '250-50mcg', '500-50mcg'],
    purpose: 'Asthma / COPD maintenance (combo inhaler)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Budesonide-Formoterol',
    dosages: ['80-4.5mcg', '160-4.5mcg'],
    purpose: 'Asthma / COPD maintenance (combo inhaler)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Umeclidinium',
    dosages: ['62.5mcg'],
    purpose: 'COPD maintenance',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Roflumilast',
    dosages: ['500mcg'],
    purpose: 'Severe COPD',
    timeCritical: false,
    typicalDoses: 1
  },

  // MENTAL HEALTH - Depression & Anxiety (28 medications)
  {
    name: 'Sertraline',
    dosages: ['25mg', '50mg', '100mg'],
    purpose: 'Depression / anxiety (SSRI)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Escitalopram',
    dosages: ['5mg', '10mg', '20mg'],
    purpose: 'Depression / anxiety (SSRI)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Fluoxetine',
    dosages: ['10mg', '20mg', '40mg'],
    purpose: 'Depression / anxiety (SSRI)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Paroxetine',
    dosages: ['10mg', '20mg', '30mg', '40mg'],
    purpose: 'Depression / anxiety (SSRI)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Citalopram',
    dosages: ['10mg', '20mg', '40mg'],
    purpose: 'Depression (SSRI)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Venlafaxine',
    dosages: ['37.5mg', '75mg', '150mg'],
    purpose: 'Depression / anxiety (SNRI)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Duloxetine',
    dosages: ['20mg', '30mg', '60mg'],
    purpose: 'Depression / nerve pain (SNRI)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Bupropion',
    dosages: ['75mg', '100mg', '150mg', '300mg'],
    purpose: 'Depression / smoking cessation',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Mirtazapine',
    dosages: ['7.5mg', '15mg', '30mg', '45mg'],
    purpose: 'Depression / sleep / appetite',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Trazodone',
    dosages: ['50mg', '100mg', '150mg'],
    purpose: 'Depression / insomnia',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Buspirone',
    dosages: ['5mg', '10mg', '15mg', '30mg'],
    purpose: 'Anxiety',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Lorazepam',
    dosages: ['0.5mg', '1mg', '2mg'],
    purpose: 'Anxiety (benzodiazepine)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Alprazolam',
    dosages: ['0.25mg', '0.5mg', '1mg', '2mg'],
    purpose: 'Anxiety / panic disorder (benzodiazepine)',
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Clonazepam',
    dosages: ['0.5mg', '1mg', '2mg'],
    purpose: 'Anxiety / seizures (benzodiazepine)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Diazepam',
    dosages: ['2mg', '5mg', '10mg'],
    purpose: 'Anxiety / muscle spasm (benzodiazepine)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Zolpidem',
    dosages: ['5mg', '10mg'],
    purpose: 'Insomnia (short-term sleep aid)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Eszopiclone',
    dosages: ['1mg', '2mg', '3mg'],
    purpose: 'Insomnia (sleep aid)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Melatonin',
    dosages: ['1mg', '3mg', '5mg', '10mg'],
    purpose: 'Sleep regulation / circadian rhythm',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Quetiapine',
    dosages: ['25mg', '50mg', '100mg', '200mg', '300mg', '400mg'],
    purpose: 'Schizophrenia / bipolar / depression add-on',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Aripiprazole',
    dosages: ['2mg', '5mg', '10mg', '15mg', '20mg', '30mg'],
    purpose: 'Schizophrenia / bipolar',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Risperidone',
    dosages: ['0.25mg', '0.5mg', '1mg', '2mg', '3mg', '4mg'],
    purpose: 'Schizophrenia / bipolar / agitation',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Olanzapine',
    dosages: ['2.5mg', '5mg', '10mg', '15mg', '20mg'],
    purpose: 'Schizophrenia / bipolar',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Lithium Carbonate',
    dosages: ['150mg', '300mg', '600mg'],
    purpose: 'Bipolar disorder (mood stabilizer)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Lamotrigine',
    dosages: ['25mg', '50mg', '100mg', '150mg', '200mg'],
    purpose: 'Bipolar / seizure prevention',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Valproic Acid',
    dosages: ['125mg', '250mg', '500mg'],
    purpose: 'Seizures / bipolar (mood stabilizer)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Carbamazepine',
    dosages: ['200mg', '400mg'],
    purpose: 'Seizures / bipolar / nerve pain',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Amitriptyline',
    dosages: ['10mg', '25mg', '50mg', '75mg', '100mg'],
    purpose: 'Depression / nerve pain / migraine prevention',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Nortriptyline',
    dosages: ['10mg', '25mg', '50mg', '75mg'],
    purpose: 'Depression / nerve pain',
    timeCritical: false,
    typicalDoses: 1
  },

  // NEUROLOGICAL - Dementia & Parkinson's (12 medications)
  {
    name: 'Donepezil',
    dosages: ['5mg', '10mg', '23mg'],
    purpose: "Alzheimer's disease / dementia",
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Memantine',
    dosages: ['5mg', '10mg', '14mg', '28mg'],
    purpose: "Alzheimer's disease / dementia",
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Rivastigmine',
    dosages: ['1.5mg', '3mg', '4.5mg', '6mg'],
    purpose: "Alzheimer's / Parkinson's dementia",
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Galantamine',
    dosages: ['4mg', '8mg', '12mg', '16mg', '24mg'],
    purpose: "Alzheimer's disease",
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Carbidopa-Levodopa',
    dosages: ['25-100mg', '25-250mg'],
    purpose: "Parkinson's disease",
    timeCritical: true,
    typicalDoses: 3,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Pramipexole',
    dosages: ['0.125mg', '0.25mg', '0.5mg', '1mg', '1.5mg'],
    purpose: "Parkinson's disease / restless leg syndrome",
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Ropinirole',
    dosages: ['0.25mg', '0.5mg', '1mg', '2mg', '3mg', '4mg', '5mg'],
    purpose: "Parkinson's disease / restless leg syndrome",
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Levetiracetam',
    dosages: ['250mg', '500mg', '750mg', '1000mg'],
    purpose: 'Seizure prevention (anticonvulsant)',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Topiramate',
    dosages: ['25mg', '50mg', '100mg', '200mg'],
    purpose: 'Seizures / migraine prevention',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Phenytoin',
    dosages: ['25mg', '50mg', '100mg'],
    purpose: 'Seizure prevention',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Entacapone',
    dosages: ['200mg'],
    purpose: "Parkinson's disease (with levodopa)",
    timeCritical: false,
    typicalDoses: 3
  },
  {
    name: 'Rasagiline',
    dosages: ['0.5mg', '1mg'],
    purpose: "Parkinson's disease",
    timeCritical: false,
    typicalDoses: 1
  },

  // UROLOGICAL & PROSTATE (6 medications)
  {
    name: 'Tamsulosin',
    dosages: ['0.4mg'],
    purpose: 'Enlarged prostate (BPH)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Finasteride',
    dosages: ['1mg', '5mg'],
    purpose: 'Enlarged prostate / hair loss',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Dutasteride',
    dosages: ['0.5mg'],
    purpose: 'Enlarged prostate (BPH)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Oxybutynin',
    dosages: ['5mg', '10mg', '15mg'],
    purpose: 'Overactive bladder / urinary incontinence',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Tolterodine',
    dosages: ['1mg', '2mg', '4mg'],
    purpose: 'Overactive bladder',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Solifenacin',
    dosages: ['5mg', '10mg'],
    purpose: 'Overactive bladder',
    timeCritical: false,
    typicalDoses: 1
  },

  // BONE HEALTH (6 medications)
  {
    name: 'Alendronate',
    dosages: ['5mg', '10mg', '35mg', '70mg'],
    purpose: 'Osteoporosis prevention / treatment',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Risedronate',
    dosages: ['5mg', '30mg', '35mg', '150mg'],
    purpose: 'Osteoporosis prevention',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Ibandronate',
    dosages: ['150mg'],
    purpose: 'Osteoporosis (monthly)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Calcium Carbonate',
    dosages: ['500mg', '600mg', '1000mg'],
    purpose: 'Calcium supplementation / bone health',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Vitamin D3',
    dosages: ['400 IU', '1000 IU', '2000 IU', '5000 IU', '10000 IU'],
    purpose: 'Bone health / vitamin supplementation',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Denosumab',
    dosages: ['60mg injection'],
    purpose: 'Osteoporosis (biannual injection)',
    timeCritical: false,
    typicalDoses: 1
  },

  // EYE CONDITIONS (4 medications)
  {
    name: 'Latanoprost',
    dosages: ['0.005% drops'],
    purpose: 'Glaucoma / eye pressure',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Timolol',
    dosages: ['0.25% drops', '0.5% drops'],
    purpose: 'Glaucoma / eye pressure',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Brimonidine',
    dosages: ['0.1% drops', '0.15% drops', '0.2% drops'],
    purpose: 'Glaucoma / eye pressure',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Dorzolamide',
    dosages: ['2% drops'],
    purpose: 'Glaucoma / eye pressure',
    timeCritical: false,
    typicalDoses: 3
  },

  // GOUT & KIDNEY (3 medications)
  {
    name: 'Allopurinol',
    dosages: ['100mg', '200mg', '300mg'],
    purpose: 'Gout prevention (uric acid reduction)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Colchicine',
    dosages: ['0.6mg'],
    purpose: 'Gout attack treatment',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Febuxostat',
    dosages: ['40mg', '80mg'],
    purpose: 'Gout prevention (uric acid reduction)',
    timeCritical: false,
    typicalDoses: 1
  },

  // ALLERGIES (5 medications)
  {
    name: 'Cetirizine',
    dosages: ['5mg', '10mg'],
    purpose: 'Allergies / hay fever (antihistamine)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Loratadine',
    dosages: ['10mg'],
    purpose: 'Allergies / hay fever (antihistamine)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Fexofenadine',
    dosages: ['60mg', '120mg', '180mg'],
    purpose: 'Allergies / hay fever (antihistamine)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Diphenhydramine',
    dosages: ['25mg', '50mg'],
    purpose: 'Allergies / sleep aid (antihistamine)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Hydroxyzine',
    dosages: ['10mg', '25mg', '50mg'],
    purpose: 'Anxiety / allergies / itching',
    timeCritical: false,
    typicalDoses: 2
  },

  // ANTIBIOTICS (8 medications)
  {
    name: 'Amoxicillin',
    dosages: ['250mg', '500mg', '875mg'],
    purpose: 'Bacterial infections (antibiotic)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Azithromycin',
    dosages: ['250mg', '500mg'],
    purpose: 'Bacterial infections (antibiotic)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Ciprofloxacin',
    dosages: ['250mg', '500mg', '750mg'],
    purpose: 'Bacterial infections / UTI (antibiotic)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Levofloxacin',
    dosages: ['250mg', '500mg', '750mg'],
    purpose: 'Bacterial infections (antibiotic)',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Doxycycline',
    dosages: ['50mg', '100mg'],
    purpose: 'Bacterial infections (antibiotic)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Cephalexin',
    dosages: ['250mg', '500mg'],
    purpose: 'Bacterial infections (antibiotic)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Trimethoprim-Sulfamethoxazole',
    dosages: ['400-80mg', '800-160mg'],
    purpose: 'UTI / bacterial infections (antibiotic)',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Nitrofurantoin',
    dosages: ['50mg', '100mg'],
    purpose: 'UTI prevention / treatment',
    timeCritical: false,
    typicalDoses: 2
  },

  // NAUSEA & VERTIGO (4 medications)
  {
    name: 'Ondansetron',
    dosages: ['4mg', '8mg'],
    purpose: 'Nausea / vomiting',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Meclizine',
    dosages: ['12.5mg', '25mg'],
    purpose: 'Vertigo / dizziness / motion sickness',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Promethazine',
    dosages: ['12.5mg', '25mg', '50mg'],
    purpose: 'Nausea / allergies / sedation',
    timeCritical: false,
    typicalDoses: 2
  },
  {
    name: 'Metoclopramide',
    dosages: ['5mg', '10mg'],
    purpose: 'Nausea / GERD / gastroparesis',
    timeCritical: false,
    typicalDoses: 3
  },

  // VITAMINS & SUPPLEMENTS (7 medications)
  {
    name: 'Vitamin B12',
    dosages: ['100mcg', '500mcg', '1000mcg'],
    purpose: 'B12 deficiency / nerve health',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Folic Acid',
    dosages: ['400mcg', '800mcg', '1mg'],
    purpose: 'Anemia / pregnancy / heart health',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Ferrous Sulfate',
    dosages: ['325mg'],
    purpose: 'Iron deficiency anemia',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Multivitamin',
    dosages: ['1 tablet'],
    purpose: 'General nutritional supplementation',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Omega-3 Fish Oil',
    dosages: ['1000mg'],
    purpose: 'Heart health / cholesterol / inflammation',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Coenzyme Q10',
    dosages: ['100mg', '200mg'],
    purpose: 'Heart health / statin side effects',
    timeCritical: false,
    typicalDoses: 1
  },
  {
    name: 'Magnesium',
    dosages: ['200mg', '400mg'],
    purpose: 'Muscle cramps / heart rhythm / constipation',
    timeCritical: false,
    typicalDoses: 1
  },

  // CANCER SUPPORT (4 medications)
  {
    name: 'Tamoxifen',
    dosages: ['10mg', '20mg'],
    purpose: 'Breast cancer treatment / prevention',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Anastrozole',
    dosages: ['1mg'],
    purpose: 'Breast cancer (aromatase inhibitor)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Letrozole',
    dosages: ['2.5mg'],
    purpose: 'Breast cancer (aromatase inhibitor)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Bicalutamide',
    dosages: ['50mg'],
    purpose: 'Prostate cancer',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },

  // MISCELLANEOUS CRITICAL (7 medications)
  {
    name: 'Potassium Chloride',
    dosages: ['8mEq', '10mEq', '20mEq'],
    purpose: 'Potassium supplementation (low potassium)',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Hydrocortisone',
    dosages: ['5mg', '10mg', '20mg'],
    purpose: 'Adrenal insufficiency / inflammation',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Cyclosporine',
    dosages: ['25mg', '50mg', '100mg'],
    purpose: 'Organ transplant / immune suppression',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Tacrolimus',
    dosages: ['0.5mg', '1mg', '5mg'],
    purpose: 'Organ transplant / immune suppression',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Mycophenolate',
    dosages: ['250mg', '500mg'],
    purpose: 'Organ transplant / immune suppression',
    timeCritical: true,
    typicalDoses: 2,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Azathioprine',
    dosages: ['50mg', '75mg', '100mg'],
    purpose: 'Immune suppression / autoimmune disease',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
  {
    name: 'Amiodarone',
    dosages: ['200mg', '400mg'],
    purpose: 'Severe heart rhythm problems',
    timeCritical: true,
    typicalDoses: 1,
    timingRecommendation: 'Take with food'
  },
];

// MedicationDatabaseEntry type for search results
export interface MedicationDatabaseEntry {
  name: string;
  dosages: string[];
  purpose: string;
  timeCritical: boolean;
  typicalDoses: number;
  timingRecommendation?: string;
}

// Search function for medication database
export function searchMedications(query: string): MedicationDatabaseEntry[] {
  if (!query || query.length < 2) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  
  return MEDICATION_DATABASE.filter(med => 
    med.name.toLowerCase().includes(lowerQuery) ||
    med.purpose.toLowerCase().includes(lowerQuery)
  ).slice(0, 20); // Limit to 20 results
}