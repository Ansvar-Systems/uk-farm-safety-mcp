/**
 * Ingest UK farm safety data into SQLite database.
 *
 * Data sourced from HSE (Health and Safety Executive) agriculture publications:
 * - HSE Agriculture information sheet series (AIS)
 * - HSE INDG series (guidance booklets)
 * - RIDDOR (Reporting of Injuries, Diseases and Dangerous Occurrences Regulations 2013)
 * - COSHH Regulations 2002
 * - PUWER (Provision and Use of Work Equipment Regulations 1998)
 * - Children in Agriculture Regulations (CHAW) 1998
 * - Workplace (Health, Safety and Welfare) Regulations 1992
 *
 * All data is Crown Copyright under Open Government Licence v3.0.
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const today = new Date().toISOString().split('T')[0];

// ─── Safety Guidance (Machinery) ───────────────────────────────────────────

const machineryData = [
  {
    topic: 'Tractor rollover protection',
    machine_type: 'tractor',
    species: null,
    hazards: 'Overturning on slopes, soft ground, or uneven terrain. Leading cause of fatal injury on UK farms. Risk increases with front-loader attachment raising centre of gravity.',
    control_measures: 'Fit ROPS (Roll-Over Protective Structure) to all tractors. Wear seatbelt at all times. Avoid steep slopes (>16 degrees side slope, >20 degrees forward). Match speed to terrain. Keep front-loader low when travelling.',
    legal_requirements: 'PUWER 1998 reg. 25-26 requires ROPS on all tractors (exemptions only for pre-1970 tractors in specific low-risk uses). Employer must ensure ROPS fitted and maintained.',
    ppe_required: 'Seatbelt (mandatory with ROPS fitted)',
    regulation_ref: 'PUWER 1998 reg. 25-26; HSE AIS25',
  },
  {
    topic: 'Tractor PTO (Power Take-Off) safety',
    machine_type: 'tractor',
    species: null,
    hazards: 'Entanglement with rotating PTO shaft. Can cause fatal injuries in under one second. Loose clothing, hair, or drawstrings caught by unguarded shaft.',
    control_measures: 'Fit and maintain PTO guard (master shield on tractor, guard on implement shaft). Never step over rotating PTO. Switch off PTO and engine before dismounting. Replace damaged guards immediately. Use quick-release couplings.',
    legal_requirements: 'PUWER 1998 reg. 11 requires guards on all dangerous moving parts. ACoP L22 provides specific PTO guarding standards.',
    ppe_required: 'Close-fitting clothing. No loose items near PTO.',
    regulation_ref: 'PUWER 1998 reg. 11; HSE AIS40; ACoP L22',
  },
  {
    topic: 'Telehandler safe operation',
    machine_type: 'telehandler',
    species: null,
    hazards: 'Overturning when boom extended (reduced stability envelope). Crushing when load falls. Collision with persons on foot. Reduced visibility with high loads.',
    control_measures: 'Only trained and competent operators. Follow manufacturer load charts. Do not exceed rated capacity at given reach. Use rated man-basket for working at height (never a pallet on forks). Set up on firm, level ground. Use stabilisers where fitted. Implement pedestrian exclusion zones.',
    legal_requirements: 'LOLER 1998 requires thorough examination every 12 months (6 months if used for lifting persons). PUWER 1998 requires adequate training. Only persons holding CPCS or NPORS card should operate.',
    ppe_required: 'Hard hat for persons in vicinity. Seatbelt for operator.',
    regulation_ref: 'LOLER 1998; PUWER 1998; HSE INDG392',
  },
  {
    topic: 'ATV/quad bike safety',
    machine_type: 'atv',
    species: null,
    hazards: 'Overturning on slopes, ditches, or rough ground. Riders thrown off. No ROPS or seatbelt on most ATVs. Head and spinal injuries common in incidents. High centre of gravity makes rollover likely.',
    control_measures: 'Wear helmet at all times. Complete manufacturer-approved training course. Never carry passengers (unless vehicle designed for it). Do not exceed load limits on racks. Avoid steep slopes and use alternative transport. Consider side-by-side utility vehicle as safer alternative.',
    legal_requirements: 'PUWER 1998 requires employer to ensure adequate training. HSE strongly recommends helmets. Children under 13 must not ride ATVs on farms.',
    ppe_required: 'Helmet (BS EN 1077 or motorcycle standard), boots, gloves',
    regulation_ref: 'PUWER 1998; HSE AIS33; HSE INDG466',
  },
  {
    topic: 'Chainsaw use and maintenance',
    machine_type: 'chainsaw',
    species: null,
    hazards: 'Kickback (sudden upward rotation of guide bar). Cuts from chain. Hearing damage. Hand-arm vibration syndrome (HAVS). Falling branches and trees.',
    control_measures: 'Operator must hold NPTC/City & Guilds certificate of competence. Maintain chain brake and anti-vibration mounts. Carry out pre-use checks. Work with a colleague when felling. Plan escape route. Never cut above shoulder height.',
    legal_requirements: 'PUWER 1998 requires competence. AFAG (Arboricultural and Forestry Advisory Group) safety guides apply. Chainsaw operators must hold recognised certificate.',
    ppe_required: 'Chainsaw boots (BS EN ISO 17249), chainsaw trousers/chaps (BS EN 381-5), helmet with visor and ear defenders (BS EN 397 + BS EN 1731 + BS EN 352), gloves (BS EN 381-7)',
    regulation_ref: 'PUWER 1998; AFAG safety guides; HSE INDG317',
  },
  {
    topic: 'Grain dryer fire prevention',
    machine_type: 'grain dryer',
    species: null,
    hazards: 'Fire from grain dust accumulation, overheating, or mechanical failure. Explosion risk from grain dust cloud in enclosed spaces. Carbon monoxide exposure from direct-fired dryers.',
    control_measures: 'Regular cleaning of dust accumulations. Maintain temperature controls and safety cut-outs. Install and maintain fire detection. Keep fire extinguishers accessible. Do not exceed recommended grain moisture differentials. Inspect burner and heat exchanger annually.',
    legal_requirements: 'DSEAR 2002 (Dangerous Substances and Explosive Atmospheres Regulations) applies to grain dust explosion risk. Fire safety requirements under Regulatory Reform (Fire Safety) Order 2005.',
    ppe_required: 'Dust mask (FFP2 minimum) when cleaning. Hearing protection near dryer.',
    regulation_ref: 'DSEAR 2002; HSE INDG370; Fire Safety Order 2005',
  },
  {
    topic: 'Combine harvester safe operation',
    machine_type: 'combine',
    species: null,
    hazards: 'Entanglement in header or threshing mechanism. Falls from cab or platform. Grain dust explosion in hopper. Fire from dry crop material on hot engine. Crushing during maintenance.',
    control_measures: 'Always disengage header and stop engine before approaching cutting mechanism. Lock out hydraulics during maintenance. Keep fire extinguisher on combine. Clean chaff accumulation from engine bay daily. Use three-point contact when climbing. Never enter grain tank while auger is running.',
    legal_requirements: 'PUWER 1998 requires guarding of dangerous parts and safe stop procedures. Employer must provide training on specific make and model.',
    ppe_required: 'Hearing protection, dust mask during prolonged harvest, safety boots',
    regulation_ref: 'PUWER 1998 reg. 11-12; HSE AIS38',
  },
  {
    topic: 'Baler and bale handler safety',
    machine_type: 'baler',
    species: null,
    hazards: 'Entanglement in pickup mechanism or knotter. Crushing by falling bales (round bales weigh 250-500 kg). Bale stacks collapsing. Needle and twine injuries during maintenance.',
    control_measures: 'Stop PTO and engine before clearing blockages. Never reach into bale chamber while machine is running. Stack bales on flat ground, pyramid style. Limit stack height. Use bale spike or grab on telehandler, never lift by twine. Secure bales during transport.',
    legal_requirements: 'PUWER 1998 requires safe system of work for blockage clearance. HSE safe stacking guidance must be followed.',
    ppe_required: 'Gloves, safety boots with toe protection',
    regulation_ref: 'PUWER 1998; HSE INDG125 (safe stacking)',
  },
  {
    topic: 'Slurry tanker and spreading safety',
    machine_type: 'slurry tanker',
    species: null,
    hazards: 'Hydrogen sulphide (H2S) and methane release during agitation. Tanker overturning on slopes (high centre of gravity when full). Hose whip from pressurised lines. Drowning in slurry pit/lagoon.',
    control_measures: 'Never enter slurry pit or tank. Agitate slurry from upwind position. Evacuate livestock from buildings during agitation. Open all ventilation. Use gas detector. Match tanker size to tractor capacity. Fit guard rails around lagoons and reception pits.',
    legal_requirements: 'COSHH 2002 requires assessment of H2S exposure. Confined Spaces Regulations 1997 apply to slurry pits. SSAFO 2010 (Silage, Slurry and Agricultural Fuel Oil) sets construction standards.',
    ppe_required: 'Personal gas detector (H2S). Self-contained breathing apparatus available for rescue.',
    regulation_ref: 'COSHH 2002; Confined Spaces Regulations 1997; SSAFO 2010; HSE AIS29',
  },
  {
    topic: 'Woodchipper safe operation',
    machine_type: 'woodchipper',
    species: null,
    hazards: 'Entanglement and drawing-in through feed mechanism. Material ejection from chute. Noise exceeding 100 dB. Flying debris.',
    control_measures: 'Never reach into feed hopper. Use a push stick for short pieces. Wear hearing protection and eye protection. Maintain feed control bar (must stop feed rollers within 1 second). Position discharge chute away from persons. Only trained operators.',
    legal_requirements: 'PUWER 1998 requires guarding of feed mechanism. AFAG805 provides specific safety guidance. Noise at Work Regulations 2005 apply.',
    ppe_required: 'Hearing protection (mandatory), eye protection, close-fitting clothing, safety boots',
    regulation_ref: 'PUWER 1998; AFAG805; Noise at Work Regulations 2005',
  },
  {
    topic: 'Auger and conveyor safety',
    machine_type: 'auger',
    species: null,
    hazards: 'Entanglement in rotating auger flights. Drawing-in at intake. Crushing if auger falls from support. Grain dust inhalation during filling.',
    control_measures: 'Guard all intake points and transfer points. Lock out before clearing blockages. Secure auger to prevent collapse. Never stand on running auger tube. Use hopper grids to prevent access to intake.',
    legal_requirements: 'PUWER 1998 reg. 11 requires effective guarding. Machinery Directive 2006/42/EC sets design standards.',
    ppe_required: 'Dust mask when handling grain, gloves, safety boots',
    regulation_ref: 'PUWER 1998 reg. 11; HSE AIS38',
  },
];

for (const m of machineryData) {
  db.run(
    `INSERT INTO safety_guidance (topic, machine_type, species, hazards, control_measures, legal_requirements, ppe_required, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [m.topic, m.machine_type, m.species, m.hazards, m.control_measures, m.legal_requirements, m.ppe_required, m.regulation_ref, 'GB']
  );
}
console.log(`Inserted ${machineryData.length} machinery safety entries`);

// ─── Safety Guidance (Livestock) ───────────────────────────────────────────

const livestockData = [
  {
    topic: 'Cattle handling in crush and race',
    machine_type: null,
    species: 'cattle',
    hazards: 'Crushing against gates and walls. Kicking (rear and side). Head butting. Trampling in confined spaces. Cattle weighing 500-800 kg can cause serious crush injuries.',
    control_measures: 'Use properly maintained crush and race system. Approach cattle calmly from the side. Use non-slip flooring in handling areas. Maintain escape routes (man-gaps in race fencing). Do not overcrowd the collecting pen. Use curved race design to reduce stress.',
    legal_requirements: 'MHSW Regulations 1999 require risk assessment for cattle handling. Welfare of Animals at Markets Order 1990 sets handling standards.',
    ppe_required: 'Steel-toe boots, hard hat when working in crush',
    regulation_ref: 'MHSW Regulations 1999; HSE AIS35; HSE INDG126',
  },
  {
    topic: 'Bull handling and containment',
    machine_type: null,
    species: 'cattle',
    hazards: 'Unpredictable aggression, especially dairy bulls. Goring. Crushing against walls. Bulls responsible for disproportionate number of fatal farm incidents. Risk increases with age and after 10 months.',
    control_measures: 'Never trust a bull. Use bull pen with self-locking gate and feed barrier allowing safe access. Bull ring in nose (fitted by vet at 10 months). Use bull pole and nose ring for leading. Two people minimum when handling. Dairy bulls must not be at large in fields accessible to the public.',
    legal_requirements: 'Health and Safety at Work Act 1974 general duty. Wildlife and Countryside Act 1981 s.59 prohibits bulls of recognised dairy breeds in fields with public rights of way.',
    ppe_required: 'Steel-toe boots, hard hat. Bull handler stick.',
    regulation_ref: 'HSWA 1974; Wildlife and Countryside Act 1981 s.59; HSE AIS17',
  },
  {
    topic: 'Calving assistance safety',
    machine_type: null,
    species: 'cattle',
    hazards: 'Cow aggression (maternal instinct makes recently calved cows unpredictable). Kicking during assistance. Zoonotic infections (Q fever, cryptosporidiosis, chlamydia). Injuries from calving jack.',
    control_measures: 'Use calving pen with escape route for handler. Have experienced person supervise calving. Wear gloves and arm-length protectors. Wash hands thoroughly after contact. Women of childbearing age should avoid sheep and cattle at lambing/calving time due to zoonotic abortion risk. Restrain cow properly before using calving jack.',
    legal_requirements: 'COSHH 2002 applies to zoonotic disease risks. HSE guidance on reproductive risks to farmworkers.',
    ppe_required: 'Long gloves, waterproof clothing, boots, hand washing facilities',
    regulation_ref: 'COSHH 2002; HSE AIS18; HSE Farmwise (INDG349)',
  },
  {
    topic: 'Sheep handling and penning',
    machine_type: null,
    species: 'sheep',
    hazards: 'Back injuries from repetitive lifting (adult sheep weigh 60-100 kg). Knee and hand injuries from shearing position. Zoonotic infections (orf, Q fever, enzootic abortion). Crushing in pens when sheep pile up.',
    control_measures: 'Use handling system with races and drafting gates to reduce manual lifting. Turn sheep correctly (sit on rump, never lift by wool). Provide anti-fatigue mats for shearers. Vaccinate against orf. Avoid overcrowding in pens. Use sheepdog to reduce manual handling.',
    legal_requirements: 'Manual Handling Operations Regulations 1992 apply to sheep lifting. COSHH 2002 for zoonotic disease risks.',
    ppe_required: 'Boots with good grip, gloves for handling medicated sheep',
    regulation_ref: 'Manual Handling Regulations 1992; COSHH 2002; HSE AIS34',
  },
  {
    topic: 'Sheep dipping safety',
    machine_type: null,
    species: 'sheep',
    hazards: 'Organophosphate (OP) poisoning from sheep dip concentrate and splash. Absorbed through skin, symptoms include headache, nausea, muscle twitching, breathing difficulty. Long-term neurological effects reported. Drowning of sheep in dip bath.',
    control_measures: 'Use OP alternatives where possible (pour-on, injectable treatments). If dipping: follow HSE guidance strictly. Handle concentrate in ventilated area. Double-bag empty containers. Shower immediately after dipping session. Monitor cholinesterase levels in blood for regular dippers. Ensure dip bath has step and ramp for sheep exit.',
    legal_requirements: 'COSHH 2002 requires formal assessment before use. Specific HSE guidance note (AIS16) on dipping. The Sheep Dipping (Authorisation) Order (NI) requires approval. Environmental permits for dip disposal.',
    ppe_required: 'Chemical-resistant gloves (nitrile, full length), face shield, chemical-resistant apron, wellington boots, coveralls',
    regulation_ref: 'COSHH 2002; HSE AIS16; Environmental Permitting Regulations 2016',
  },
  {
    topic: 'Pig handling and boar management',
    machine_type: null,
    species: 'pigs',
    hazards: 'Biting (boars have sharp tusks). Crushing against pen walls. Respiratory hazards from dust and ammonia in pig housing. Zoonotic diseases (erysipelas, leptospirosis, MRSA). Aggression during farrowing.',
    control_measures: 'Use pig boards for moving pigs (never chase). Maintain boar tusks (trim regularly by vet). Ensure adequate pen space. Use farrowing crate to protect handler during piglet management. Ventilate pig housing to reduce ammonia below 25 ppm. Maintain hygiene protocols.',
    legal_requirements: 'MHSW Regulations 1999 require risk assessment. COSHH 2002 for ammonia and dust exposure. Welfare of Farmed Animals (England) Regulations 2007 set space allowances.',
    ppe_required: 'Steel-toe boots, boar board/shield, dust mask in enclosed housing',
    regulation_ref: 'MHSW Regulations 1999; COSHH 2002; HSE INDG126',
  },
  {
    topic: 'Horse handling on farms',
    machine_type: null,
    species: 'horses',
    hazards: 'Kicking (rear legs can strike with lethal force). Biting. Crushing against stable walls. Bolting when startled. Trampling. Falls from horseback.',
    control_measures: 'Approach from the front-quarter so horse can see you. Speak to alert horse of presence. Use headcollar and lead rope for control. Keep fingers out of rope loops. Stand to the side when handling rear legs. Ensure stable doors open outward. Use protective footwear.',
    legal_requirements: 'MHSW Regulations 1999 apply. Animals Act 1971 establishes strict liability for damage by known dangerous animals.',
    ppe_required: 'Hard hat to BS/EN 1384 when riding. Steel-toe boots when handling.',
    regulation_ref: 'MHSW Regulations 1999; Animals Act 1971; BHS safety guidance',
  },
];

for (const l of livestockData) {
  db.run(
    `INSERT INTO safety_guidance (topic, machine_type, species, hazards, control_measures, legal_requirements, ppe_required, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [l.topic, l.machine_type, l.species, l.hazards, l.control_measures, l.legal_requirements, l.ppe_required, l.regulation_ref, 'GB']
  );
}
console.log(`Inserted ${livestockData.length} livestock safety entries`);

// ─── Children on Farms Rules ───────────────────────────────────────────────

const childrenData = [
  {
    age_group: 'under-13',
    activity: 'Riding or driving tractors',
    permitted: 0,
    conditions: 'Absolutely prohibited. Children under 13 must not ride on or drive agricultural tractors or self-propelled machines.',
    regulation_ref: 'Children in Agriculture Regulations (CHAW) 1998 reg. 3',
  },
  {
    age_group: 'under-13',
    activity: 'Operating or riding on machinery',
    permitted: 0,
    conditions: 'Prohibited. No child under 13 may operate any agricultural machine or ride on implements.',
    regulation_ref: 'CHAW 1998 reg. 3',
  },
  {
    age_group: 'under-13',
    activity: 'Working with livestock (bulls, boars, stallions)',
    permitted: 0,
    conditions: 'Prohibited. No child under 13 may work with bulls, boars, stallions, or recently calved/farrowed animals.',
    regulation_ref: 'CHAW 1998 reg. 3',
  },
  {
    age_group: 'under-13',
    activity: 'Visiting the farm as family member',
    permitted: 1,
    conditions: 'Permitted but must be supervised at all times and kept away from working machinery, livestock handling areas, slurry stores, and other hazards. Fenced play area recommended.',
    regulation_ref: 'HSWA 1974 s.3; HSE AIS10',
  },
  {
    age_group: '13-15',
    activity: 'Driving tractors',
    permitted: 0,
    conditions: 'Prohibited on the road. May drive tractors on the farm only if: (a) tractor has ROPS and seatbelt, (b) they have received adequate training, (c) under close supervision of experienced adult. Cannot tow implements in public places.',
    regulation_ref: 'CHAW 1998 reg. 4; Road Traffic Act 1988',
  },
  {
    age_group: '13-15',
    activity: 'Operating machinery (non-tractor)',
    permitted: 1,
    conditions: 'Permitted only with: (a) adequate training on the specific machine, (b) direct supervision by experienced person, (c) guards and safety devices in place. Excludes chainsaw use and work at height.',
    regulation_ref: 'CHAW 1998 reg. 4',
  },
  {
    age_group: '13-15',
    activity: 'Working with livestock',
    permitted: 1,
    conditions: 'Permitted with quiet stock only. Must not work with bulls over 10 months, boars, stallions, or recently calved/farrowed animals. Must have training and supervision.',
    regulation_ref: 'CHAW 1998 reg. 4; HSE AIS10',
  },
  {
    age_group: '16-17',
    activity: 'Driving tractors',
    permitted: 1,
    conditions: 'Permitted on-farm with ROPS-fitted tractor after completing recognised training (e.g. Lantra Awards). May drive on roads at 16 with category F licence. Full training record must be maintained.',
    regulation_ref: 'CHAW 1998; Road Traffic Act 1988; Lantra Awards',
  },
  {
    age_group: '16-17',
    activity: 'Operating machinery and equipment',
    permitted: 1,
    conditions: 'Permitted after adequate training. Must hold certificate of competence for chainsaw use. Employer must assess competence and maintain training records. Not permitted to work in confined spaces without specific training.',
    regulation_ref: 'CHAW 1998; PUWER 1998; HSE AIS10',
  },
  {
    age_group: '16-17',
    activity: 'Working with livestock',
    permitted: 1,
    conditions: 'Permitted including work with bulls if trained and supervised. Must complete livestock handling training. Risk assessment required for work with known aggressive animals.',
    regulation_ref: 'CHAW 1998; MHSW Regulations 1999',
  },
];

for (const c of childrenData) {
  db.run(
    `INSERT INTO children_rules (age_group, activity, permitted, conditions, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [c.age_group, c.activity, c.permitted, c.conditions, c.regulation_ref, 'GB']
  );
}
console.log(`Inserted ${childrenData.length} children on farms rules`);

// ─── COSHH Guidance ────────────────────────────────────────────────────────

const coshhData = [
  {
    substance_type: 'Pesticides (herbicides, fungicides, insecticides)',
    activity: 'Spraying and application',
    assessment_required: 1,
    ppe: 'Chemical-resistant gloves, coveralls, face shield or goggles, respiratory protection (type depends on product), boots',
    storage_requirements: 'Locked store with bunded floor (110% capacity). Away from watercourses. Product data sheets accessible. COSHH assessment displayed.',
    disposal_requirements: 'Triple-rinse containers and recycle via approved scheme. Do not burn or bury. Unused product returned to supplier or disposed via licensed waste contractor.',
    regulation_ref: 'COSHH 2002; Plant Protection Products (Sustainable Use) Regulations 2012; HSE AIS16',
  },
  {
    substance_type: 'Sheep dip (organophosphate-based)',
    activity: 'Sheep dipping',
    assessment_required: 1,
    ppe: 'Full-length chemical-resistant gloves (not latex), face shield, chemical-resistant apron or coveralls, wellington boots. Shower after each session.',
    storage_requirements: 'Original container only. Locked store. Never decant into food containers. Keep COSHH data sheet with product.',
    disposal_requirements: 'Spent dip is hazardous waste. Dispose via licensed waste contractor. Never discharge to watercourse, drain, or land (Environment Agency offence).',
    regulation_ref: 'COSHH 2002; HSE AIS16; Environmental Permitting Regulations 2016',
  },
  {
    substance_type: 'Veterinary medicines (antibiotics, vaccines, anthelmintics)',
    activity: 'Animal treatment and administration',
    assessment_required: 1,
    ppe: 'Gloves when handling. Needle-proof container for sharps. Eye protection when using pour-on products.',
    storage_requirements: 'Locked medicine cabinet. Refrigerated where required. Record all medicines in medicine book (legal requirement under VMR 2013).',
    disposal_requirements: 'Return unused medicines to vet or pharmacy. Sharps in approved sharps container. Do not dispose in general waste.',
    regulation_ref: 'COSHH 2002; Veterinary Medicines Regulations 2013; HSE guidance on zoonotic risks',
  },
  {
    substance_type: 'Diesel and fuel oil',
    activity: 'Storage, handling, and refuelling',
    assessment_required: 1,
    ppe: 'Gloves (nitrile). No smoking. Eye wash station nearby for splash incidents.',
    storage_requirements: 'Above-ground tanks must comply with Oil Storage Regulations (secondary containment, 110% bund capacity). Below-ground tanks require leak detection. At least 10 m from watercourse.',
    disposal_requirements: 'Waste oil collected by licensed waste oil contractor. Spills reported to Environment Agency (0800 807060). Spill kit kept at storage point.',
    regulation_ref: 'COSHH 2002; Oil Storage Regulations 2001; SSAFO 2010',
  },
  {
    substance_type: 'Ammonia and hydrogen sulphide (slurry gases)',
    activity: 'Slurry agitation, storage, and spreading',
    assessment_required: 1,
    ppe: 'Personal H2S gas detector (mandatory during agitation). Self-contained breathing apparatus (SCBA) available for emergency rescue. Never enter confined spaces without gas testing.',
    storage_requirements: 'Slurry stores must meet SSAFO 2010 construction standards. Guard rails around lagoons and reception pits. Warning signs displayed.',
    disposal_requirements: 'Spread according to NVZ (Nitrate Vulnerable Zone) rules. Do not spread within 10 m of watercourse (50 m for slurry). Closed period restrictions apply.',
    regulation_ref: 'COSHH 2002; Confined Spaces Regulations 1997; SSAFO 2010; NVZ Regulations',
  },
  {
    substance_type: 'Grain dust',
    activity: 'Grain handling, drying, and storage',
    assessment_required: 1,
    ppe: 'FFP2 dust mask minimum (FFP3 for prolonged exposure). Eye protection. Hearing protection near dryers.',
    storage_requirements: 'Minimise dust accumulation (explosion risk under DSEAR). Maintain ventilation in grain stores. Regular cleaning regime.',
    disposal_requirements: 'Dust sweepings can be composted. In enclosed spaces, dust extraction equipment required.',
    regulation_ref: 'COSHH 2002; DSEAR 2002; Workplace Exposure Limits EH40',
  },
  {
    substance_type: 'Wood preservatives (creosote, CCA-treated timber)',
    activity: 'Fencing, construction, timber treatment',
    assessment_required: 1,
    ppe: 'Chemical-resistant gloves. Coveralls when handling freshly treated timber. Dust mask (FFP2) when cutting treated timber.',
    storage_requirements: 'Treated timber stored on hard standing away from watercourses. Creosote stored in original containers in bunded area.',
    disposal_requirements: 'CCA-treated timber must not be burned (releases arsenic). Dispose via licensed waste contractor. Creosote containers returned to supplier.',
    regulation_ref: 'COSHH 2002; HSE guidance on wood preservatives; Environmental Permitting Regulations 2016',
  },
  {
    substance_type: 'Rodenticides (anticoagulant poisons)',
    activity: 'Pest control and bait stations',
    assessment_required: 1,
    ppe: 'Gloves when handling bait. Wash hands after handling. Keep antidote (Vitamin K) information available.',
    storage_requirements: 'Locked store, separate from food and animal feed. COSHH data sheet available. Record all bait placements.',
    disposal_requirements: 'Collect dead rodents and unused bait. Dispose as hazardous waste. Do not leave exposed bait where non-target species can access.',
    regulation_ref: 'COSHH 2002; CRRU (Campaign for Responsible Rodenticide Use) Code of Best Practice; HSE guidance',
  },
];

for (const c of coshhData) {
  db.run(
    `INSERT INTO coshh_guidance (substance_type, activity, assessment_required, ppe, storage_requirements, disposal_requirements, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [c.substance_type, c.activity, c.assessment_required, c.ppe, c.storage_requirements, c.disposal_requirements, c.regulation_ref, 'GB']
  );
}
console.log(`Inserted ${coshhData.length} COSHH guidance entries`);

// ─── Reporting Requirements (RIDDOR) ──────────────────────────────────────

const reportingData = [
  {
    incident_type: 'Fatal injuries',
    reportable: 1,
    deadline: 'Immediately by phone, followed by written report within 10 days',
    notify: 'HSE Incident Contact Centre (0345 300 9923)',
    method: 'Telephone immediately, then online form (F2508) within 10 days',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 6',
  },
  {
    incident_type: 'Specified injuries (fractures, amputations, loss of sight, crush injuries, scalping, burns)',
    reportable: 1,
    deadline: 'Without delay (as soon as reasonably practicable), written report within 10 days',
    notify: 'HSE Incident Contact Centre (0345 300 9923)',
    method: 'Online form (F2508) at www.hse.gov.uk/riddor. Phone if no internet access.',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 4; Schedule 1',
  },
  {
    incident_type: 'Over-7-day incapacitation',
    reportable: 1,
    deadline: 'Within 15 days of the incident',
    notify: 'HSE via online reporting',
    method: 'Online form (F2508) at www.hse.gov.uk/riddor',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 4(2)',
  },
  {
    incident_type: 'Dangerous occurrences (overturning of agricultural vehicles, collapse of building, electrical short circuit causing fire)',
    reportable: 1,
    deadline: 'Without delay, written report within 10 days',
    notify: 'HSE Incident Contact Centre (0345 300 9923)',
    method: 'Online form (F2508). Overturning of a ROPS-fitted tractor or self-propelled agricultural vehicle is specifically listed.',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 7; Schedule 2 Part 1 para. 15 (agricultural)',
  },
  {
    incident_type: 'Occupational diseases (farmers lung, occupational asthma, leptospirosis, occupational dermatitis)',
    reportable: 1,
    deadline: 'As soon as employer receives written diagnosis from doctor',
    notify: 'HSE via online reporting',
    method: 'Online form (F2508A) at www.hse.gov.uk/riddor',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 8; Schedule 3',
  },
  {
    incident_type: 'Gas incidents (carbon monoxide from grain dryers, methane/H2S from slurry)',
    reportable: 1,
    deadline: 'Without delay',
    notify: 'HSE Incident Contact Centre (0345 300 9923) and Gas Safe Register if applicable',
    method: 'Online form (F2508G) for gas incidents. Any gas incident causing death, loss of consciousness, or requiring hospital treatment.',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 10',
  },
  {
    incident_type: 'Non-fatal injuries to members of public (visitors, ramblers on farm land)',
    reportable: 1,
    deadline: 'Without delay, written report within 10 days',
    notify: 'HSE via online reporting',
    method: 'Online form (F2508). Report if person taken from farm to hospital for treatment.',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 5',
  },
];

for (const r of reportingData) {
  db.run(
    `INSERT INTO reporting_requirements (incident_type, reportable, deadline, notify, method, record_retention_years, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [r.incident_type, r.reportable, r.deadline, r.notify, r.method, r.record_retention_years, r.regulation_ref, 'GB']
  );
}
console.log(`Inserted ${reportingData.length} RIDDOR reporting entries`);

// ─── Risk Assessment Templates ────────────────────────────────────────────

const riskAssessmentData = [
  {
    activity: 'Tractor operation',
    hazards: 'Overturning on slopes and soft ground; PTO entanglement; falling from cab; runaway tractor; collision with other vehicles or persons',
    controls: 'ROPS fitted and maintained; seatbelt worn; PTO guards in place; handbrake applied when stopped; keys removed when unattended; speed appropriate for conditions; mirrors adjusted; three-point contact when mounting/dismounting',
    residual_risk: 'Low (with controls in place). Residual risk increases on steep terrain or when carrying front-loader.',
    review_frequency: 'Annual, or after any incident or change in operating conditions',
  },
  {
    activity: 'Cattle handling',
    hazards: 'Crushing by animal; kicking; head butting; trampling; falling in pen; zoonotic disease transmission',
    controls: 'Purpose-built handling facility with crush and race; escape gaps in race fencing; non-slip flooring; calm approach; do not overcrowd collecting pen; wash hands after handling; pregnant women avoid calving cows',
    residual_risk: 'Medium. Cattle behaviour is unpredictable. Additional caution with bulls, newly calved cows, and cows with calves at foot.',
    review_frequency: 'Annual, or after change in herd, facility, or any incident',
  },
  {
    activity: 'Working at height (silos, grain stores, barn roofs)',
    hazards: 'Falls from ladders, platforms, and fragile roof materials; engulfment in stored grain; falling objects; dust inhalation in confined grain stores',
    controls: 'Use mobile elevated work platform (MEWP) instead of ladders where possible; edge protection on platforms; do not walk on fragile roofing without crawling boards; never enter grain bin while auger running; rescue plan in place for grain engulfment; FFP2 dust mask in grain stores',
    residual_risk: 'High (falls from height are a leading cause of farm death). Constant vigilance required.',
    review_frequency: 'Before each task, annually for general assessment',
  },
  {
    activity: 'Confined spaces (slurry pits, silos, tanks)',
    hazards: 'Toxic gases (H2S, methane, CO2, ammonia); oxygen depletion; drowning in slurry; inability to self-rescue; rapid onset of unconsciousness from H2S',
    controls: 'NEVER enter without permit-to-work system; continuous gas monitoring; trained rescue team with SCBA on standby; mechanical ventilation before entry; safety harness with lifeline; communication system; emergency plan displayed; evacuate livestock before slurry agitation',
    residual_risk: 'Very high without controls. Even with controls, confined space entry remains high risk. Avoid entry wherever possible (use long-reach tools, remote cameras).',
    review_frequency: 'Before each entry. Annual review of permit-to-work system.',
  },
  {
    activity: 'Lone working',
    hazards: 'Delayed rescue after injury; inability to summon help; medical emergencies; violence from trespassers; equipment failure in remote location',
    controls: 'Buddy system (check-in calls at set intervals); personal locator device or mobile phone; inform someone of location and expected return time; first aid kit carried; avoid high-risk tasks when alone (e.g. chainsaw work, confined space entry, bull handling)',
    residual_risk: 'Medium. Cannot eliminate lone working on most farms, but risk reduced through communication protocols.',
    review_frequency: 'Annual. Review after any incident or near-miss during lone working.',
  },
  {
    activity: 'Chainsaw use',
    hazards: 'Kickback causing deep lacerations; falling trees and branches; noise-induced hearing loss; hand-arm vibration syndrome (HAVS); tripping on undergrowth',
    controls: 'Operator holds NPTC/City & Guilds certificate; full chainsaw PPE worn; pre-use checks (chain tension, brake, bar condition); drop zone cleared; escape route planned; work with colleague when felling; regular maintenance; vibration exposure monitored',
    residual_risk: 'Medium with full PPE and training. High if any control measure missing.',
    review_frequency: 'Before each use session. Annual review of operator competence and PPE condition.',
  },
  {
    activity: 'Pesticide application',
    hazards: 'Skin absorption causing poisoning; eye splash; inhalation of spray drift; contamination of water sources; harm to bystanders; long-term health effects from chronic exposure',
    controls: 'COSHH assessment before use; read product label and safety data sheet; use correct PPE per product requirements; calibrate sprayer before use; spray in low wind conditions; observe buffer zones near water; record all applications in spray diary; hold PA1/PA2 certificate (or PA6 for handheld)',
    residual_risk: 'Low with PPE and training. Risk increases with concentrate handling and equipment maintenance.',
    review_frequency: 'Before each application. Annual review of COSHH assessment.',
  },
  {
    activity: 'Grain storage and handling',
    hazards: 'Engulfment in flowing grain; dust explosion (DSEAR); respiratory disease from grain dust and mycotoxins; falls from height on grain heaps; auger entanglement',
    controls: 'Never enter grain bin while grain is flowing; lock out auger before entry; gas test before entering enclosed stores; FFP3 mask for prolonged exposure; maintain dust extraction; clean dust accumulations regularly; guarded access points on augers; buddy system for bin entry',
    residual_risk: 'High for bin entry (grain engulfment can be fatal in seconds). Low for routine handling with controls.',
    review_frequency: 'Annual. Before harvest season (pre-season inspection of stores and equipment).',
  },
];

for (const r of riskAssessmentData) {
  db.run(
    `INSERT INTO risk_assessment_templates (activity, hazards, controls, residual_risk, review_frequency, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [r.activity, r.hazards, r.controls, r.residual_risk, r.review_frequency, 'GB']
  );
}
console.log(`Inserted ${riskAssessmentData.length} risk assessment templates`);

// ─── FTS5 Search Index ────────────────────────────────────────────────────

// Index machinery guidance
for (const m of machineryData) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    [
      m.topic,
      `${m.hazards} ${m.control_measures} ${m.legal_requirements} ${m.ppe_required}`,
      'machinery',
      'GB',
    ]
  );
}

// Index livestock guidance
for (const l of livestockData) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    [
      l.topic,
      `${l.hazards} ${l.control_measures} ${l.legal_requirements} ${l.ppe_required}`,
      'livestock',
      'GB',
    ]
  );
}

// Index children rules
for (const c of childrenData) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    [
      `Children ${c.age_group}: ${c.activity}`,
      `${c.conditions} ${c.regulation_ref}`,
      'children',
      'GB',
    ]
  );
}

// Index COSHH guidance
for (const c of coshhData) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    [
      `COSHH: ${c.substance_type}`,
      `${c.activity}. PPE: ${c.ppe}. Storage: ${c.storage_requirements}. Disposal: ${c.disposal_requirements}`,
      'coshh',
      'GB',
    ]
  );
}

// Index RIDDOR reporting
for (const r of reportingData) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    [
      `RIDDOR: ${r.incident_type}`,
      `Reportable: ${r.reportable ? 'Yes' : 'No'}. Deadline: ${r.deadline}. Method: ${r.method}. Notify: ${r.notify}`,
      'riddor',
      'GB',
    ]
  );
}

// Index risk assessments
for (const r of riskAssessmentData) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    [
      `Risk Assessment: ${r.activity}`,
      `Hazards: ${r.hazards}. Controls: ${r.controls}. Residual risk: ${r.residual_risk}`,
      'risk-assessment',
      'GB',
    ]
  );
}

const totalFts =
  machineryData.length +
  livestockData.length +
  childrenData.length +
  coshhData.length +
  reportingData.length +
  riskAssessmentData.length;
console.log(`Indexed ${totalFts} entries in FTS5 search_index`);

// ─── Metadata ─────────────────────────────────────────────────────────────

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [today]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [today]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('source_version', 'HSE Agriculture 2024-2025')", []);

// ─── Coverage JSON ────────────────────────────────────────────────────────

const coverage = {
  mcp_name: 'UK Farm Safety MCP',
  jurisdiction: 'GB',
  build_date: today,
  safety_guidance_machinery: machineryData.length,
  safety_guidance_livestock: livestockData.length,
  children_rules: childrenData.length,
  coshh_guidance: coshhData.length,
  reporting_requirements: reportingData.length,
  risk_assessment_templates: riskAssessmentData.length,
  fts_entries: totalFts,
};

writeFileSync('data/coverage.json', JSON.stringify(coverage, null, 2));
console.log('Written data/coverage.json');

db.close();
console.log('Ingestion complete.');
