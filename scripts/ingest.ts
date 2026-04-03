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
  {
    topic: 'Mower and topper safety (PTO-driven)',
    machine_type: 'mower',
    species: null,
    hazards: 'PTO entanglement during connection or clearing blockages. Ejection of stones and debris at high velocity. Contact with rotating blades. Noise exceeding 85 dB.',
    control_measures: 'Ensure PTO guard covers full shaft length. Never clear blockages with engine running — disengage PTO, stop engine, remove key, and wait for all parts to stop. Keep bystanders at least 50 m away during mowing. Check field for stones, wire, and debris before mowing. Maintain blade condition to prevent imbalance.',
    legal_requirements: 'PUWER 1998 reg. 11 requires effective guarding of all dangerous parts including PTO. Noise at Work Regulations 2005 apply if exposure exceeds lower action value (80 dB).',
    ppe_required: 'Hearing protection, eye protection when inspecting, safety boots, close-fitting clothing',
    regulation_ref: 'PUWER 1998 reg. 11; Noise at Work Regulations 2005; HSE AIS40',
  },
  {
    topic: 'Grain storage entry — confined space and engulfment',
    machine_type: 'grain store',
    species: null,
    hazards: 'Grain engulfment — a person can become trapped in flowing grain within 4-5 seconds and fully submerged in under 20 seconds. CO2 accumulates in stored grain (displaces oxygen). Grain bridging creates false surface that collapses when stepped on. Dust explosion risk in enclosed spaces. Mycotoxin exposure from mouldy grain.',
    control_measures: 'Never enter a grain bin while grain is flowing or being moved. Lock out and tag out all auger and conveyor equipment before entry. Test atmosphere with multi-gas detector (O2, CO2, H2S) before entry. Never enter alone — have a trained standby person at all times with communication equipment. Use safety harness and lifeline attached to a suitable anchor. Never walk on grain surface (may be bridged). Use long-reach tools or mechanical methods instead of entering where possible. Ventilate bin for at least 24 hours after filling before entry.',
    legal_requirements: 'Confined Spaces Regulations 1997 apply — avoid entry where possible, follow safe system of work with permit-to-work if entry needed. DSEAR 2002 for dust explosion risk.',
    ppe_required: 'Multi-gas detector, safety harness with lifeline, FFP3 dust mask, safety boots. Standby person must have SCBA available.',
    regulation_ref: 'Confined Spaces Regulations 1997; DSEAR 2002; HSE AIS38; HSE INDG349',
  },
  {
    topic: 'Manure spreader safety',
    machine_type: 'manure spreader',
    species: null,
    hazards: 'PTO entanglement during connection or clearing blockages. Material ejection from spinning discs or beaters. Overturning on slopes when loaded (high centre of gravity). Bystander struck by ejected material. Leptospirosis and other infections from manure contact.',
    control_measures: 'Fit and maintain PTO guard (full-length shield). Never clear blockages with PTO running — stop engine and remove key. Maintain safe distance from ejection zone (at least 50 m for bystanders). Match spreader capacity to tractor rating. Avoid slopes when fully loaded. Wash hands and exposed skin immediately after contact with manure.',
    legal_requirements: 'PUWER 1998 reg. 11 for PTO guarding. COSHH 2002 for biological hazard assessment from manure. NVZ Regulations for spreading near watercourses.',
    ppe_required: 'Gloves, waterproof overalls, safety boots, eye protection when inspecting. Close-fitting clothing near PTO.',
    regulation_ref: 'PUWER 1998 reg. 11; COSHH 2002; NVZ Regulations; HSE AIS40',
  },
  {
    topic: 'Hedge cutter safety (tractor-mounted)',
    machine_type: 'hedge cutter',
    species: null,
    hazards: 'Ejection of debris including stones and wood at high velocity. Contact with cutting head during maintenance. Reduced road verge visibility for oncoming traffic when operating on highways. Overhead power line contact if boom raised too high.',
    control_measures: 'Check for overhead power lines before operating — maintain minimum 6 m clearance from power lines. Fit warning signs and flashing beacons when working on road verges. Stop engine before any maintenance on cutting head. Inspect hydraulic hoses daily — failure under pressure causes high-velocity fluid injection injury. Keep bystanders clear of ejection zone.',
    legal_requirements: 'PUWER 1998 reg. 11. New Roads and Street Works Act 1991 applies to road verge operations (chapter 8 signing required). Electricity at Work Regulations 1989 for overhead line proximity.',
    ppe_required: 'Eye protection, hearing protection, hard hat, safety boots',
    regulation_ref: 'PUWER 1998; Electricity at Work Regulations 1989; HSE GS6 (overhead lines)',
  },
  {
    topic: 'Forklift truck on farms (rough terrain)',
    machine_type: 'forklift',
    species: null,
    hazards: 'Overturning on uneven or soft ground. Load falling from forks. Collision with persons on foot. Different stability characteristics from warehouse forklifts — farm forklifts operate on slopes, mud, and uneven surfaces. Crushing when load shifts on slope.',
    control_measures: 'Only trained operators (CPCS, NPORS, or Lantra-certificated). Always use seatbelt. Travel with forks low and tilted back. Reduce speed on slopes and uneven ground. Never lift loads on a slope unless equipment is specifically rated for it. Implement pedestrian exclusion zones during loading. Carry out daily pre-use checks. Use orange flashing beacon for visibility.',
    legal_requirements: 'PUWER 1998 requires adequate training. LOLER 1998 requires 12-monthly thorough examination. ACoP L117 provides guidance on operator training.',
    ppe_required: 'Seatbelt for operator. Hard hat and high-visibility vest for pedestrians in vicinity.',
    regulation_ref: 'PUWER 1998; LOLER 1998; ACoP L117; HSE INDG392',
  },
  {
    topic: 'UTV (utility task vehicle) and side-by-side safety',
    machine_type: 'utv',
    species: null,
    hazards: 'Rollover on slopes and rough terrain. Ejection of occupants if not wearing seatbelt. Excessive speed on tracks and farm roads. Overloading cargo bed shifts centre of gravity. UTVs are safer than ATVs but still prone to rollover if driven recklessly.',
    control_measures: 'Wear seatbelt at all times (UTVs have ROPS as standard). Complete manufacturer training or Lantra UTV course. Do not exceed load rating on cargo bed. Reduce speed on slopes, rough ground, and near buildings. Secure loads. Only carry passengers if vehicle has designated passenger seats. Children under 13 must not ride as passengers on working UTVs.',
    legal_requirements: 'PUWER 1998 requires adequate training. ATVs (single-seat quads) must never carry passengers — UTVs with ROPS and passenger seats are the safer alternative. Children under 13 prohibited from operating any self-propelled machine on farms (CHAW 1998).',
    ppe_required: 'Seatbelt (mandatory), helmet recommended on open terrain, safety boots',
    regulation_ref: 'PUWER 1998; CHAW 1998; HSE AIS33; HSE INDG466',
  },
  {
    topic: 'Silo filling and top-unloading — silo gas',
    machine_type: 'silo',
    species: null,
    hazards: 'Nitrogen dioxide (NO2, silo gas) forms within hours of filling corn or grass silage and peaks in the first 48 hours. Silo gas is heavier than air, reddish-brown, and lethal at concentrations above 25 ppm. Exposure causes pulmonary oedema — death can occur within minutes. Delayed onset pulmonary damage (silo-filler disease) may appear 2-6 weeks after exposure even without immediate symptoms. Falls from silo ladders and platforms.',
    control_measures: 'Stay away from silo for at least 48 hours after filling. If entry is essential, ventilate with forced-air blower for at least 30 minutes and test atmosphere with NO2 detector before entry. Run silo blower for at least 15 minutes before entering and keep it running during entry. Never enter alone. If reddish-brown gas or bleach-like smell is detected, evacuate immediately. Post warning signs on silo during filling period. Seek medical attention after any NO2 exposure — delayed symptoms are common.',
    legal_requirements: 'Confined Spaces Regulations 1997 apply. COSHH 2002 requires assessment of NO2 exposure risk. Workplace Exposure Limit for NO2 is 0.5 ppm (8-hour TWA).',
    ppe_required: 'Self-contained breathing apparatus (SCBA) for entry within 48 hours of filling. NO2 gas detector. Safety harness with lifeline.',
    regulation_ref: 'Confined Spaces Regulations 1997; COSHH 2002; EH40 (WELs); HSE AIS29',
  },
  {
    topic: 'Falls from height on farms',
    machine_type: null,
    species: null,
    hazards: 'Falls from barn roofs (particularly fragile roofing materials such as asbestos cement and fibre cement sheets that cannot support body weight). Falls from silos, grain stores, straw and hay stacks. Falls from ladders. Falls through open floor holes in barns. Approximately 20% of farm fatalities involve falls from height.',
    control_measures: 'Use mobile elevated work platforms (MEWPs) instead of ladders where possible. Never walk on fragile roof surfaces without crawling boards and a safety harness. Use edge protection on flat roofs and platforms. Ensure fixed ladders are in good condition and secured at top. Stack hay and straw bales with stepped sides to prevent climbers falling from sheer face. Cover and mark open floor holes. Inspect roof condition before any access.',
    legal_requirements: 'Work at Height Regulations 2005 require: avoid work at height where possible, use proper equipment where it cannot be avoided, and mitigate the distance and consequences of a fall.',
    ppe_required: 'Safety harness with lanyard when no edge protection. Hard hat. Non-slip footwear.',
    regulation_ref: 'Work at Height Regulations 2005; HSE INDG401; HSE AIS22',
  },
  {
    topic: 'Electricity on farms — overhead lines and underground cables',
    machine_type: null,
    species: null,
    hazards: 'Electrocution from contact between machinery (combine headers, tipping trailers, telehandler booms, irrigation equipment) and overhead power lines. Electrocution from striking underground cables when digging. Electrical fire from damaged wiring in farm buildings. Electric shock from portable equipment used outdoors in wet conditions.',
    control_measures: 'Identify all overhead power lines and mark with permanent warning signs on approach routes. Maintain minimum 6 m clearance for all machinery (15 m for 132 kV lines). Use goal posts or height barriers at field entrances near overhead lines. Contact electricity distribution company for advice on route planning. Use CAT (cable avoidance tool) and plans before digging. Install RCD (residual current device) protection on all farm power circuits. Use 110V reduced-voltage equipment in wet conditions.',
    legal_requirements: 'Electricity at Work Regulations 1989 require systems to be maintained to prevent danger. HSE guidance GS6 specifically addresses overhead line proximity on farms.',
    ppe_required: 'Insulated footwear when working near electrical installations. RCD on all portable equipment.',
    regulation_ref: 'Electricity at Work Regulations 1989; HSE GS6; HSE INDG354',
  },
  {
    topic: 'Farm workshop safety — welding, grinding, and hydraulics',
    machine_type: null,
    species: null,
    hazards: 'Arc eye (photokeratitis) from welding without eye protection. Burns from welding spatter and hot metal. Fire risk from sparks contacting combustible materials. Hand and eye injuries from angle grinder discs. Hydraulic fluid injection injury from failed hoses (fluid penetrates skin at pressures above 100 bar and causes necrosis). Noise exceeding 85 dB from grinding.',
    control_measures: 'Weld only in ventilated area or use local exhaust ventilation (LEV). Use welding screens to protect bystanders. Keep fire extinguisher within 2 m of welding area. Clear combustible materials from 5 m radius. Never look at welding arc without appropriate shade filter. Inspect angle grinder guards and discs before use — never remove guard. Release hydraulic pressure before disconnecting hoses. Never use hands to check for hydraulic leaks — use cardboard.',
    legal_requirements: 'PUWER 1998 for work equipment. COSHH 2002 for welding fumes. Noise at Work Regulations 2005 for grinding.',
    ppe_required: 'Welding: shield with shade 10-13 filter, leather gauntlets, leather apron, safety boots. Grinding: face shield or goggles (BS EN 166), hearing protection, leather gloves.',
    regulation_ref: 'PUWER 1998; COSHH 2002; Noise at Work Regulations 2005; HSE INDG291',
  },
  {
    topic: 'Farm vehicle transport on public roads',
    machine_type: null,
    species: null,
    hazards: 'Collision with other road users due to slow speed and wide loads. Poor visibility of farm vehicles (especially at dusk or dawn). Overturning when towing heavy trailers. Load shedding from inadequately secured trailers. Mud on road surface causing skidding.',
    control_measures: 'Fit all required lights, reflectors, and mirrors to tractors and trailers (Road Vehicles Lighting Regulations 1989). Use flashing amber beacon. Ensure trailer brakes are connected and tested. Secure all loads. Clean mud from public roads (failure is an offence). Use escort vehicle for overwidth loads. Plan routes to avoid narrow roads and sharp bends. Use banksman when reversing, especially on public roads.',
    legal_requirements: 'Road Traffic Act 1988 applies. Road Vehicles (Construction and Use) Regulations 1986 set weight, width, and lighting requirements. Highways Act 1980 s.148 makes depositing mud on road an offence.',
    ppe_required: 'High-visibility vest when on foot near road. Seatbelt in tractor cab.',
    regulation_ref: 'Road Traffic Act 1988; Road Vehicles Lighting Regulations 1989; Highways Act 1980 s.148',
  },
  {
    topic: 'Zoonotic diseases on farms',
    machine_type: null,
    species: null,
    hazards: 'Leptospirosis (from rat urine and cattle urine — causes kidney failure, can be fatal). Cryptosporidiosis (from calf diarrhoea — severe gastroenteritis). Q fever (Coxiella burnetii — from sheep, cattle, and goat birth products — causes flu-like illness, chronic fatigue, heart valve infection). Ringworm (dermatophyte fungal infection from cattle). Orf (parapoxvirus from sheep — painful skin lesions on hands). Chlamydial abortion (Chlamydia abortus — from sheep afterbirth, causes miscarriage in pregnant women). E. coli O157 (from cattle faeces — potentially fatal in children).',
    control_measures: 'Wash hands thoroughly with soap and water after all animal contact and before eating, drinking, or smoking. Cover all cuts and abrasions with waterproof dressings before handling animals. Wear gloves for calving, lambing, and handling afterbirth. Pregnant women MUST NOT assist with lambing or have contact with sheep afterbirth (risk of chlamydial abortion causing miscarriage). Report symptoms to GP and inform them of farm work. Control rat populations to reduce leptospirosis risk. Clean and disinfect cattle handling areas regularly.',
    legal_requirements: 'COSHH 2002 requires risk assessment for biological agents. HSE guidance on zoonotic risks in agriculture. Leptospirosis, Q fever, and chlamydial abortion are reportable occupational diseases under RIDDOR 2013.',
    ppe_required: 'Waterproof gloves, arm-length protectors for obstetric work, overalls, boots. Wash hands frequently. Waterproof dressings on cuts.',
    regulation_ref: 'COSHH 2002; RIDDOR 2013 Schedule 3; HSE AIS2; HSE INDG349',
  },
  {
    topic: 'Lambing safety — zoonotic and physical hazards',
    machine_type: null,
    species: 'sheep',
    hazards: 'Chlamydial abortion (Chlamydia abortus) — pregnant women who have contact with sheep during lambing risk miscarriage, stillbirth, or life-threatening infection. This is not a theoretical risk: cases occur every year in the UK. Enzootic abortion of ewes (EAE) is the most common infectious cause of sheep abortion. Q fever from birth fluids. Toxoplasmosis risk during lambing. Manual handling injuries from lifting ewes and lambs. Fatigue from extended hours and night working. Dog attacks on lambing ewes (report to police under Dogs (Protection of Livestock) Act 1953).',
    control_measures: 'PREGNANT WOMEN MUST NOT ASSIST WITH LAMBING OR HAVE CONTACT WITH NEWBORN LAMBS OR AFTERBIRTH. This applies to farmers, family members, farm workers, veterinary staff, and visitors. Wear disposable gloves and arm-length protectors when assisting lambing. Wash hands immediately after handling ewes or lambs. Dispose of afterbirth promptly (burn or deep-bury). Vaccinate flock against EAE and toxoplasmosis. Plan rotas to limit fatigue during lambing season. Keep dogs under control or excluded from lambing areas.',
    legal_requirements: 'COSHH 2002 requires assessment of biological hazards. HSE has issued specific guidance (AIS25, Farmwise INDG349) warning pregnant women to avoid sheep at lambing time. Employer has duty under MHSW Regulations 1999 to protect new and expectant mothers.',
    ppe_required: 'Disposable gloves and arm-length protectors. Overalls. Wellington boots (dedicated lambing boots). Waterproof dressings on cuts.',
    regulation_ref: 'COSHH 2002; MHSW Regulations 1999 reg. 16; HSE AIS25; HSE INDG349',
  },
  {
    topic: 'Harvest safety — fatigue, fire, and machinery',
    machine_type: 'combine',
    species: null,
    hazards: 'Fatigue from long working hours (16-18 hour days are common during harvest) leading to poor decision-making and slow reactions. Fire risk from dry crop material on hot engine parts and exhaust — combine fires can destroy an entire standing crop. Grain dust inhalation causing respiratory problems. PTO entanglement on trailed machinery. Grain cart and trailer collision risk on headlands. Children in or near harvest machinery.',
    control_measures: 'Plan shift patterns to limit continuous driving to 12 hours maximum. Take regular breaks. Keep fire extinguisher on combine (minimum 6 kg dry powder) and check daily. Clean chaff and dust from engine bay, exhaust, and turbo housing at least twice daily in hot conditions. Keep children away from harvest machinery at all times. Use radios or phones to coordinate trailer changes. Check field edges for public footpaths before starting.',
    legal_requirements: 'MHSW Regulations 1999 require risk assessment including fatigue as a hazard. CHAW 1998 prohibits children under 13 from operating or riding on agricultural machines.',
    ppe_required: 'Dust mask (FFP2) during prolonged grain handling. Hearing protection in cab if noise exceeds 80 dB. Safety boots.',
    regulation_ref: 'MHSW Regulations 1999; CHAW 1998; HSE AIS38; Farm Safety Foundation',
  },
  {
    topic: 'Silage making — effluent, silo gas, and clamp face',
    machine_type: null,
    species: null,
    hazards: 'Silage effluent (pH 3.5-4.5) is toxic if ingested, corrodes concrete, and is 200 times more polluting than raw sewage if it reaches a watercourse. Silo gas (nitrogen dioxide) forms in the first 12-48 hours after filling and is lethal. Falls from silage clamp face when sheeting, weighting, or feeding out (unsupported clamp face can collapse without warning). Suffocation if buried under collapsing silage. Run-over by vehicles on clamp.',
    control_measures: 'Contain all silage effluent in sealed collection tank (SSAFO-compliant). Stay away from tower silos for 48 hours after filling. Sheet clamps from the bottom up; never stand on unsupported clamp face when feeding out — undercut from below. Use vehicle-mounted shear grabs rather than climbing on clamp. Place tyres or gravel bags to weight sheets — never use old machinery. Keep children away from silage clamps.',
    legal_requirements: 'SSAFO 2010 (Silage, Slurry and Agricultural Fuel Oil Regulations) sets construction and containment standards. Confined Spaces Regulations 1997 apply to silo entry. Environmental Permitting Regulations apply to effluent discharge.',
    ppe_required: 'Safety boots with ankle support. Hard hat when feeding out from clamp face. Gloves.',
    regulation_ref: 'SSAFO 2010; Confined Spaces Regulations 1997; Environmental Permitting Regulations 2016; HSE AIS29',
  },
  {
    topic: 'Pesticide application — NPTC certification and re-entry intervals',
    machine_type: 'sprayer',
    species: null,
    hazards: 'Acute poisoning from skin absorption, inhalation, or eye splash (organophosphate and carbamate insecticides are the highest acute risk). Chronic health effects from repeated low-level exposure (neurological, reproductive, cancer risk for some substances). Spray drift affecting bystanders, residents, and watercourses. Contamination of water supplies. Allergic sensitisation to some fungicides.',
    control_measures: 'Operator must hold NPTC (National Proficiency Tests Council) PA1 foundation certificate plus PA2 (tractor-mounted) or PA6 (handheld). Read product label and safety data sheet before every application. Calibrate sprayer before use. Spray in low wind conditions (below Beaufort 3). Observe statutory buffer zones near water (minimum 5 m, product-specific may be wider). Record all applications in spray diary (legal requirement). Observe re-entry intervals — do not enter treated fields until spray has dried and any specified re-entry period has elapsed. Triple-rinse spray tank after use.',
    legal_requirements: 'Plant Protection Products (Sustainable Use) Regulations 2012 require certified operators. COSHH 2002 requires formal risk assessment. Water Environment (Water Framework Directive) Regulations 2017 protect watercourses.',
    ppe_required: 'As specified on product label — typically: chemical-resistant gloves (nitrile), coveralls, face shield or goggles, respiratory protection (at minimum P3 particulate filter for solids, A2/P3 combined for liquids). Rubber boots.',
    regulation_ref: 'Plant Protection Products (Sustainable Use) Regulations 2012; COSHH 2002; HSE AIS16; NRoSO',
  },
  {
    topic: 'Working with bulls — confinement and handling',
    machine_type: null,
    species: 'cattle',
    hazards: 'Bulls cause a disproportionate number of fatal farm incidents despite being a small fraction of cattle handled. Dairy breed bulls (Holstein, Friesian, Jersey, Guernsey, Ayrshire) are statistically more dangerous than beef breed bulls. Attacks are often without warning — bulls that have been hand-reared or appear docile can attack suddenly. Goring, crushing against walls, trampling. Risk increases with age, particularly after 10 months.',
    control_measures: 'Never trust a bull regardless of temperament or past behaviour. Use a purpose-built bull pen with self-locking yoke/feed barrier that allows safe feeding and veterinary access without entering the pen. Fit nose ring at 10 months (fitted by veterinarian). Use bull pole and nose ring for any leading. Minimum two people when handling bulls at close quarters. Maintain escape routes — man-gaps (450 mm) in bull pen fencing. Display warning signs on field gates where bull is kept. Dairy breed bulls must not run at large in fields crossed by public rights of way.',
    legal_requirements: 'Wildlife and Countryside Act 1981 s.59 makes it an offence to keep a bull of a recognised dairy breed in a field crossed by a public right of way. HSWA 1974 general duty of care applies. Beef breed bulls over 10 months may be in public access fields only if accompanied by cows or heifers.',
    ppe_required: 'Steel-toe boots, hard hat. Bull handler stick and pole. Emergency escape route always planned.',
    regulation_ref: 'Wildlife and Countryside Act 1981 s.59; HSWA 1974; HSE AIS17; HSE INDG126',
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
  {
    substance_type: 'Silage effluent',
    activity: 'Silage making, clamp management, effluent collection',
    assessment_required: 1,
    ppe: 'Chemical-resistant gloves, waterproof overalls, safety boots, eye protection when handling or near open effluent channels.',
    storage_requirements: 'Effluent must be collected in sealed, SSAFO-compliant tank. Silage clamps must have impermeable base and sealed drainage to collection tank. Tanks must be inspected annually and maintained.',
    disposal_requirements: 'Must not be discharged to any watercourse, ditch, or drain. Silage effluent is approximately 200 times more polluting than raw domestic sewage. Spread on land at agronomic rates only. Environment Agency (EA) must be notified of any spillage reaching a watercourse (0800 807060).',
    regulation_ref: 'COSHH 2002; SSAFO 2010; Environmental Permitting Regulations 2016; Water Resources Act 1991 s.85',
  },
  {
    substance_type: 'Silo gas (nitrogen dioxide, NO2)',
    activity: 'Silo filling and early access to tower silos',
    assessment_required: 1,
    ppe: 'Self-contained breathing apparatus (SCBA) — not cartridge respirators (NO2 rapidly overwhelms chemical filters). Multi-gas detector with NO2 sensor.',
    storage_requirements: 'Not a stored substance — silo gas forms naturally during fermentation of freshly ensiled corn, grass, and legume silage. Peak production occurs 12-48 hours after filling. Gas is heavier than air and pools in silo rooms, feed passages, and at ground level around base of tower silos.',
    disposal_requirements: 'Ventilate silo continuously with blower for at least 48 hours after filling. If gas is visible (yellow-brown haze) or if bleach-like odour is detected, evacuate area immediately and do not re-enter without SCBA. Gas dissipates through ventilation — no disposal needed, but silo room must be ventilated before use.',
    regulation_ref: 'COSHH 2002; Confined Spaces Regulations 1997; EH40 WEL for NO2: 0.5 ppm (8-hr TWA); HSE AIS29',
  },
  {
    substance_type: 'Zinc phosphide (mole and rodent control)',
    activity: 'Mole control, rodent baiting',
    assessment_required: 1,
    ppe: 'Nitrile gloves (must not contact moisture on bare hands). Respiratory protection (P3 filter) when handling. Eye protection.',
    storage_requirements: 'Locked store in original sealed containers. Keep dry — zinc phosphide generates phosphine gas (PH3) on contact with moisture and is explosive when finely divided. Separate from food, feed, and other chemicals. Record all quantities.',
    disposal_requirements: 'Unused bait collected and disposed via licensed hazardous waste contractor. Dead moles and rodents should be collected and buried or disposed of safely to prevent secondary poisoning of predators. Never burn zinc phosphide products.',
    regulation_ref: 'COSHH 2002; Biocidal Products Regulation (EU) 528/2012 (retained); HSE guidance on rodent control',
  },
  {
    substance_type: 'Creosote (coal tar wood preservative)',
    activity: 'Fencing, gate treatment, building maintenance',
    assessment_required: 1,
    ppe: 'Chemical-resistant gloves (nitrile or PVC, NOT latex). Coveralls (disposable or dedicated). Eye protection. Barrier cream on exposed skin.',
    storage_requirements: 'Creosote use has been restricted since 2003 (Biocidal Products Directive) — only available to professional users, not the general public. Store in original sealed containers in ventilated, locked area with bunded floor. Keep away from heat sources.',
    disposal_requirements: 'Creosote-treated timber must not be burned (releases polycyclic aromatic hydrocarbons — carcinogens). Dispose of waste creosote and treated timber via licensed hazardous waste contractor. Old creosote stocks should be returned to supplier or collected as hazardous waste.',
    regulation_ref: 'COSHH 2002; Biocidal Products Regulation; HSE guidance on wood preservatives; REACH Regulation',
  },
  {
    substance_type: 'Latex (natural rubber gloves and equipment)',
    activity: 'Livestock handling, milking, veterinary procedures',
    assessment_required: 1,
    ppe: 'Switch to nitrile or vinyl alternatives for anyone showing signs of latex sensitivity (redness, itching, hives, or respiratory symptoms). Provide powder-free gloves to reduce airborne latex protein.',
    storage_requirements: 'Store in cool, dry conditions away from direct sunlight. Rotate stock to prevent degradation. Label clearly if latex is present in shared equipment.',
    disposal_requirements: 'Dispose used gloves in general waste unless contaminated with hazardous substances. If farm worker develops occupational dermatitis from latex, report to GP and consider RIDDOR reporting as occupational disease.',
    regulation_ref: 'COSHH 2002; Management of Health and Safety at Work Regulations 1999; HSE guidance on occupational dermatitis',
  },
  {
    substance_type: 'Isocyanates (spray foam insulation, two-pack paints)',
    activity: 'Building insulation, equipment coating, barn roof insulation',
    assessment_required: 1,
    ppe: 'Full-face respiratory protection with A2/P3 combined filter minimum — supplied-air breathing apparatus for enclosed spaces. Coveralls. Chemical-resistant gloves. Eye protection integral to respirator.',
    storage_requirements: 'Store in original sealed containers in cool, dry, ventilated area. Keep away from moisture (isocyanates react with water). Separate from oxidising agents. Record quantities and track shelf life.',
    disposal_requirements: 'Waste isocyanate products are hazardous waste. Dispose via licensed contractor. Empty containers retain residues — do not crush or burn. Cured foam is inert and can be disposed as general construction waste.',
    regulation_ref: 'COSHH 2002; EH40 WEL for MDI: 0.02 mg/m3 (8-hr TWA); HSE guidance on isocyanates; REACH',
  },
  {
    substance_type: 'Lead paint (old farm buildings)',
    activity: 'Building renovation, maintenance of pre-1960s farm buildings',
    assessment_required: 1,
    ppe: 'FFP3 respiratory protection when disturbing lead paint. Disposable coveralls. Nitrile gloves. Eye protection when scraping.',
    storage_requirements: 'Lead paint is not sold — the hazard arises from existing paint on old buildings. Before any sanding, scraping, burning, or demolition of pre-1960s painted surfaces, test for lead content.',
    disposal_requirements: 'Lead paint scrapings and dust are hazardous waste. Do not burn painted timber (releases lead fumes). Use wet methods to suppress dust during removal. Bag and dispose via licensed hazardous waste contractor. Decontaminate work area after removal.',
    regulation_ref: 'COSHH 2002; Control of Lead at Work Regulations 2002; EH40 WEL for lead: 0.15 mg/m3 (8-hr TWA); HSE INDG305',
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
  {
    incident_type: 'Near-miss incidents (voluntary reporting for safety culture)',
    reportable: 0,
    deadline: 'Not legally required under RIDDOR but HSE strongly recommends recording as soon as practicable',
    notify: 'Internal farm safety record. Optional: report to Farm Safety Foundation for sectoral learning.',
    method: 'Internal near-miss log (paper or digital). Include date, location, description, persons involved, and corrective action taken. Review near-miss records at regular safety meetings.',
    record_retention_years: 3,
    regulation_ref: 'MHSW Regulations 1999 (duty to review risk assessments); HSE INDG349; Farm Safety Foundation guidance',
  },
  {
    incident_type: 'Work-related ill health — occupational lung disease (farmer\'s lung, occupational asthma)',
    reportable: 1,
    deadline: 'As soon as employer receives written diagnosis from doctor or consultant',
    notify: 'HSE via online reporting',
    method: 'Online form (F2508A) at www.hse.gov.uk/riddor. Farmer\'s lung (extrinsic allergic alveolitis from mouldy hay, grain, or straw dust) and occupational asthma (from grain dust, animal dander, or chemical sensitisers) are reportable occupational diseases under RIDDOR 2013 Schedule 3.',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 8; Schedule 3 Part 1 (occupational asthma) and Part 2 (extrinsic allergic alveolitis)',
  },
  {
    incident_type: 'Contractor incidents on farm premises',
    reportable: 1,
    deadline: 'Same deadlines as for employees — fatal: immediately; specified injury: without delay; over-7-day: within 15 days',
    notify: 'HSE Incident Contact Centre (0345 300 9923) for fatal or specified injuries. Online for others.',
    method: 'The principal duty holder (farm owner/occupier) is responsible for reporting injuries to non-employees working on farm premises. Where a contractor\'s own employee is injured, the contractor\'s employer reports under RIDDOR. For self-employed contractors, the farm occupier reports. In all cases, coordinate reporting to avoid duplication. Record contractor induction, risk assessment sharing, and method statements.',
    record_retention_years: 3,
    regulation_ref: 'RIDDOR 2013 reg. 3-5; MHSW Regulations 1999 reg. 11 (coordination); CDM 2015 (if construction work)',
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
  {
    activity: 'Silage making (filling, clamping, sheeting, effluent management)',
    hazards: 'Run-over by silage vehicles on clamp; falls from clamp face during sheeting; silo gas (NO2) in tower silos within 48 hours of filling; silage effluent pollution of watercourses; PTO entanglement on forage harvester',
    controls: 'Designate traffic routes and pedestrian exclusion zones on clamp; use vehicle-mounted sheet rollers instead of manual sheeting; stay away from tower silos for 48 hours after filling; inspect effluent collection tank and drainage before filling; guard all PTO shafts; brief all contractors on farm rules before starting',
    residual_risk: 'Medium. Silo gas risk is high if tower silo entry protocols are not followed. Clamp face collapse risk is high during feed-out if face is undercut incorrectly.',
    review_frequency: 'Annual. Before each silage season (May and August typically).',
  },
  {
    activity: 'Lambing (infection control, manual handling, night working)',
    hazards: 'Chlamydial abortion (Chlamydia abortus) causing miscarriage in pregnant women; Q fever; toxoplasmosis; manual handling injuries from lifting ewes; fatigue from extended hours and night shifts; hypothermia in outdoor lambing; dog attacks on ewes',
    controls: 'Pregnant women must not assist with lambing or handle afterbirth — display warning signs; wear disposable gloves and arm protectors for all obstetric work; dispose of afterbirth by burning or deep burial; wash hands before eating or drinking; plan shift rotas to limit consecutive nights; provide warm shelter for shepherds; maintain perimeter fencing to exclude dogs',
    residual_risk: 'High for pregnant women (even brief contact with sheep afterbirth carries risk). Medium for other workers with PPE and hygiene controls in place.',
    review_frequency: 'Annual, before lambing season starts. Review after any zoonotic infection case.',
  },
  {
    activity: 'Harvest operations (combine, grain cart, straw baling, drying, storage)',
    hazards: 'Combine fire from dry crop material on hot exhaust; grain dust inhalation; entanglement in header or unloading auger; fatigue-related incidents from long hours; collision between combine and grain cart on headlands; grain engulfment during storage filling; children near machinery',
    controls: 'Clean chaff from engine bay and exhaust housing at least twice daily; carry minimum 6 kg fire extinguisher on combine; stop engine before clearing blockages; enforce maximum shift length of 12 hours with breaks every 2 hours; use two-way radios for grain cart coordination; lock out grain store augers before any bin entry; no children in cab or near operating machinery',
    residual_risk: 'Medium. Fire risk is high in dry conditions even with cleaning. Fatigue risk increases significantly after day 5 of continuous harvest.',
    review_frequency: 'Before harvest season. Daily toolbox talk during harvest period.',
  },
  {
    activity: 'Working near watercourses (drainage, fencing, livestock access)',
    hazards: 'Drowning (farm workers and livestock); slipping on wet/muddy banks; hypothermia from immersion; lone working near water with delayed rescue; machinery sliding into watercourse on soft banks',
    controls: 'Never work alone near deep water — buddy system mandatory; wear personal flotation device (PFD) when working within 2 m of water over 0.5 m deep; keep rescue throw line at accessible point; fence off deep water areas to prevent livestock and child access; position machinery well back from bank edge to avoid collapse; carry mobile phone in waterproof case',
    residual_risk: 'High. Drowning can occur in water as shallow as 150 mm (face-down incapacitation). Lone working is the primary risk amplifier.',
    review_frequency: 'Annual. Before any planned work near watercourses.',
  },
  {
    activity: 'Farm visitors and open days (public liability, child supervision, animal contact)',
    hazards: 'Visitors unfamiliar with farm hazards; children approaching machinery or livestock; allergic reactions to animals, hay, or animal dander; E. coli O157 and cryptosporidiosis from animal contact (especially children under 5); slips, trips, and falls on farm surfaces; vehicle movements in visitor areas',
    controls: 'Conduct formal risk assessment before any public access; provide designated visitor parking away from working areas; separate visitor routes from working farm traffic; provide hand-washing facilities with running water, soap, and paper towels at all exits from animal contact areas (gel sanitisers are not effective against E. coli O157); display signs prohibiting eating and drinking in animal areas; provide adequate supervision for children; brief visitors on farm rules at arrival; check public liability insurance covers the event',
    residual_risk: 'Medium with controls. E. coli O157 risk is serious for young children — hand washing compliance is the critical control.',
    review_frequency: 'Before each event. Annual review of public liability insurance.',
  },
  {
    activity: 'Tree work and chainsaw operations',
    hazards: 'Kickback from chainsaw (sudden upward rotation of guide bar); struck by falling tree or branch; falling from height during limbing; hand-arm vibration syndrome (HAVS) from prolonged chainsaw use; noise-induced hearing loss; tripping on undergrowth in felling area',
    controls: 'Operator must hold NPTC/City & Guilds certificate of competence (CS30/CS31 for felling); full chainsaw PPE worn at all times; assess each tree individually (lean, deadwood, hung-up branches, wind direction); clear drop zone (at least 2 x tree height radius); plan and clear retreat path at 45 degrees from fall direction; work with a colleague — never fell alone; carry first aid kit including large wound dressings; monitor vibration exposure and limit daily chainsaw use; maintain chain brake, anti-vibration mounts, and chain sharpness',
    residual_risk: 'Medium with full training and PPE. High for any untrained person — chainsaw work has one of the highest injury rates in agriculture.',
    review_frequency: 'Before each work session. Annual review of operator certification and PPE condition.',
  },
  {
    activity: 'Sheep shearing (electrical safety, manual handling, dermatitis)',
    hazards: 'Electric shock from portable shearing equipment in wet conditions; back and knee injuries from sustained bending posture; repetitive strain injuries in wrists and hands; dermatitis from lanolin, sheep dip residues, and wet wool; cuts from shearing handpiece; heat stress in enclosed shearing sheds',
    controls: 'Use 110V reduced-voltage shearing equipment via transformer; inspect cables and handpiece before each session; use RCD protection on all mains equipment; provide anti-fatigue mats and ensure shearing stand height is adjustable; plan rest breaks (minimum 15 minutes every 2 hours); apply barrier cream and wear thin gloves if dermatitis-prone; maintain sharp cutters and combs to reduce effort; ensure adequate ventilation in shearing shed; provide drinking water',
    residual_risk: 'Medium. Back injury risk remains significant even with good posture. Electric shock risk is high if equipment maintenance is poor.',
    review_frequency: 'Annual, before shearing season. Daily pre-use checks on electrical equipment.',
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

// Index machinery and working environment guidance
for (const m of machineryData) {
  const topic = m.machine_type ? 'machinery' : m.species ? 'livestock' : 'working-environment';
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    [
      m.topic,
      `${m.hazards} ${m.control_measures} ${m.legal_requirements} ${m.ppe_required}`,
      topic,
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
