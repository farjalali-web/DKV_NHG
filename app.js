const URGENCY = {
  spoed: "Spoed: 112/SEH of direct specialistisch overleg",
  sameDay: "Dezelfde dag overleg/verwijzing",
  primary: "Huisartsenroute met controle/safety net",
};

const GROUPS = [
  { key: "urgency", label: "Urgentie", type: "radio" },
  { key: "anamnese", label: "Anamnese", type: "chat" },
  { key: "onderzoek", label: "LO", type: "exam" },
  { key: "dd", label: "DD", type: "checkbox" },
  { key: "tests", label: "Lab / imaging", type: "checkbox" },
  { key: "explanation", label: "Uitleg", type: "checkbox" },
  { key: "actions", label: "Beleid", type: "checkbox" },
  { key: "avoid", label: "Niet doen", type: "checkbox" },
  { key: "verslag", label: "Verslag", type: "verslag" },
];

const HISTORY_LIMIT = 40;

const GLOBAL_DISTRACTORS = {
  anamnese: [
    "Vraag eerst toestemming en begin open: wat kan ik voor u doen?",
    "Duur, beloop en ernst van de hoofdklacht",
    "Alarmsymptomen en niet-pluis actief uitvragen",
    "Medicatie, allergieën en relevante voorgeschiedenis",
    "Invloed op dagelijks functioneren en hulp thuis",
    "Roken, alcohol, werk en familieanamnese op indicatie",
    "Vraag als eerste naar alle zeldzame erfelijke aandoeningen",
    "Laat samenvatten achterwege omdat dat tijd kost",
  ],
  onderzoek: [
    "Algemene indruk en ABCDE",
    "Vitale parameters: RR, pols, ademfrequentie, saturatie, temperatuur",
    "Inspectie, palpatie, percussie en auscultatie op indicatie",
    "Gericht neurologisch onderzoek op indicatie",
    "Buikonderzoek of gynaecologisch onderzoek op indicatie",
    "Onderzoek alleen het orgaan waar de patiënt zelf naar wijst",
    "Geen lichamelijk onderzoek als de anamnese duidelijk lijkt",
  ],
  dd: [
    "appendicitis",
    "angina pectoris",
    "astma/COPD-aanval",
    "depressie",
    "diabetes mellitus",
    "hartfalen",
    "longembolie",
    "meningitis/sepsis",
    "niersteen",
    "PID/EUG",
    "pneumonie",
    "schildklierstoornis",
  ],
  tests: [
    "ABCDE en vitale parameters",
    "ECG bij cardiale verdenking",
    "Gericht urineonderzoek",
    "Glucose/HbA1c op indicatie",
    "Lab alleen als uitslag beleid verandert",
    "Lichamelijk onderzoek en alarmsymptomen",
    "NT-proBNP/BNP bij verdenking hartfalen",
    "PCR chlamydia/gonorroe bij SOA-risico",
    "Pregnancy test bij vruchtbare vrouw",
    "TSH/FT4 bij schildklierverdenking",
  ],
  actions: [
    "Actief volgen met concrete controletermijn",
    "Antibiotica alleen bij passende indicatie",
    "Pijnstilling en uitleg",
    "Safety net met alarmsymptomen",
    "Specialistisch overleg bij twijfel of alarmsymptomen",
    "Start behandelroute volgens NHG/FK",
  ],
  explanation: [
    "Leg de meest waarschijnlijke diagnose uit in gewone taal",
    "Benoem waarom je een gevaarlijke DD wilt uitsluiten",
    "Leg uit welk aanvullend onderzoek waarom nodig is",
    "Bespreek wat de patiënt zelf kan doen",
    "Controleer of de patiënt de uitleg begrijpt",
    "Gebruik alleen medische termen zonder toelichting",
    "Geef zekerheid terwijl de diagnose nog niet bevestigd is",
  ],
  avoid: [
    "Geen breed labpakket zonder hypothese",
    "Geen beeldvorming als uitslag beleid niet verandert",
    "Geen geruststelling zonder safety net",
    "Geen routine-antibiotica bij viraal beeld",
  ],
};

const VERSLAG_SECTIONS = [
  "Patiënt en reden van komst",
  "Speciële anamnese met positieve en negatieve bevindingen",
  "Voorgeschiedenis, medicatie, allergieën en relevante sociale context",
  "Lichamelijk onderzoek met vitale parameters",
  "Probleemlijst en differentiaaldiagnose",
  "Plan: aanvullend onderzoek, beleid, uitleg, controle en alarmsymptomen",
];

const ROUTES = {
  dyspneu: {
    label: "Dyspneu",
    sources: [
      ["Astma", "https://richtlijnen.nhg.org/standaarden/astma-bij-volwassenen"],
      ["COPD", "https://richtlijnen.nhg.org/standaarden/copd"],
      ["Hartfalen", "https://richtlijnen.nhg.org/standaarden/hartfalen"],
      ["Acuut hoesten", "https://richtlijnen.nhg.org/standaarden/acuut-hoesten"],
      ["DVT/longembolie", "https://richtlijnen.nhg.org/standaarden/diepveneuze-trombose-en-longembolie"],
    ],
    branches: [
      {
        bucket: "Piepen / verlengd expirium",
        dd: "astma-aanval, COPD-longaanval",
        tests: "Ademarbeid, auscultatie, saturatie. Geen spirometrie in acute aanval; later spirometrie.",
        action: "SABA; bij COPD/ernstig ook ipratropium/corticosteroid volgens NHG. Spoed bij uitputting of hypoxie.",
      },
      {
        bucket: "Hoest + koorts / crepitaties",
        dd: "pneumonie, acuut hoesten, bronchiolitis kind",
        tests: "CRP bij volwassen twijfel pneumonie. Kind: geen routine-CRP. X-thorax alleen bij complicatie/twijfel/verwijzing.",
        action: "Antibioticum bij pneumonie volgens NHG; ondersteunend bij viraal beeld/bronchiolitis.",
      },
      {
        bucket: "Orthopneu / enkeloedeem",
        dd: "hartfalen, cardiale dyspneu",
        tests: "ECG, NT-proBNP/BNP, Hb, nierfunctie, elektrolyten, TSH. Echo via cardiologie.",
        action: "Diureticum bij overvulling overwegen; cardiologie voor echo/diagnose.",
      },
      {
        bucket: "Plots + pleuritische pijn / DVT-risico",
        dd: "longembolie, pneumothorax, ACS",
        tests: "Beslisregel/Wells. Niet los D-dimeer. Bij waarschijnlijk/positief: dezelfde dag beeldvorming via verwijzing.",
        action: "Spoed bij instabiliteit; antistolling/diagnostiek via protocol/specialist.",
      },
    ],
    distractors: {
      dd: ["hyperventilatie/paniek", "pneumothorax", "anafylaxie", "anemie"],
      tests: ["Spirometrie tijdens acute aanval", "X-thorax bij elke hoest", "D-dimeer zonder beslisregel"],
      actions: ["SABA inhalatie", "Ipratropium bij ernstig obstructief beeld", "Diureticum bij overvulling", "Antibioticum bij pneumonie"],
      avoid: ["Geen spirometrie in acute aanval", "Geen routine-X-thorax bij ongecompliceerd hoesten", "Geen los D-dimeer zonder beslisregel"],
    },
  },
  thorax: {
    label: "Thoracale pijn / hartkloppingen",
    sources: [
      ["Stabiele angina pectoris", "https://richtlijnen.nhg.org/standaarden/stabiele-angina-pectoris"],
      ["Atriumfibrilleren", "https://richtlijnen.nhg.org/standaarden/atriumfibrilleren"],
      ["Hartfalen", "https://richtlijnen.nhg.org/standaarden/hartfalen"],
      ["PAV", "https://richtlijnen.nhg.org/standaarden/perifeer-arterieel-vaatlijden"],
    ],
    branches: [
      {
        bucket: "Drukkende thoracale pijn",
        dd: "ACS, stabiele angina, reflux/spierpijn",
        tests: "ECG als beschikbaar zonder vertraging; risicofactoren, uitstraling, vegetatieve klachten.",
        action: "ACS-verdenking: ambulance/SEH. Stabiele angina: CVRM en cardiologie voor diagnostiek.",
      },
      {
        bucket: "Palpitaties / irregulaire pols",
        dd: "atriumfibrilleren, SVT, extrasystolen, hyperthyreoidie",
        tests: "ECG; Hb/TSH/elektrolyten op indicatie. Hemodynamiek beoordelen.",
        action: "Instabiel: spoed. AF: frequentiecontrole/antistollingsrisico volgens NHG.",
      },
      {
        bucket: "Inspanningsgebonden beenpijn",
        dd: "PAV, neurogeen, artrose",
        tests: "Pulsaties, huid, enkel-armindex; CVRM-risico.",
        action: "Looptraining, rookstop, CVRM; verwijzen bij rustpijn/wonden.",
      },
    ],
    distractors: {
      dd: ["ACS", "atriumfibrilleren", "stabiele angina", "hartfalen", "PAV"],
      tests: ["ECG", "TSH/Hb/elektrolyten op indicatie", "Enkel-armindex"],
      actions: ["Ambulance/SEH bij ACS-verdenking", "Frequentiecontrole bij AF", "CVRM optimaliseren"],
      avoid: ["Geen inspanningstest in de huisartsenpraktijk bij ACS-verdenking", "Geen geruststelling bij vegetatieve klachten en drukpijn"],
    },
  },
  neurologie: {
    label: "Neurologie",
    sources: [
      ["Beroerte", "https://richtlijnen.nhg.org/standaarden/beroerte"],
      ["Dementie", "https://richtlijnen.nhg.org/standaarden/dementie"],
      ["Ziekte van Parkinson", "https://richtlijnen.nhg.org/standaarden/ziekte-van-parkinson"],
    ],
    branches: [
      {
        bucket: "Plots uitval / FAST positief",
        dd: "CVA/TIA, hypoglykemie, migraine, epilepsie",
        tests: "Onset/last seen well, glucose, RR, medicatie/antistolling.",
        action: "Actieve uitval: 112/SEH. TIA hersteld: dezelfde dag TIA-service/overleg.",
      },
      {
        bucket: "Geheugen + functioneren achteruit",
        dd: "dementie, delier, depressie, medicatie, hypothyreoidie/B12",
        tests: "Heteroanamnese, ADL/IADL, cognitieve test, lab reversibele oorzaken.",
        action: "Plan met patient/naasten; verwijzen bij jonge leeftijd, atypisch beeld of twijfel.",
      },
      {
        bucket: "Traagheid + tremor/rigiditeit",
        dd: "Parkinson, essentiele tremor, medicatie-effect",
        tests: "Bradykinesie, rusttremor/rigiditeit, asymmetrie, valneiging.",
        action: "Verwijs neuroloog voor diagnose/start behandeling.",
      },
    ],
    distractors: {
      dd: ["CVA/TIA", "hypoglykemie", "dementie/delier", "Parkinson", "migraine"],
      tests: ["Glucose bij acute uitval", "RR en medicatie/antistolling", "Cognitieve test en heteroanamnese"],
      actions: ["112/SEH bij actieve uitval", "TIA-service dezelfde dag", "Neuroloog bij Parkinson-verdenking"],
      avoid: ["Geen afwachtbeleid bij actieve neurologische uitval", "Geen dementiediagnose zonder heteroanamnese"],
    },
  },
  kind: {
    label: "Kind met koorts / dehydratie",
    sources: [
      ["Kinderen met koorts", "https://richtlijnen.nhg.org/standaarden/kinderen-met-koorts"],
      ["Acuut hoesten", "https://richtlijnen.nhg.org/standaarden/acuut-hoesten"],
      ["Gastro-enteritis", "https://richtlijnen.nhg.org/standaarden/gastro-enteritis"],
    ],
    branches: [
      {
        bucket: "Ernstig ziek / jonge baby",
        dd: "sepsis, meningitis, ernstige dehydratie",
        tests: "Kijkgedrag, ademarbeid, kleur, circulatie, bewustzijn, petechien, drinken/plassen.",
        action: "Spoedverwijzing; CRP niet afwachten bij alarmsymptomen.",
      },
      {
        bucket: "Koorts zonder focus",
        dd: "viraal, UWI, pneumonie, meningitis vroeg",
        tests: "Leeftijd, duur, vaccinatie, risicofactoren. Urineonderzoek bij UWI-verdenking.",
        action: "Advies en controle bij niet-ziek kind; laagdrempelig herbeoordelen.",
      },
      {
        bucket: "Braken/diarree",
        dd: "gastro-enteritis, dehydratie, acute buik",
        tests: "Dehydratietekenen, mictie, gewicht, bloed/slijm, buikonderzoek.",
        action: "ORS; verwijzen bij ernstige dehydratie, sufheid, gallig braken of peritoneale prikkeling.",
      },
    ],
    distractors: {
      dd: ["sepsis/meningitis", "UWI", "pneumonie", "gastro-enteritis", "dehydratie"],
      tests: ["Kijkgedrag en vitale ernst", "Urineonderzoek bij UWI-verdenking", "Dehydratietekenen"],
      actions: ["Spoed bij ziek kind", "ORS bij dehydratie", "Herbeoordeling bij persisterende koorts"],
      avoid: ["Geen routine-CRP bij kind met koorts", "Geen geruststelling als drinken/plassen onvoldoende is"],
    },
  },
  buik: {
    label: "Buikpijn / maag / geelzucht",
    sources: [
      ["Urinesteenlijden", "https://richtlijnen.nhg.org/standaarden/urinesteenlijden"],
      ["Maagklachten", "https://richtlijnen.nhg.org/standaarden/maagklachten"],
      ["Virushepatitis en lever", "https://richtlijnen.nhg.org/standaarden/virushepatitis-en-andere-leveraandoeningen"],
    ],
    branches: [
      {
        bucket: "Peritoneaal / acuut ziek",
        dd: "appendicitis, perforatie, ileus, pancreatitis, EUG",
        tests: "Vitale parameters, buikonderzoek, zwangerschapstest, urine. Lab/imaging vertraagt verwijzing niet.",
        action: "Spoedverwijzing bij peritoneale prikkeling, shock, progressieve pijn of EUG-risico.",
      },
      {
        bucket: "Koliek flank + hematurie",
        dd: "niersteen, pyelonefritis, AAA",
        tests: "Urinedip, koorts, nierfunctie op indicatie; beeldvorming bij complicaties/twijfel.",
        action: "NSAID/pijnstilling; verwijzen bij koorts, solitaire nier, nierfalen of onbehandelbare pijn.",
      },
      {
        bucket: "Geelzucht / donkere urine",
        dd: "hepatitis, galwegobstructie, maligniteit, hemolyse",
        tests: "Bilirubine, ALAT/ASAT, AF/gamma-GT; vraag pijn, koorts, jeuk, alcohol/medicatie/reis.",
        action: "Spoed bij cholangitisbeeld; echo/verwijzing bij obstructief beeld.",
      },
    ],
    distractors: {
      dd: ["appendicitis/peritonitis", "niersteen", "pyelonefritis", "EUG", "galwegobstructie/hepatitis"],
      tests: ["Zwangerschapstest bij vruchtbare vrouw", "Urinedip bij flankpijn", "Leverlab bij geelzucht"],
      actions: ["Spoed bij peritoneale prikkeling", "NSAID bij niersteenkoliek als mogelijk", "Echo/verwijzing bij obstructief leverbeeld"],
      avoid: ["Geen vertraging door lab bij acute buik", "Geen PPI als alarmsymptomen op maligniteit staan"],
    },
  },
  soa: {
    label: "SOA / PID / bloedverlies",
    sources: [
      ["Het soa-consult", "https://richtlijnen.nhg.org/standaarden/het-soa-consult"],
      ["PID", "https://richtlijnen.nhg.org/standaarden/pelvic-inflammatory-disease"],
      ["Vaginaal bloedverlies", "https://richtlijnen.nhg.org/standaarden/vaginaal-bloedverlies"],
    ],
    branches: [
      {
        bucket: "Onderbuikpijn na sexarche",
        dd: "PID, EUG, appendicitis, UWI",
        tests: "Zwangerschapstest, SOA-PCR, urine, speculum + VT op indicatie. Echo niet voor PID-diagnose.",
        action: "Bij PID/verdenking laagdrempelig combinatie-antibiotica; controle na 2-3 dagen.",
      },
      {
        bucket: "Fluor/ulcus/branderig",
        dd: "chlamydia, gonorroe, herpes, candida/BV",
        tests: "Risicoanamnese, partner, zwangerschap, PCR chlamydia/gonorroe; HIV/syfilis/hepatitis op indicatie.",
        action: "Gericht behandelen; partnerwaarschuwing en condoomadvies.",
      },
      {
        bucket: "Vaginaal bloedverlies",
        dd: "zwangerschap/EUG, miskraam, cyclusstoornis, maligniteit",
        tests: "Eerst zwangerschapstest en hemodynamiek; vraag postcoitaal/postmenopauzaal bloedverlies.",
        action: "Spoed bij instabiliteit/EUG; verwijzen bij postmenopauzaal of alarmsymptomen.",
      },
    ],
    distractors: {
      dd: ["PID", "EUG", "chlamydia/gonorroe", "UWI", "maligniteit bij postmenopauzaal bloedverlies"],
      tests: ["Zwangerschapstest", "PCR chlamydia/gonorroe", "Speculumonderzoek en VT op indicatie"],
      actions: ["Combinatie-antibiotica bij PID-verdenking", "Partnerwaarschuwing", "Spoed bij EUG-verdenking"],
      avoid: ["Geen echo als test om PID te bevestigen", "Geen Mycoplasma genitalium-test voor PID", "Geen behandeling zonder partnerbeleid bij SOA"],
    },
  },
  bewegingsapparaat: {
    label: "Bewegingsapparaat",
    sources: [
      ["Aspecifieke lagerugpijn", "https://richtlijnen.nhg.org/standaarden/aspecifieke-lagerugpijn"],
      ["Schouderklachten", "https://richtlijnen.nhg.org/standaarden/schouderklachten"],
      ["Knieklachten", "https://richtlijnen.nhg.org/standaarden/traumatische-knieklachten"],
    ],
    branches: [
      {
        bucket: "Rug/nekpijn",
        dd: "aspecifiek, radiculair, cauda, fractuur, maligniteit/infectie",
        tests: "Neurologie, mictie/rijbroek, trauma, koorts, kanker, nachtelijke pijn.",
        action: "Actief blijven, pijnstilling, uitleg; spoed bij cauda/progressieve uitval.",
      },
      {
        bucket: "Schouderpijn",
        dd: "subacromiaal, frozen shoulder, artrose, referred pain",
        tests: "Actief/passief bewegingsonderzoek, kracht, trauma; denk cardiaal/long bij thoracale klachten.",
        action: "Analgetica, oefenadvies/fysio; beeldvorming alleen bij trauma/red flags/therapiefalen.",
      },
      {
        bucket: "Knie na trauma",
        dd: "fractuur, bandletsel, meniscus",
        tests: "Belastbaarheid, zwelling snel, slotklachten, stabiliteit. X-knie bij fractuurverdenking.",
        action: "Geen MRI routinematig; verwijzen bij slotstand, instabiliteit of fractuurverdenking.",
      },
    ],
    distractors: {
      dd: ["cauda equina", "fractuur", "meniscusletsel", "frozen shoulder", "aspecifieke rugpijn"],
      tests: ["Neurologisch onderzoek", "Actief/passief bewegingsonderzoek", "X-knie bij fractuurverdenking"],
      actions: ["Actief blijven en pijnstilling", "Verwijzen bij cauda/red flags", "Fysiotherapie/oefenadvies"],
      avoid: ["Geen beeldvorming bij aspecifieke rugpijn zonder red flags", "Geen MRI-knie routinematig in eerste lijn"],
    },
  },
  psychisch: {
    label: "Psychisch / slaap",
    sources: [
      ["Angst", "https://richtlijnen.nhg.org/standaarden/angst"],
      ["Depressie", "https://richtlijnen.nhg.org/standaarden/depressie"],
      ["Slaapproblemen", "https://richtlijnen.nhg.org/standaarden/slaapproblemen"],
    ],
    branches: [
      {
        bucket: "Acuut onveilig",
        dd: "suicidaliteit, psychose, manie, intoxicatie",
        tests: "Vraag direct suïcideplan, middelen, psychose/manie en veiligheid thuis.",
        action: "Crisisdienst/112 bij acuut gevaar; patient niet alleen laten bij hoog risico.",
      },
      {
        bucket: "Paniekaanvallen / angst",
        dd: "paniekstoornis, GAS, somatisch ritme/thyreoid/anemie",
        tests: "Triggers, vermijding, lichamelijke alarmsymptomen. Lab/ECG alleen bij somatische aanwijzingen.",
        action: "Psycho-educatie, exposure/CGT, SSRI bij ernst/persistentie.",
      },
      {
        bucket: "Somberheid / anhedonie",
        dd: "depressie, rouw, burn-out, hypothyreoidie",
        tests: "Duur, functioneren, slaap/eetlust, schuld, concentratie, suicidaliteit.",
        action: "Activerend beleid, psychologische behandeling; antidepressivum bij matig-ernstig/persistent.",
      },
    ],
    distractors: {
      dd: ["depressie", "angststoornis", "burn-out", "psychose/manie", "somatische oorzaak"],
      tests: ["Suicidaliteit actief uitvragen", "Somatisch onderzoek/lab alleen op indicatie", "Slaap en middelengebruik uitvragen"],
      actions: ["Crisisdienst bij acuut gevaar", "CGT/exposure bij angst", "Activerend beleid en follow-up"],
      avoid: ["Geen chronische benzodiazepinen", "Geen lab zonder somatische aanwijzing", "Geen patient alleen laten bij hoog suiciderisico"],
    },
  },
  endocrien: {
    label: "Endocrien / metabool",
    sources: [
      ["Diabetes mellitus type 2", "https://richtlijnen.nhg.org/standaarden/diabetes-mellitus-type-2"],
      ["Schildklieraandoeningen", "https://richtlijnen.nhg.org/standaarden/schildklieraandoeningen"],
    ],
    branches: [
      {
        bucket: "Polyurie/dorst/afvallen",
        dd: "diabetes, hyperglykemie, DKA/HHS",
        tests: "Glucose/HbA1c; bij ziek/braken/suf/ketonen acuut gevaar beoordelen.",
        action: "Leefstijl en medicatie volgens NHG; spoed bij dehydratie, sufheid of ketonen.",
      },
      {
        bucket: "Moe/koud/gewicht omhoog",
        dd: "hypothyreoidie, anemie, depressie",
        tests: "TSH eerst; bij afwijkend TSH FT4. Check medicatie, zwangerschap, cardiovasculair risico.",
        action: "Levothyroxine bij bevestigde hypothyreoidie; rustig titreren.",
      },
      {
        bucket: "Tremor/palpitaties/afvallen",
        dd: "hyperthyreoidie, angst, AF",
        tests: "TSH + FT4, pols/ECG bij palpitaties.",
        action: "Overleg/verwijzen of behandelen volgens NHG; spoed bij thyreotoxische crisis/instabiliteit.",
      },
    ],
    distractors: {
      dd: ["diabetes", "DKA/HHS", "hypothyreoidie", "hyperthyreoidie", "depressie/anemie"],
      tests: ["Glucose/HbA1c", "TSH met FT4 bij afwijking", "ECG bij palpitaties"],
      actions: ["Leefstijl en diabetesmedicatie volgens NHG", "Levothyroxine bij bevestigde hypothyreoidie", "Spoed bij dehydratie/suf/ketonen"],
      avoid: ["Geen breed lab zonder hypothese", "Geen levothyroxine zonder bevestigde diagnose"],
    },
  },
};

const ROUTE_DEFAULTS = {
  dyspneu: {
    anamnese: [
      "Begin en beloop van de benauwdheid",
      "Inspanning, rust, orthopneu en nachtelijke dyspneu",
      "Hoest, koorts, sputum, piepen en pijn bij ademhalen",
      "Thoracale pijn, hemoptoe en DVT/longembolie-risico",
      "Voorgeschiedenis, roken, medicatie en allergieën",
      "Vat samen en check of de patiënt dit herkent",
    ],
    onderzoek: [
      "Algemene indruk en ABCDE",
      "Vitale parameters: RR, pols, ademfrequentie, saturatie, temperatuur",
      "Inspectie ademarbeid en gebruik hulpademhalingsspieren",
      "Longauscultatie: piepen, crepitaties, verlengd expirium",
      "Hartonderzoek, halsvenen en perifeer oedeem op indicatie",
    ],
    explanation: [
      "Leg uit welke oorzaak het meest waarschijnlijk is",
      "Benoem dat ernst en zuurstoftekort eerst worden beoordeeld",
      "Leg uit waarom CRP, X-thorax, spirometrie of D-dimeer wel/niet past",
      "Bespreek medicatie/inhalatie en wanneer direct contact nodig is",
    ],
  },
  thorax: {
    anamnese: [
      "Karakter, lokalisatie, duur en uitlokkende factor van pijn",
      "Uitstraling naar arm, kaak, rug of bovenbuik",
      "Zweten, misselijkheid, dyspneu, collaps of hartkloppingen",
      "Risicofactoren: roken, diabetes, hypertensie, cholesterol, familie",
      "Medicatie, eerdere hart- en vaatziekten en functioneren",
      "Vat samen en benoem ACS-alarmsymptomen",
    ],
    onderzoek: [
      "Algemene indruk en ABCDE",
      "Vitale parameters en hemodynamische stabiliteit",
      "Polsfrequentie en ritme",
      "Hart- en longauscultatie",
      "Tekenen van hartfalen of perifere vaatproblemen op indicatie",
    ],
    explanation: [
      "Leg het verschil uit tussen stabiele klachten en ACS",
      "Benoem waarom ECG/verwijzing nodig kan zijn",
      "Leg cardiovasculair risicomanagement uit",
      "Bespreek 112 bij pijn > 15 minuten of instabiliteit",
    ],
  },
  neurologie: {
    anamnese: [
      "Exact tijdstip begin en last seen well",
      "FAST-symptomen: gezicht, arm, spraak",
      "Duur, herstel en nieuwe/aanhoudende uitval",
      "Hoofdpijn, aura, epilepsie, hypoglykemie of migrainekenmerken",
      "Antistolling, bloedingen, operaties en cardiovasculaire risicofactoren",
      "Vat samen en check urgentie",
    ],
    onderzoek: [
      "ABCDE en aanspreekbaarheid",
      "Vitale parameters en bloedglucose",
      "FAST en gericht neurologisch onderzoek",
      "Kracht, sensibiliteit, coördinatie en spraak",
      "Hartfrequentie en ritme",
    ],
    explanation: [
      "Leg uit dat tijdelijke uitval toch serieus is",
      "Benoem CVA/TIA als waarschuwing voor een beroerte",
      "Leg uit waarom snelle verwijzing nodig is",
      "Bespreek direct 112 bij nieuwe of aanhoudende uitval",
    ],
  },
  kind: {
    anamnese: [
      "Leeftijd, duur koorts/klachten en beloop",
      "Drinken, plassen/natte luiers en sufheid",
      "Ademarbeid, apneus, intrekkingen en cyanose",
      "Petechiën, nekstijfheid, ontroostbaarheid en ziek indruk",
      "Risicofactoren: prematuriteit, hart/longziekte, jonge baby",
      "Vat samen met ouder en check zorgen",
    ],
    onderzoek: [
      "Algemene indruk: ziek of niet ziek",
      "ABCDE en vitale parameters",
      "Ademfrequentie, intrekkingen en saturatie op indicatie",
      "Hydratietoestand en slijmvliezen",
      "Long-, hart-, keel/oor- en buikonderzoek op indicatie",
    ],
    explanation: [
      "Leg uit of het beeld past bij viraal beloop of alarmsymptomen",
      "Benoem waarom CRP niet routinematig nodig is",
      "Leg drinken, ORS of neusspoelen praktisch uit",
      "Bespreek wanneer ouder direct opnieuw moet bellen",
    ],
  },
  buik: {
    anamnese: [
      "Pijnlokalisatie, karakter, duur, migratie en progressie",
      "Koorts, braken, ontlasting, mictie en bloedverlies",
      "Zwangerschapskans en cyclus bij vruchtbare vrouw",
      "Medicatie, alcohol, voorgeschiedenis en alarmsymptomen",
      "Niet-pluis, collaps of peritoneale klachten uitvragen",
      "Vat samen en benoem gevaarlijke DD",
    ],
    onderzoek: [
      "Algemene indruk en vitale parameters",
      "Buikinspectie, auscultatie, palpatie en peritoneale prikkeling",
      "Slagpijn nierloge en urinedip op indicatie",
      "Zwangerschapstest bij vruchtbare vrouw",
      "Rectaal/gynaecologisch onderzoek op indicatie",
    ],
    explanation: [
      "Leg uit welke buikdiagnose het meest waarschijnlijk is",
      "Benoem waarom zwangerschap/acute buik eerst uitgesloten moet worden",
      "Leg aanvullend onderzoek en eventuele verwijzing uit",
      "Bespreek alarmsymptomen: toenemende pijn, koorts, sufheid, flauwvallen",
    ],
  },
  soa: {
    anamnese: [
      "Seksuele anamnese: partners, condoomgebruik en SOA-risico",
      "Onderbuikpijn, fluor, dyspareunie en bloedverlies",
      "Zwangerschapskans en menstruatie",
      "Koorts, ziek zijn en acute buikklachten",
      "UWI-klachten en eerdere SOA/PID",
      "Vat samen met respectvolle, niet-oordelende taal",
    ],
    onderzoek: [
      "Algemene indruk en vitale parameters",
      "Buikonderzoek op drukpijn/peritoneale prikkeling",
      "Zwangerschapstest",
      "Speculumonderzoek op indicatie",
      "Vaginaal toucher op indicatie bij PID-verdenking",
    ],
    explanation: [
      "Leg PID/SOA uit zonder oordeel en in begrijpelijke taal",
      "Benoem waarom zwangerschap/EUG eerst belangrijk is",
      "Leg PCR-testen, partnerwaarschuwing en condoomadvies uit",
      "Bespreek controle na 2-3 dagen en alarmsymptomen",
    ],
  },
  bewegingsapparaat: {
    anamnese: [
      "Trauma of geleidelijk begin",
      "Pijnlocatie, uitstraling, functie en belastbaarheid",
      "Neurologische uitval, mictie/rijbroekgevoel bij rugpijn",
      "Koorts, maligniteit, nachtelijke pijn of infectierisico",
      "Werk/sport, beperkingen en hulpvraag",
      "Vat samen en benoem red flags",
    ],
    onderzoek: [
      "Inspectie houding, zwelling, roodheid en looppatroon",
      "Actief en passief bewegingsonderzoek",
      "Kracht, sensibiliteit en reflexen op indicatie",
      "Specifieke gewrichtstesten op indicatie",
      "Neurovasculaire status bij trauma",
    ],
    explanation: [
      "Leg uit waarom klachten vaak klinisch beoordeeld worden",
      "Benoem wanneer beeldvorming niet helpt",
      "Leg actief blijven, oefenen en pijnstilling uit",
      "Bespreek red flags en wanneer opnieuw contact nodig is",
    ],
  },
  psychisch: {
    anamnese: [
      "Klachten, duur, triggers en functioneren",
      "Stemming, angst, slaap, eetlust, concentratie en energie",
      "Suïcidaliteit, psychose, manie en middelengebruik actief uitvragen",
      "Somatische signalen en medicatie",
      "Werk, thuissituatie, steun en beschermende factoren",
      "Vat samen en normaliseer zonder te bagatelliseren",
    ],
    onderzoek: [
      "Beoordeel contact, bewustzijn en psychische toestand",
      "Risicotaxatie bij suïcidaliteit of psychose",
      "Somatisch onderzoek op indicatie",
      "Lab/ECG alleen bij somatische aanwijzingen",
      "Beoordeel veiligheid thuis en steunnetwerk",
    ],
    explanation: [
      "Leg de werkdiagnose en vicieuze cirkel begrijpelijk uit",
      "Benoem dat lichamelijke oorzaken op indicatie worden uitgesloten",
      "Bespreek behandelopties: psycho-educatie, activering, CGT/medicatie",
      "Bespreek crisisplan bij onveiligheid",
    ],
  },
  endocrien: {
    anamnese: [
      "Duur en beloop van moeheid, dorst, gewicht of palpitaties",
      "Polyurie, polydipsie, afvallen, sufheid of braken",
      "Kouwelijkheid, obstipatie, tremor, zweten en intolerantie warmte/kou",
      "Medicatie, familieanamnese en cardiovasculair risico",
      "Zwangerschap of kinderwens op indicatie",
      "Vat samen en benoem labhypothese",
    ],
    onderzoek: [
      "Algemene indruk en vitale parameters",
      "Gewicht/BMI en hydratatie",
      "Pols, ritme en tremor",
      "Schildklieronderzoek op indicatie",
      "Voeten/complicaties bij diabetes op indicatie",
    ],
    explanation: [
      "Leg uit welke hormonale/metabole oorzaak je onderzoekt",
      "Benoem waarom gericht bloedonderzoek nodig is",
      "Leg leefstijl, medicatie en controle uit",
      "Bespreek alarmsymptomen zoals sufheid, braken of dehydratie",
    ],
  },
};

const CASE_DIALOGUE = {
  "dyspneu-astma": {
    patient: {
      start: "Ik ben sinds vannacht benauwd en ik piep bij het uitademen.",
      onset: "Het begon vannacht vrij plots, maar ik heb vaker aanvallen gehad bij stof of kou.",
      pattern: "Het komt in aanvallen. Sinds vannacht is het duidelijk aanwezig, maar tussendoor kan het ook weer wat rustiger worden.",
      triggers: "Het is vooral erger bij kou, stof en inspanning; traplopen merk ik nu meteen.",
      severity: "Ik kan volledige zinnen spreken, maar traplopen lukt nu niet prettig.",
      dyspnea: "Vooral bij uitademen, met piepen. In rust is het draaglijk.",
      cough: "Ik hoest droog, geen slijm en geen bloed.",
      fever: "Nee, ik heb geen koorts gehad.",
      chest: "Geen echte pijn op de borst, alleen een beklemmend gevoel bij benauwdheid.",
      orthopnea: "Platliggen maakt het niet duidelijk erger en ik heb geen dikke enkels.",
      risk: "Geen lange reis, geen beenpijn of zwelling, geen pilgebruik genoemd.",
      history: "Ik heb atopie/eczeem gehad, astma is niet officieel vastgesteld.",
      meds: "Ik gebruik geen vaste inhalatiemedicatie.",
      smoking: "Ik rook niet.",
      allergy: "Geen medicatieallergieën bekend.",
      concern: "Ik ben bang dat ik geen lucht krijg als het erger wordt.",
      function: "Ik vermijd nu inspanning omdat ik dan sneller piep.",
    },
    exam: {
      general: "Niet acuut ziek, licht dyspnoïsch, spreekt in zinnen.",
      vitals: "RR 124/76, pols 98/min, AH 22/min, saturatie 96%, T 36.8.",
      lungs: "Verlengd expirium en diffuus expiratoir piepen, geen crepitaties.",
      heart: "Regulier ritme, geen souffle.",
      legs: "Geen perifeer oedeem, geen tekenen van DVT.",
    },
  },
  "dyspneu-pe": {
    patient: {
      start: "Ik werd ineens kortademig en heb pijn bij diep inademen.",
      onset: "Het begon acuut vandaag.",
      pattern: "Het is niet in aanvallen gekomen; het begon plots en blijft aanwezig.",
      triggers: "Diep inademen maakt vooral de pijn erger.",
      severity: "Ik ben duidelijk benauwd en mijn hart gaat snel.",
      dyspnea: "Ja, ook in rust voel ik me kortademig.",
      chest: "Scherpe pijn bij diep inademen, geen klassiek drukkend gevoel.",
      cough: "Nauwelijks hoest, geen slijm.",
      fever: "Geen koorts.",
      risk: "Ik ben twee weken geleden bevallen.",
      legs: "Mijn been voelt niet duidelijk dikker, maar ik weet het niet zeker.",
      meds: "Geen antistolling.",
      concern: "Ik maak me zorgen omdat het zo plots kwam.",
    },
    exam: {
      general: "Benauwde vrouw, onrustig maar aanspreekbaar.",
      vitals: "RR 118/72, pols 118/min, AH 26/min, saturatie 93%, T 37.1.",
      lungs: "Geen duidelijke crepitaties of piepen.",
      heart: "Tachycard, regulair.",
      legs: "Geen duidelijke kuitzwelling, wel postpartum risicofactor.",
    },
  },
  "dyspneu-hf": {
    patient: {
      start: "Ik word de laatste weken steeds benauwder en mijn enkels zijn dik.",
      onset: "Ongeveer zes weken, de laatste tien dagen duidelijk erger.",
      pattern: "Het is geleidelijk erger geworden, niet echt in aanvallen.",
      triggers: "Inspanning en platliggen maken het erger; rust en rechtop zitten helpen wat.",
      severity: "Ik kan nog maar een paar honderd meter lopen.",
      dyspnea: "Vooral bij inspanning, en plat liggen maakt het erger.",
      orthopnea: "Ik slaap met drie kussens en word soms 's nachts benauwd wakker.",
      cough: "Droge nachtelijke hoest, geen slijm.",
      fever: "Geen koorts.",
      chest: "Soms druk bij traplopen, niet uitstralend.",
      legs: "Beide enkels zijn dik, vooral aan het einde van de dag.",
      weight: "Ongeveer drie kilo erbij in twee weken.",
      history: "Hypertensie, diabetes type 2, hoog cholesterol en eerder hartinfarct met stent.",
      meds: "Metformine, atorvastatine en lisinopril; de laatste weken vaak ibuprofen.",
      smoking: "Ik rook ongeveer tien sigaretten per dag.",
      allergy: "Geen bekende allergieën.",
      function: "Traplopen lukt nauwelijks; mijn vrouw helpt thuis.",
    },
    exam: {
      general: "Vermoeide man, licht dyspnoïsch.",
      vitals: "RR 150/90, pols 102/min regulair, AH 22/min, saturatie 95%, T 36.8.",
      lungs: "Bibasale crepitaties, geen duidelijke piepen.",
      heart: "Tachycardie, mogelijk S3, zacht systolisch geruis.",
      neck: "Halsvenen verhoogd passend bij verhoogde CVD/JVP.",
      legs: "Beiderzijds pitting oedeem tot halverwege de onderbenen.",
      abdomen: "Geen duidelijke ascites, leverrand licht palpabel.",
    },
  },
  "dyspneu-pneumonie": {
    patient: {
      start: "Ik hoest en heb koorts.",
      onset: "Drie dagen geleden begonnen.",
      pattern: "De klachten zijn de laatste dagen continu aanwezig en langzaam erger geworden.",
      triggers: "Diep inademen en hoesten maken de pijn rechts erger.",
      cough: "Productieve hoest, geelgroen sputum.",
      fever: "Ja, tot 39 graden.",
      chest: "Pijn rechts bij diep inademen.",
      dyspnea: "Ik ben wat kortademig bij lopen.",
      risk: "Geen DVT-risico en geen lange reis.",
      history: "Geen bekende longziekte.",
      meds: "Geen vaste medicatie.",
    },
    exam: {
      general: "Ziek maar niet septisch ogend.",
      vitals: "RR 128/78, pols 104/min, AH 24/min, saturatie 94%, T 38.7.",
      lungs: "Rechts basaal crepitaties en verminderd ademgeruis.",
      heart: "Tachycard, regulair.",
    },
  },
  "thorax-acs": {
    patient: {
      start: "Ik heb sinds drie kwartier een drukkende pijn midden op de borst.",
      onset: "Het begon ongeveer 40 minuten geleden, vrij plots.",
      pattern: "De pijn is continu aanwezig en zakt niet echt weg.",
      triggers: "Rust helpt niet duidelijk. Inspanning durf ik nu niet goed.",
      chest: "Het voelt drukkend en zwaar, midden op de borst, met uitstraling naar mijn linkerarm.",
      severity: "Het is heftig, ongeveer 8 van de 10.",
      dyspnea: "Ik ben er wat kortademig bij.",
      vegetative: "Ik zweet en ben misselijk.",
      fever: "Geen koorts.",
      history: "Ik heb diabetes en rook. Geen eerder hartinfarct dat ik weet.",
      meds: "Ik gebruik tabletten voor diabetes, geen bloedverdunners.",
      allergy: "Geen bekende allergieën.",
      concern: "Ik ben bang dat het mijn hart is.",
      function: "Ik kan nu niet normaal doorgaan; ik ben gestopt met alles.",
    },
    exam: {
      general: "Klam, angstig en pijnlijk ogend.",
      vitals: "RR 150/90, pols 104/min, AH 20/min, saturatie 96%, T 36.9.",
      heart: "Regulier ritme, geen duidelijke souffle.",
      lungs: "Vesiculair ademgeruis, geen crepitaties.",
      abdomen: "Buik soepel, geen drukpijn.",
    },
  },
  "thorax-af": {
    patient: {
      start: "Mijn hart bonst sinds gisteren onregelmatig en ik ben wat duizelig.",
      onset: "Sinds gisteren, niet ineens na inspanning.",
      pattern: "Het komt en gaat wat, maar de hartkloppingen zijn vaak aanwezig.",
      triggers: "Ik merk het vooral in rust en bij opstaan.",
      chest: "Geen pijn op de borst.",
      dyspnea: "Niet echt benauwd in rust.",
      vegetative: "Geen zweten of misselijkheid.",
      syncope: "Ik ben niet flauwgevallen.",
      history: "Ik heb hypertensie, verder geen bekende ritmestoornis.",
      meds: "Ik gebruik bloeddrukmedicatie, geen antistolling.",
      allergy: "Geen bekende allergieën.",
      concern: "Ik vind het eng omdat het onregelmatig voelt.",
      function: "Ik doe rustiger aan omdat ik duizelig word.",
    },
    exam: {
      general: "Alert, niet acuut ziek.",
      vitals: "RR 135/80, pols irregulair 130/min, AH 16/min, saturatie 97%, T 36.7.",
      heart: "Irregulair, tachycard, geen duidelijke souffle.",
      lungs: "Geen crepitaties of piepen.",
      legs: "Geen oedeem.",
    },
  },
  "neuro-tia": {
    patient: {
      start: "Ik kon ineens niet goed uit mijn woorden komen, maar het is nu over.",
      onset: "Het begon plots en duurde ongeveer 20 minuten.",
      pattern: "Het was één aanval en daarna trok het volledig weg.",
      triggers: "Geen duidelijke uitlokker.",
      neuro: "Tijdens de aanval kwam ik niet uit mijn woorden. Geen scheve mond of krachtsverlies dat ik merkte.",
      headache: "Geen heftige hoofdpijn.",
      syncope: "Ik ben niet flauwgevallen en had geen trekkingen.",
      chest: "Geen pijn op de borst.",
      history: "Ik heb hypertensie.",
      meds: "Ik gebruik bloeddrukmedicatie, geen antistolling.",
      smoking: "Ik rook niet meer.",
      concern: "Ik ben bang dat het een beroerte was.",
      function: "Nu kan ik weer praten en lopen, maar ik ben geschrokken.",
    },
    exam: {
      general: "Alert en goed aanspreekbaar.",
      vitals: "RR 165/95, pols 84/min regulair, glucose normaal, T 36.8.",
      neuro: "FAST nu negatief; kracht, sensibiliteit, spraak en coördinatie nu normaal.",
      heart: "Regulier ritme.",
      legs: "Looppatroon nu normaal.",
    },
  },
  "neuro-parkinson": {
    patient: {
      start: "Ik loop trager en mijn rechterhand trilt als ik stilzit.",
      onset: "Het speelt al maanden en wordt langzaam duidelijker.",
      pattern: "Het is geleidelijk progressief, geen aanvallen.",
      triggers: "De tremor valt vooral op in rust en wordt minder als ik iets pak.",
      neuro: "Mijn rechterhand trilt, mijn handschrift is kleiner en mijn partner zegt dat ik minder mimiek heb.",
      falls: "Ik ben nog niet gevallen, maar ik voel me stijver.",
      memory: "Mijn geheugen is niet het grootste probleem.",
      meds: "Geen nieuwe medicatie die dit kan verklaren.",
      concern: "Ik vraag me af of dit Parkinson kan zijn.",
      function: "Aankleden en lopen gaan trager dan vroeger.",
    },
    exam: {
      general: "Minder mimiek, traag in beweging.",
      vitals: "Vitale parameters niet afwijkend.",
      neuro: "Bradykinesie, rusttremor rechts en lichte rigiditeit rechts; gang traag met minder armzwaai.",
      legs: "Geen perifere uitval.",
    },
  },
  "kind-koorts": {
    patient: {
      start: "Mijn kind heeft sinds gisteren koorts.",
      onset: "Sinds ongeveer 24 uur.",
      pattern: "De koorts schommelt, tussendoor speelt hij nog wat.",
      fever: "De temperatuur was 39,2.",
      cough: "Geen duidelijke benauwdheid of veel hoesten.",
      drinking: "Hij drinkt redelijk, minder dan normaal maar niet zorgwekkend.",
      voiding: "Hij plast nog.",
      rash: "Geen vlekjes die ik niet kan wegdrukken.",
      neck: "Geen nekstijfheid.",
      history: "Verder gezond en gevaccineerd volgens schema.",
      meds: "We hebben paracetamol gegeven.",
      concern: "Ik wil weten wanneer ik me zorgen moet maken.",
      function: "Hij speelt tussendoor nog, maar is hangerig bij koorts.",
    },
    exam: {
      general: "Niet ziek ogend, maakt contact en speelt tussendoor.",
      vitals: "T 39.2, pols passend bij koorts, ademhaling niet afwijkend, capillary refill normaal.",
      hydration: "Niet gedehydreerd; slijmvliezen vochtig.",
      lungs: "Geen intrekkingen, geen focale afwijkingen.",
      throat: "Keel niet duidelijk afwijkend.",
      ears: "Geen duidelijke otitis bij inspectie.",
      skin: "Geen petechiën of niet-wegdrukbare uitslag.",
    },
  },
  "kind-bronchiolitis": {
    patient: {
      start: "Mijn baby is verkouden, piept en drinkt nog maar ongeveer de helft.",
      onset: "Het begon een paar dagen geleden met verkoudheid; vandaag ademt hij zwaarder.",
      pattern: "Het is geleidelijk erger geworden, geen losse aanvallen.",
      cough: "Hij hoest en piept.",
      dyspnea: "Ja, hij trekt wat in bij het ademen.",
      drinking: "Hij drinkt ongeveer de helft van normaal.",
      voiding: "Minder natte luiers dan normaal.",
      fever: "Een beetje verhoging, geen hoge koorts op de voorgrond.",
      history: "Hij is 5 maanden en verder gezond.",
      meds: "Geen vaste medicatie.",
      concern: "We zijn bang dat hij te weinig lucht of vocht krijgt.",
    },
    exam: {
      general: "Alert maar vermoeid, lichte intrekkingen.",
      vitals: "Saturatie 92%, AH verhoogd, pols verhoogd, T licht verhoogd.",
      lungs: "Expiratoir piepen en fijne crepitaties passend bij bronchiolitis.",
      hydration: "Milde tekenen van minder intake, slijmvliezen nog vochtig.",
      heart: "Tachycard passend bij inspanning/ziekte.",
    },
  },
  "buik-eug": {
    patient: {
      start: "Ik heb acute pijn onder in mijn buik en wat vaginaal bloedverlies.",
      onset: "Het begon vandaag vrij acuut.",
      pattern: "De pijn blijft aanwezig en wordt soms stekend erger.",
      triggers: "Bewegen maakt het erger.",
      abdomen: "De pijn zit vooral laag in de buik.",
      gyn: "Mijn menstruatie is ongeveer twee weken te laat en ik heb licht bloedverlies.",
      pregnancy: "Ik zou zwanger kunnen zijn.",
      urinary: "Geen duidelijke branderigheid bij plassen.",
      stool: "Geen diarree.",
      syncope: "Ik word duizelig bij opstaan.",
      fever: "Geen koorts.",
      meds: "Geen antistolling.",
      concern: "Ik maak me zorgen omdat mijn menstruatie uitblijft.",
    },
    exam: {
      general: "Pijnlijk en wat bleek, alert.",
      vitals: "RR 105/65, pols 108/min, T 37.0.",
      abdomen: "Drukpijn onderbuik, lichte défense mogelijk.",
      gyn: "Speculum/VT alleen met uitleg; pijn bij mobilisatie cervix kan aanwezig zijn.",
      heart: "Tachycard, regulair.",
    },
  },
  "buik-niersteen": {
    patient: {
      start: "Ik heb heftige koliekpijn links in mijn flank richting de lies.",
      onset: "Het begon ineens vandaag.",
      pattern: "De pijn komt in golven en ik kan niet stil zitten.",
      triggers: "Geen houding helpt echt.",
      abdomen: "Het zit links in mijn zij/flank en trekt naar de lies.",
      urinary: "Ik moet vaker plassen; geen duidelijke koorts. Er kan bloed bij de urine zitten.",
      nausea: "Ik ben misselijk.",
      fever: "Geen koorts of koude rillingen.",
      history: "Ik heb dit niet eerder zo gehad.",
      meds: "Geen vaste medicatie.",
      allergy: "Geen bekende allergieën.",
      concern: "Ik wil vooral dat de pijn stopt.",
    },
    exam: {
      general: "Veel bewegingsdrang, pijnlijk maar niet septisch.",
      vitals: "RR 145/85, pols 96/min, T 36.8.",
      abdomen: "Buik soepel, geen peritoneale prikkeling.",
      renal: "Slagpijn links in de nierloge.",
      urinary: "Urinedip: bloed positief, nitriet/leukocyten niet op de voorgrond.",
    },
  },
  "soa-pid": {
    patient: {
      start: "Ik heb onderbuikpijn en meer vaginale afscheiding.",
      onset: "Sinds enkele dagen, langzaam erger.",
      pattern: "De pijn is meestal aanwezig en wordt erger bij vrijen.",
      abdomen: "De pijn zit laag in de buik.",
      gyn: "Ik heb meer fluor en diepe pijn bij gemeenschap.",
      sexual: "Ik heb een nieuwe partner gehad en niet altijd condooms gebruikt.",
      pregnancy: "Zwangerschap is niet helemaal uitgesloten.",
      fever: "Ik had wat verhoging, rond 38 graden.",
      urinary: "Geen duidelijke blaasontstekingklachten.",
      meds: "Geen vaste medicatie.",
      concern: "Ik schaam me wat, maar wil weten of het een SOA kan zijn.",
    },
    exam: {
      general: "Niet toxisch ziek, wel pijnlijk.",
      vitals: "T 38.1, pols licht verhoogd, RR stabiel.",
      abdomen: "Drukpijn onderbuik, geen duidelijke peritoneale prikkeling.",
      gyn: "Bij speculum fluor; VT kan slingerpijn en adnexdrukpijn geven.",
    },
  },
  "soa-bloedverlies": {
    patient: {
      start: "Ik heb weer vaginaal bloedverlies, terwijl ik al jaren niet meer menstrueer.",
      onset: "Het begon deze week.",
      pattern: "Het is licht bloedverlies, niet hevig.",
      gyn: "Ik ben zes jaar na de overgang en heb geen buikpijn.",
      abdomen: "Geen buikpijn.",
      sexual: "Geen nieuwe seksuele klachten op de voorgrond.",
      meds: "Geen antistolling of hormonen genoemd.",
      concern: "Ik ben bang dat het iets ernstigs kan zijn.",
      function: "Ik voel me verder stabiel.",
    },
    exam: {
      general: "Hemodynamisch stabiel, niet ziek.",
      vitals: "RR en pols stabiel, geen koorts.",
      abdomen: "Buik soepel, geen drukpijn.",
      gyn: "Speculumonderzoek op indicatie: bloedverlies uit cervix/uterus beoordelen, geen acute hevige bloeding.",
    },
  },
  "msk-rug": {
    patient: {
      start: "Ik heb lage rugpijn na tillen.",
      onset: "Het begon direct na tillen.",
      pattern: "De pijn is mechanisch: erger bij bewegen, beter in rust.",
      triggers: "Buk- en draaibewegingen maken het erger.",
      back: "De pijn zit laag in de rug en straalt niet onder de knie uit.",
      neuro: "Geen krachtsverlies of gevoelsstoornissen.",
      urinary: "Geen problemen met plassen of ontlasting.",
      fever: "Geen koorts.",
      history: "Geen kanker in de voorgeschiedenis en geen trauma behalve tillen.",
      meds: "Ik heb nog weinig pijnstilling geprobeerd.",
      concern: "Ik ben bang dat er iets verschoven is.",
      function: "Werken en bukken lukt slecht.",
    },
    exam: {
      general: "Beweegt voorzichtig, niet ziek.",
      vitals: "Geen koorts; vitale parameters niet afwijkend.",
      back: "Drukpijn paravertebraal lumbaal, beperkte flexie door pijn.",
      neuro: "Kracht, sensibiliteit en reflexen benen intact; Lasègue niet duidelijk positief.",
      abdomen: "Geen buikpijn of AAA-tekenen op de voorgrond.",
    },
  },
  "msk-knie": {
    patient: {
      start: "Ik heb mijn knie verdraaid tijdens voetbal en hij wil niet goed strekken.",
      onset: "Het gebeurde direct tijdens een draaibeweging.",
      pattern: "Sindsdien pijn en slotklachten.",
      triggers: "Strekken, draaien en belasten doen pijn.",
      knee: "De knie werd later dik en ik kan hem niet goed strekken.",
      trauma: "Ja, een draai-trauma tijdens voetbal.",
      neuro: "Geen tintelingen in de voet.",
      meds: "Ik heb nog geen sterke pijnstilling gebruikt.",
      concern: "Ik ben bang dat er iets vastzit in de knie.",
      function: "Lopen gaat moeizaam en sporten kan niet.",
    },
    exam: {
      general: "Loopt antalgisch.",
      vitals: "Geen koorts, vitale parameters niet afwijkend.",
      knee: "Zwelling, beperkte extensie en pijn bij rotatie; slotstand mogelijk.",
      legs: "Neurovasculaire status distaal intact.",
    },
  },
  "psych-depressie": {
    patient: {
      start: "Ik ben al weken somber en uitgeput.",
      onset: "Ongeveer acht weken.",
      pattern: "Het is bijna dagelijks aanwezig.",
      mental: "Ik heb weinig plezier, pieker veel en voel me waardeloos.",
      sleep: "Ik slaap slecht en word vroeg wakker.",
      appetite: "Mijn eetlust is minder.",
      suicidality: "Ik denk soms dat het niet meer hoeft, maar ik heb geen concreet plan.",
      psychosis: "Geen stemmen of wanen.",
      alcohol: "Ik drink soms meer dan normaal, maar geen drugs.",
      history: "Niet eerder zo ernstig doorgemaakt.",
      meds: "Geen antidepressiva.",
      concern: "Ik ben bang dat ik zo niet kan blijven werken.",
      function: "Werk lukt slecht; ik meld me vaker ziek.",
    },
    exam: {
      general: "Vermoeide indruk, oogcontact wisselend.",
      mental: "Somber affect, vertraagd tempo, coherent denken, geen psychotische kenmerken.",
      vitals: "Somatisch geen acute afwijkingen op de voorgrond.",
    },
  },
  "endo-hypo": {
    patient: {
      start: "Ik ben al maanden moe, kouwelijk en aangekomen.",
      onset: "Het speelt al een paar maanden.",
      pattern: "Het is geleidelijk erger geworden.",
      triggers: "Geen duidelijke trigger.",
      weight: "Ik ben aangekomen.",
      bowel: "Ik heb obstipatie.",
      skin: "Mijn huid voelt droger.",
      mental: "Ik voel me traag en futloos.",
      fever: "Geen koorts.",
      meds: "Geen lithium of amiodaron genoemd.",
      family: "Geen duidelijke schildklierziekte in de familie bekend.",
      concern: "Ik vraag me af of mijn schildklier te traag werkt.",
      function: "Ik kom moeilijk door de dag.",
    },
    exam: {
      general: "Traag en vermoeid ogend, niet acuut ziek.",
      vitals: "Pols rustig, RR niet afwijkend, T normaal.",
      thyroid: "Geen duidelijke struma palpabel.",
      skin: "Droge huid, geen alarmsignalen.",
      heart: "Rustig regulair ritme.",
    },
  },
  "endo-diabetes": {
    patient: {
      start: "Ik heb veel dorst, plas veel en zie soms wazig.",
      onset: "Dat speelt al een paar maanden.",
      pattern: "Het is geleidelijk toegenomen.",
      drinking: "Ik drink veel meer dan normaal.",
      urinary: "Ik moet vaak plassen, ook 's nachts.",
      weight: "Mijn gewicht is eerder toegenomen; ik ben niet snel afgevallen.",
      nausea: "Geen braken.",
      mental: "Ik ben niet suf of verward.",
      history: "Mijn vader heeft diabetes.",
      meds: "Geen diabetesmedicatie.",
      concern: "Ik denk zelf aan suikerziekte.",
      function: "Ik ben moe en wazig zien hindert me.",
    },
    exam: {
      general: "Niet acuut ziek, niet suf.",
      vitals: "RR licht verhoogd, pols normaal, T normaal.",
      hydration: "Geen duidelijke dehydratie.",
      weight: "BMI ongeveer 32.",
      feet: "Voetonderzoek op indicatie; geen acute wond genoemd.",
    },
  },
};

const CASES = [
  {
    id: "dyspneu-astma",
    route: "dyspneu",
    title: "24 jaar, benauwd en piepend",
    stem: "Een vrouw met atopie krijgt sinds vannacht benauwdheid, piepen en hoesten. Geen koorts. Ze spreekt in zinnen, saturatie 96%, pols 98.",
    meta: ["Patroon: expiratoir piepen", "Geen thoracale drukpijn", "Geen DVT-risico"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["astma/COPD-aanval", "hyperventilatie/paniek"],
      tests: ["Lichamelijk onderzoek en alarmsymptomen", "ABCDE en vitale parameters"],
      actions: ["SABA inhalatie", "Safety net met alarmsymptomen"],
      avoid: ["Geen spirometrie in acute aanval", "Geen routine-X-thorax bij ongecompliceerd hoesten"],
    },
  },
  {
    id: "dyspneu-pe",
    route: "dyspneu",
    title: "32 jaar, acuut kortademig postpartum",
    stem: "Acuut ontstane dyspneu met pleuritische pijn. Twee weken geleden bevallen. Pols 118, saturatie 93%, geen duidelijke crepitaties.",
    meta: ["Risico: postpartum", "Pleuritische pijn", "Tachycardie"],
    correct: {
      urgency: [URGENCY.sameDay],
      dd: ["longembolie", "pneumothorax", "ACS"],
      tests: ["ABCDE en vitale parameters", "Beslisregel/Wells, geen los D-dimeer", "Dezelfde dag beeldvorming via verwijzing"],
      actions: ["Specialistisch overleg bij twijfel of alarmsymptomen", "Safety net met alarmsymptomen"],
      avoid: ["Geen los D-dimeer zonder beslisregel", "Geen geruststelling zonder safety net"],
    },
  },
  {
    id: "dyspneu-hf",
    route: "dyspneu",
    title: "76 jaar, orthopneu en enkeloedeem",
    stem: "Sinds weken progressieve dyspneu, nu twee kussens nodig. Enkeloedeem, crepitaties basaal, RR 150/88, pols 96.",
    meta: ["Chronisch progressief", "Oedeem en orthopneu", "Crepitaties"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["hartfalen", "anemie", "longziekte"],
      tests: ["ECG", "NT-proBNP/BNP bij verdenking hartfalen", "Hb/nierfunctie/elektrolyten/TSH"],
      actions: ["Diureticum bij overvulling", "Cardiologie/echo voor bevestiging", "Safety net met alarmsymptomen"],
      avoid: ["Geen behandeling zonder controle nierfunctie/elektrolyten", "Geen beeldvorming als uitslag beleid niet verandert"],
    },
  },
  {
    id: "dyspneu-pneumonie",
    route: "dyspneu",
    title: "58 jaar, hoest en koorts",
    stem: "Drie dagen koorts, productieve hoest en pijn bij diep inademen. Rechts basaal crepitaties, saturatie 94%. Twijfel pneumonie.",
    meta: ["Koorts en focale auscultatie", "Geen shock", "Volwassen patient"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["pneumonie", "acuut hoesten", "longembolie"],
      tests: ["CRP bij volwassen twijfel pneumonie", "Lichamelijk onderzoek en alarmsymptomen"],
      actions: ["Antibioticum bij pneumonie", "Safety net met alarmsymptomen"],
      avoid: ["Geen routine-X-thorax bij ongecompliceerd hoesten", "Geen routine-antibiotica bij viraal beeld"],
    },
  },
  {
    id: "thorax-acs",
    route: "thorax",
    title: "63 jaar, drukkende pijn op de borst",
    stem: "Drukkende retrosternale pijn sinds 40 minuten, uitstraling naar linkerarm, zweten en misselijk. Diabetes en roken.",
    meta: ["Vegetatieve klachten", "Cardiovasculaire risicofactoren", "Acuut beloop"],
    correct: {
      urgency: [URGENCY.spoed],
      dd: ["ACS", "stabiele angina", "reflux/spierpijn"],
      tests: ["ECG", "ABCDE en vitale parameters"],
      actions: ["Ambulance/SEH bij ACS-verdenking", "Specialistisch overleg bij twijfel of alarmsymptomen"],
      avoid: ["Geen inspanningstest in de huisartsenpraktijk bij ACS-verdenking", "Geen geruststelling bij vegetatieve klachten en drukpijn"],
    },
  },
  {
    id: "thorax-af",
    route: "thorax",
    title: "74 jaar, hartkloppingen en duizelig",
    stem: "Sinds gisteren palpitaties. Pols irregulair 130/min, RR 135/80, niet benauwd in rust. Geen thoracale pijn.",
    meta: ["Irregulaire pols", "Hemodynamisch stabiel", "Geen ACS-klachten"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["atriumfibrilleren", "SVT", "hyperthyreoidie"],
      tests: ["ECG", "TSH/Hb/elektrolyten op indicatie", "ABCDE en vitale parameters"],
      actions: ["Frequentiecontrole bij AF", "CVRM optimaliseren", "Safety net met alarmsymptomen"],
      avoid: ["Geen geruststelling zonder ECG bij irregulaire pols"],
    },
  },
  {
    id: "neuro-tia",
    route: "neurologie",
    title: "67 jaar, 20 minuten afasie",
    stem: "Plots niet uit woorden kunnen komen, volledig hersteld na 20 minuten. Nu neurologisch onderzoek normaal. Hypertensie.",
    meta: ["Acuut neurologisch symptoom", "Volledig hersteld", "Vasculair risico"],
    correct: {
      urgency: [URGENCY.sameDay],
      dd: ["CVA/TIA", "hypoglykemie", "migraine"],
      tests: ["Glucose bij acute uitval", "RR en medicatie/antistolling", "ABCDE en vitale parameters"],
      actions: ["TIA-service dezelfde dag", "Specialistisch overleg bij twijfel of alarmsymptomen"],
      avoid: ["Geen afwachtbeleid bij actieve neurologische uitval", "Geen geruststelling zonder safety net"],
    },
  },
  {
    id: "neuro-parkinson",
    route: "neurologie",
    title: "71 jaar, traag en tremor rechts",
    stem: "Sinds maanden traag lopen, kleiner handschrift en rusttremor rechts. Partner merkt minder mimiek.",
    meta: ["Chronisch progressief", "Asymmetrische rusttremor", "Bradykinesie"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["Parkinson", "essentiele tremor", "medicatie-effect"],
      tests: ["Neurologisch onderzoek", "Medicatiecheck"],
      actions: ["Neuroloog bij Parkinson-verdenking", "Actief volgen met concrete controletermijn"],
      avoid: ["Geen start dopaminerge therapie zonder diagnose/overleg"],
    },
  },
  {
    id: "kind-koorts",
    route: "kind",
    title: "2 jaar, koorts zonder focus",
    stem: "Sinds 24 uur koorts 39.2. Drinkt redelijk, speelt tussendoor, geen benauwdheid, geen nekstijfheid. Oor/keel/longen geen focus.",
    meta: ["Niet ziek ogend", "Geen focus", "Drinkt redelijk"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["viraal", "UWI", "pneumonie"],
      tests: ["Kijkgedrag en vitale ernst", "Urineonderzoek bij UWI-verdenking"],
      actions: ["Herbeoordeling bij persisterende koorts", "Safety net met alarmsymptomen"],
      avoid: ["Geen routine-CRP bij kind met koorts", "Geen geruststelling als drinken/plassen onvoldoende is"],
    },
  },
  {
    id: "kind-bronchiolitis",
    route: "kind",
    title: "5 maanden, hoesten en intrekkingen",
    stem: "Baby met verkoudheid, piepen, lichte intrekkingen en drinkt de helft. Saturatie 92%, ouders ongerust.",
    meta: ["Leeftijd < 1 jaar", "Minder drinken", "Lage saturatie"],
    correct: {
      urgency: [URGENCY.sameDay],
      dd: ["bronchiolitis", "pneumonie", "dehydratie"],
      tests: ["Kijkgedrag en vitale ernst", "Dehydratietekenen", "Saturatie op indicatie"],
      actions: ["Spoed bij ziek kind", "Specialistisch overleg bij twijfel of alarmsymptomen"],
      avoid: ["Geen routine-CRP bij kind met koorts", "Geen routine-antibiotica bij viraal beeld"],
    },
  },
  {
    id: "buik-eug",
    route: "buik",
    title: "28 jaar, onderbuikpijn en late menstruatie",
    stem: "Acute onderbuikpijn, licht vaginaal bloedverlies, menstruatie 2 weken te laat. Duizelig bij opstaan.",
    meta: ["Vruchtbare leeftijd", "Late menstruatie", "Duizeligheid"],
    correct: {
      urgency: [URGENCY.sameDay],
      dd: ["EUG", "appendicitis/peritonitis", "PID"],
      tests: ["Pregnancy test bij vruchtbare vrouw", "ABCDE en vitale parameters", "Gericht urineonderzoek"],
      actions: ["Spoed bij peritoneale prikkeling", "Specialistisch overleg bij twijfel of alarmsymptomen"],
      avoid: ["Geen vertraging door lab bij acute buik"],
    },
  },
  {
    id: "buik-niersteen",
    route: "buik",
    title: "45 jaar, koliekpijn flank",
    stem: "Heftige koliekpijn links flank naar lies, bewegingsdrang, misselijk. Geen koorts. Urinedip bloed positief.",
    meta: ["Koliek", "Hematurie", "Geen koorts"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["niersteen", "pyelonefritis", "AAA"],
      tests: ["Urinedip bij flankpijn", "Nierfunctie op indicatie", "ABCDE en vitale parameters"],
      actions: ["NSAID bij niersteenkoliek als mogelijk", "Safety net met alarmsymptomen"],
      avoid: ["Geen beeldvorming als uitslag beleid niet verandert"],
    },
  },
  {
    id: "soa-pid",
    route: "soa",
    title: "23 jaar, onderbuikpijn en fluor",
    stem: "Onderbuikpijn, diepe dyspareunie en toegenomen fluor. Nieuwe partner. Temp 38.1, drukpijn onderbuik.",
    meta: ["SOA-risico", "PID-symptomen", "Zwangerschap moet worden uitgesloten"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["PID", "EUG", "appendicitis"],
      tests: ["Zwangerschapstest", "PCR chlamydia/gonorroe", "Speculumonderzoek en VT op indicatie"],
      actions: ["Combinatie-antibiotica bij PID-verdenking", "Partnerwaarschuwing", "Controle na 2-3 dagen"],
      avoid: ["Geen echo als test om PID te bevestigen", "Geen Mycoplasma genitalium-test voor PID"],
    },
  },
  {
    id: "soa-bloedverlies",
    route: "soa",
    title: "59 jaar, postmenopauzaal bloedverlies",
    stem: "Na 6 jaar amenorroe opnieuw vaginaal bloedverlies. Geen buikpijn, hemodynamisch stabiel.",
    meta: ["Postmenopauzaal", "Geen acute instabiliteit", "Maligniteit uitsluiten"],
    correct: {
      urgency: [URGENCY.sameDay],
      dd: ["maligniteit bij postmenopauzaal bloedverlies", "cyclusstoornis", "medicatie-effect"],
      tests: ["Hemodynamiek beoordelen", "Speculumonderzoek op indicatie"],
      actions: ["Verwijzen bij postmenopauzaal bloedverlies", "Safety net met alarmsymptomen"],
      avoid: ["Geen afwachtbeleid bij postmenopauzaal bloedverlies"],
    },
  },
  {
    id: "msk-rug",
    route: "bewegingsapparaat",
    title: "42 jaar, acute lage rugpijn",
    stem: "Na tillen lage rugpijn. Geen uitstraling onder knie, geen mictieproblemen, geen koorts, geen maligniteit in voorgeschiedenis.",
    meta: ["Mechanisch begin", "Geen neurologische red flags", "Geen systemische alarmsymptomen"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["aspecifieke rugpijn", "radiculair syndroom", "cauda equina"],
      tests: ["Neurologisch onderzoek", "Lichamelijk onderzoek en alarmsymptomen"],
      actions: ["Actief blijven en pijnstilling", "Safety net met alarmsymptomen"],
      avoid: ["Geen beeldvorming bij aspecifieke rugpijn zonder red flags"],
    },
  },
  {
    id: "msk-knie",
    route: "bewegingsapparaat",
    title: "31 jaar, knie gedraaid met slotklachten",
    stem: "Tijdens voetbal knie gedraaid. Direct pijn, later zwelling. Kan niet goed strekken; slotklachten.",
    meta: ["Trauma", "Slotklachten", "Zwelling"],
    correct: {
      urgency: [URGENCY.sameDay],
      dd: ["meniscusletsel", "fractuur", "bandletsel"],
      tests: ["Belastbaarheid en stabiliteit", "X-knie bij fractuurverdenking"],
      actions: ["Verwijzen bij slotstand/instabiliteit", "Pijnstilling en uitleg"],
      avoid: ["Geen MRI-knie routinematig in eerste lijn"],
    },
  },
  {
    id: "psych-depressie",
    route: "psychisch",
    title: "35 jaar, somber en uitgeput",
    stem: "Acht weken somber, anhedonie, slecht slapen, minder functioneren op werk. Geen psychose, geen actueel suïcideplan.",
    meta: ["Duur > 2 weken", "Functionele beperking", "Veiligheid checken"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["depressie", "burn-out", "somatische oorzaak"],
      tests: ["Suicidaliteit actief uitvragen", "Somatisch onderzoek/lab alleen op indicatie", "Slaap en middelengebruik uitvragen"],
      actions: ["Activerend beleid en follow-up", "CGT/exposure bij angst", "Start behandelroute volgens NHG/FK"],
      avoid: ["Geen lab zonder somatische aanwijzing", "Geen patient alleen laten bij hoog suiciderisico"],
    },
  },
  {
    id: "endo-hypo",
    route: "endocrien",
    title: "48 jaar, moe, koud en aangekomen",
    stem: "Maanden moe, kouwelijk, obstipatie en gewichtstoename. Geen acuut ziek beeld.",
    meta: ["Chronisch beloop", "Hypothyreoidie-klachten", "Geen spoedtekens"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["hypothyreoidie", "depressie/anemie", "diabetes"],
      tests: ["TSH met FT4 bij afwijking", "Lab alleen als uitslag beleid verandert"],
      actions: ["Levothyroxine bij bevestigde hypothyreoidie", "Actief volgen met concrete controletermijn"],
      avoid: ["Geen levothyroxine zonder bevestigde diagnose", "Geen breed lab zonder hypothese"],
    },
  },
  {
    id: "endo-diabetes",
    route: "endocrien",
    title: "56 jaar, dorst en veel plassen",
    stem: "Sinds maanden dorst, polyurie en wazig zien. Niet suf, geen braken. BMI 32, vader diabetes.",
    meta: ["Hyperglykemie-klachten", "Niet acuut ziek", "Risicofactoren aanwezig"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["diabetes", "DKA/HHS", "schildklierstoornis"],
      tests: ["Glucose/HbA1c", "ABCDE en vitale parameters"],
      actions: ["Leefstijl en diabetesmedicatie volgens NHG", "Safety net met alarmsymptomen"],
      avoid: ["Geen breed lab zonder hypothese"],
    },
  },

  // ── 2/2026 ontbrekende casussen ─────────────────────────────────────────
  {
    id: "psych-paniek",
    route: "psychisch",
    title: "38 jaar, aanvallen van angst en benauwd",
    stem: "Recidiverende episodes van plotse hartkloppingen, benauwdheid, zweten en doodsangst — elk 10–15 minuten. Tussendoor angstig voor nieuwe aanval. Somatisch eerder normaal bevonden.",
    meta: ["Recidiverend patroon", "Autonome symptomen", "Anticipatieangst"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["paniekstoornis", "gegeneraliseerde angststoornis", "hyperthyreoidie", "cardiale oorzaak"],
      tests: ["TSH bij eerste presentatie", "ECG bij onduidelijkheid", "Suicidaliteit uitvragen"],
      actions: ["CGT/exposure bij angst", "Psycho-educatie over paniek", "Safety net met alarmsymptomen", "Actief volgen met concrete controletermijn"],
      avoid: ["Geen chronische benzodiazepinen", "Geen geruststelling zonder safety net"],
    },
  },
  {
    id: "msk-schouder",
    route: "bewegingsapparaat",
    title: "52 jaar, pijn en zwakte in de schouder",
    stem: "Rechter schouderpijn al 6 weken, erger bij heffen boven schouderhoogte. Ochtendstijfheid < 30 min. Geen trauma. Drukpijn onder het acromion.",
    meta: ["Pijn bij abductie", "Geen trauma", "Drukpijn acromion"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["subacromiaal pijnsyndroom", "frozen shoulder", "rotatorcuff-ruptuur", "artrose AC-gewricht"],
      tests: ["Bewegingsonderzoek schouder", "Neer- en Hawkins-test op indicatie", "X-schouder bij fractuurverdenking"],
      actions: ["NSAID/paracetamol en fysiotherapie", "Corticosteroïdinjectie op indicatie", "Safety net met alarmsymptomen"],
      avoid: ["Geen MRI-schouder routinematig in eerste lijn", "Geen immobilisatie zonder indicatie"],
    },
  },
  {
    id: "buik-pancreas",
    route: "buik",
    title: "68 jaar, gele huid en gewichtsverlies",
    stem: "Geleidelijk ontstane geelzucht (gele sclera, donkere urine, ontkleurde ontlasting), 5 kg afgevallen in 2 maanden. Geen koorts, pijn op de achtergrond. Roker, alcohol 2 glazen/dag.",
    meta: ["Pijnloze icterus", "Gewichtsverlies > 5%", "Oudere man"],
    correct: {
      urgency: [URGENCY.sameDay],
      dd: ["pancreascarcinoom", "choledocholithiasis", "hepatocellulair carcinoom", "alcoholische hepatitis"],
      tests: ["Leverfunctie, bilirubine, CA 19-9", "Echo abdomen dezelfde dag bij obstructieve icterus", "ABCDE en vitale parameters"],
      actions: ["Spoed verwijzing bij obstructieve icterus", "Specialistisch overleg bij twijfel of alarmsymptomen"],
      avoid: ["Geen afwachtbeleid bij pijnloze icterus", "Geen geruststelling zonder safety net"],
    },
  },
  {
    id: "chirurgie-pav",
    route: "buik",
    title: "65 jaar, krampende kuitpijn bij lopen",
    stem: "Inspanningsgebonden krampende pijn linker kuit, verdwijnt na 2 minuten rust. Loopafstand 200 m. DM type 2, roken 30 jaar. Koude voet links, verminderd perifeer pols.",
    meta: ["Claudicatio intermittens", "Cardiovasculaire risicofactoren", "Koude extremiteit"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["PAV/claudicatio intermittens", "lumbale kanaalstenose", "diabetische neuropathie", "arteriële embolie/trombose"],
      tests: ["Enkel-armindex (EAI)", "ABCDE en vitale parameters", "Lipidenspectrum en HbA1c"],
      actions: ["Leefstijladvies: stoppen met roken, looptraining", "CVRM optimaliseren", "Vaatchirurgie bij kritische ischemie", "Safety net met alarmsymptomen"],
      avoid: ["Geen geruststelling zonder EAI-meting", "Geen beeldvorming als uitslag beleid niet verandert"],
    },
  },

  // ── Extra varianten per categorie ────────────────────────────────────────
  {
    id: "dyspneu-copd",
    route: "dyspneu",
    title: "69 jaar, COPD-exacerbatie",
    stem: "Bekende COPD Gold III, afgelopen 3 dagen meer hoest, geel sputum en dyspneu in rust. Pols 118, saturatie 88%, gebruik van hulpademhalingsspieren.",
    meta: ["Bekende COPD", "Hypoxie", "Productief sputum"],
    correct: {
      urgency: [URGENCY.sameDay],
      dd: ["COPD-exacerbatie", "pneumonie", "hartfalen", "astma-COPD overlap"],
      tests: ["Saturatie en ABCDE", "CRP bij pneumonieverdenking", "ECG op indicatie"],
      actions: ["SABA en ipratropium", "Antibioticum bij purulent sputum", "Prednisolon bij ernstige exacerbatie", "Safety net met alarmsymptomen"],
      avoid: ["Geen spirometrie in acute aanval", "Geen geruststelling zonder saturatiemeting"],
    },
  },
  {
    id: "thorax-stabielap",
    route: "thorax",
    title: "61 jaar, inspanningspijn op de borst",
    stem: "Drukkend gevoel op de borst bij traplopen, verdwijnt na 2–3 minuten rust. Geen klachten in rust. RR 148/88, cholesterol verhoogd.",
    meta: ["Inspanningsgebonden", "Verdwijnt in rust", "Cardiovasculair risico"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["stabiele angina pectoris", "GERD", "musculoskeletale pijn"],
      tests: ["ECG in rust", "Lipidenspectrum en HbA1c", "ABCDE en vitale parameters"],
      actions: ["CVRM optimaliseren", "Nitroglycerine SL bij aanval", "Cardioloog voor inspanningstest/beeldvorming", "Safety net met alarmsymptomen"],
      avoid: ["Geen inspanningstest in de huisartsenpraktijk bij ACS-verdenking", "Geen geruststelling zonder verdere diagnostiek"],
    },
  },
  {
    id: "psych-burnout",
    route: "psychisch",
    title: "44 jaar, uitgeput en kan niet meer",
    stem: "Maanden chronisch moe, concentratieproblemen, slaapproblemen en cynisme over werk. Niet meer functioneren. Geen suïcidale gedachten. Drukke baan, twee kinderen.",
    meta: ["Werkgerelateerd", "Functionele beperking", "Geen suïcidaliteit"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["burn-out", "depressieve stoornis", "aanpassingsstoornis", "hypothyreoidie/anemie"],
      tests: ["TSH en Hb om somatisch uit te sluiten", "Suicidaliteit uitvragen"],
      actions: ["Werkhervatting stapsgewijs met bedrijfsarts", "Activerend beleid en follow-up", "CGT/ACT bij persisterende klachten", "Safety net met alarmsymptomen"],
      avoid: ["Geen chronische benzodiazepinen", "Geen geruststelling zonder safety net"],
    },
  },
  {
    id: "kind-meningitis",
    route: "kind",
    title: "3 jaar, hoge koorts en nekstijfheid",
    stem: "Kind met koorts 40°C, nekstijfheid, sufheid en petechiën. Niet ziek ogend begon 8 uur geleden. Ouders extreem ongerust.",
    meta: ["Nekstijfheid", "Petechiën", "Suf kind"],
    correct: {
      urgency: [URGENCY.spoed],
      dd: ["meningitis bacteriëel", "sepsis", "meningokokkensepsis", "encefalitis"],
      tests: ["ABCDE en vitale parameters", "Spoed SEH — geen LP zonder stabilisatie"],
      actions: ["Ambulance/SEH bij meningisme en petechiën", "Antibiotica bij verdenking voor verwijzing indien >1u transport"],
      avoid: ["Geen afwachtbeleid bij meningisme en petechiën", "Geen LP in de huisartsenpraktijk"],
    },
  },
  {
    id: "soa-cervicitis",
    route: "soa",
    title: "26 jaar, afscheiding en pijn bij vrijen",
    stem: "Groengele vaginale afscheiding, pijn bij gemeenschap, wisselende partners, geen condoomgebruik. Geen koorts.",
    meta: ["SOA-risico", "Seksualiteitsvraag", "Geen koorts"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["cervicitis/SOA", "PID", "candida", "bacteriële vaginose"],
      tests: ["PCR chlamydia/gonorroe", "Zwangerschapstest", "Speculumonderzoek op indicatie"],
      actions: ["Antibiotica bij SOA-verdenking", "Partnerwaarschuwing", "Controle na 2-3 dagen"],
      avoid: ["Geen behandeling zonder partnerbeleid bij SOA", "Geen Mycoplasma genitalium-test voor PID"],
    },
  },
  {
    id: "neuro-hnp",
    route: "neurologie",
    title: "45 jaar, uitstralende rugpijn naar been",
    stem: "Lage rugpijn met uitstraling naar rechter onderbeen en voet (L5-dermatoom). Positieve Lasègue rechts. Pijn bij hoesten. Geen blaas-/darmproblematiek.",
    meta: ["Radiculair L5", "Positieve Lasègue", "Geen rode vlaggen"],
    correct: {
      urgency: [URGENCY.primary],
      dd: ["HNP/radiculair syndroom", "lumbale kanaalstenose", "piriformissyndroom"],
      tests: ["Neurologisch onderzoek", "Lichamelijk onderzoek en alarmsymptomen"],
      actions: ["Actief blijven en pijnstilling", "Verwijs bij cauda-equina tekenen of uitval > 6 weken", "Safety net met alarmsymptomen"],
      avoid: ["Geen MRI-lumbaal routinematig in eerste lijn < 6 weken", "Geen strict bedrust"],
    },
  },
];

const extraLabels = {
  "Beslisregel/Wells, geen los D-dimeer": "Beslisregel/Wells, geen los D-dimeer",
  "Dezelfde dag beeldvorming via verwijzing": "Dezelfde dag beeldvorming via verwijzing",
  "ECG": "ECG",
  "Hb/nierfunctie/elektrolyten/TSH": "Hb, nierfunctie, elektrolyten, TSH",
  "CRP bij volwassen twijfel pneumonie": "CRP bij volwassen twijfel pneumonie",
  "Saturatie op indicatie": "Saturatie op indicatie",
  "Nierfunctie op indicatie": "Nierfunctie op indicatie",
  "Hemodynamiek beoordelen": "Hemodynamiek beoordelen",
  "Speculumonderzoek op indicatie": "Speculumonderzoek op indicatie",
  "Belastbaarheid en stabiliteit": "Belastbaarheid en stabiliteit",
  "Verwijzen bij postmenopauzaal bloedverlies": "Verwijzen bij postmenopauzaal bloedverlies",
  "Verwijzen bij slotstand/instabiliteit": "Verwijzen bij slotstand/instabiliteit",
  "Controle na 2-3 dagen": "Controle na 2-3 dagen",
  "Diureticum bij overvulling": "Diureticum bij overvulling",
  "Cardiologie/echo voor bevestiging": "Cardiologie/echo voor bevestiging",
  "Antibioticum bij pneumonie": "Antibioticum bij pneumonie",
  "Medicatiecheck": "Medicatiecheck",
  "Neurologisch onderzoek": "Neurologisch onderzoek",
  "Belastbaarheid en stabiliteit": "Belastbaarheid en stabiliteit",
  "Verwijzen bij slotstand/instabiliteit": "Verwijzen bij slotstand/instabiliteit",
  "Geen behandeling zonder controle nierfunctie/elektrolyten": "Geen behandeling zonder controle nierfunctie/elektrolyten",
  "Geen geruststelling zonder ECG bij irregulaire pols": "Geen geruststelling zonder ECG bij irregulaire pols",
  "Geen start dopaminerge therapie zonder diagnose/overleg": "Geen start dopaminerge therapie zonder diagnose/overleg",
  "Geen afwachtbeleid bij postmenopauzaal bloedverlies": "Geen afwachtbeleid bij postmenopauzaal bloedverlies",
};

// ── Voice input/output ───────────────────────────────────────────────────────
let mediaRecorder = null;
let isRecording = false;
let audioChunks = [];

async function startRecording() {
  unlockAudioContext();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    alert("Microfoon toegang geweigerd. Sta toegang toe in je browser.");
    return;
  }
  const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
  mediaRecorder = new MediaRecorder(stream, { mimeType });
  audioChunks = [];
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
  mediaRecorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop());
    updateMicButton(false);
    const blob = new Blob(audioChunks, { type: mimeType });
    const text = await transcribeAudio(blob, mimeType);
    if (text) {
      const input = document.getElementById("chatInput");
      if (input) {
        input.value = text;
        input.focus();
        document.getElementById("sendChat")?.click();
      }
    }
  };
  mediaRecorder.start();
  isRecording = true;
  updateMicButton(true);
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
  }
}

async function transcribeAudio(blob, mimeType) {
  try {
    const resp = await fetch("/api/stt", {
      method: "POST",
      headers: { "Content-Type": mimeType },
      body: blob,
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.text || null;
  } catch {
    return null;
  }
}

let sharedAudioCtx = null;

function unlockAudioContext() {
  if (sharedAudioCtx) return;
  sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  // play a 1-sample silent buffer to satisfy the browser's autoplay policy
  const buf = sharedAudioCtx.createBuffer(1, 1, 22050);
  const src = sharedAudioCtx.createBufferSource();
  src.buffer = buf;
  src.connect(sharedAudioCtx.destination);
  src.start(0);
}

async function speakText(text) {
  if (!text || !sharedAudioCtx) return;
  try {
    const resp = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) return;
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await sharedAudioCtx.decodeAudioData(arrayBuffer);
    const src = sharedAudioCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(sharedAudioCtx.destination);
    src.start(0);
  } catch {
    // silent fail — TTS is enhancement only
  }
}

function updateMicButton(recording) {
  const btn = document.getElementById("micButton");
  if (!btn) return;
  btn.textContent = recording ? "⏹" : "🎙";
  btn.classList.toggle("recording", recording);
  btn.title = recording ? "Stop opname" : "Spreek je vraag in";
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Exam timer ───────────────────────────────────────────────────────────────
const TIMER_GESPREK = 20 * 60;
const TIMER_VERSLAG = 10 * 60;
let timerSeconds = TIMER_GESPREK;
let timerRunning = false;
let timerInterval = null;
let timerPhase = "gesprek";

function timerFmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function updateTimerDisplay() {
  const el = document.getElementById("timerDisplay");
  if (!el) return;
  el.textContent = timerFmt(timerSeconds);
  el.className = "timer-display";
  if (timerSeconds <= 60) el.classList.add("urgent");
  else if (timerSeconds <= 3 * 60) el.classList.add("warning");
  document.getElementById("timerStartBtn").textContent = timerRunning ? "⏸" : "▶";
}

function timerTick() {
  if (timerSeconds > 0) {
    timerSeconds--;
    updateTimerDisplay();
  } else {
    clearInterval(timerInterval);
    timerRunning = false;
    updateTimerDisplay();
    const phase = timerPhase === "gesprek" ? "gesprek (20 min)" : "verslag (10 min)";
    alert(`⏱ Tijd voor ${phase} is om!`);
  }
}

function timerSetPhase(phase) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerPhase = phase;
  timerSeconds = phase === "verslag" ? TIMER_VERSLAG : TIMER_GESPREK;
  document.getElementById("timerLabel").textContent = phase === "verslag" ? "Verslag" : "Gesprek";
  updateTimerDisplay();
}

function timerToggle() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
  } else {
    timerInterval = setInterval(timerTick, 1000);
    timerRunning = true;
  }
  updateTimerDisplay();
}

function timerReset() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = timerPhase === "verslag" ? TIMER_VERSLAG : TIMER_GESPREK;
  updateTimerDisplay();
}

document.addEventListener("click", (e) => {
  if (e.target.id === "timerStartBtn") timerToggle();
  if (e.target.id === "timerResetBtn") timerReset();
});
// ─────────────────────────────────────────────────────────────────────────────

let state = {
  routeFilter: "all",
  caseId: CASES[0].id,
  activeGroup: "urgency",
  view: "practice",
  selectedHistoryId: null,
  answers: {},
  transcripts: { anamnese: [], onderzoek: [] },
  verslag: "",
  options: {},
  evaluated: null,
  showModel: false,
  anamneseCheck: null,
  verslagCheck: null,
  progress: loadProgress(),
  history: loadHistory(),
};

const AI_AVAILABLE = location.protocol.startsWith("http");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function shuffle(values) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sample(values, count) {
  return shuffle(values).slice(0, count);
}

function currentCase() {
  return CASES.find((item) => item.id === state.caseId) || CASES[0];
}

function currentRoute() {
  return ROUTES[currentCase().route];
}

function getCorrect(caseItem = currentCase()) {
  const defaults = ROUTE_DEFAULTS[caseItem.route] || {};
  const specific = caseItem.correct || {};
  const merged = {};
  GROUPS.forEach((group) => {
    if (group.key === "urgency") {
      merged[group.key] = specific[group.key] || [];
    } else if (group.key === "verslag") {
      merged[group.key] = VERSLAG_SECTIONS;
    } else {
      merged[group.key] = uniq([...(defaults[group.key] || []), ...(specific[group.key] || [])]);
    }
  });
  return merged;
}

function labelFor(value) {
  return extraLabels[value] || value;
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("dkvTrainerProgress")) || { done: 0, totalScore: 0, streak: 0, best: {} };
  } catch {
    return { done: 0, totalScore: 0, streak: 0, best: {} };
  }
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem("dkvTrainerHistory"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  localStorage.setItem("dkvTrainerProgress", JSON.stringify(state.progress));
}

function saveHistory() {
  localStorage.setItem("dkvTrainerHistory", JSON.stringify(state.history.slice(0, HISTORY_LIMIT)));
}

function resetAnswers() {
  state.answers = {};
  GROUPS.forEach((group) => {
    state.answers[group.key] = [];
  });
  state.transcripts = { anamnese: [], onderzoek: [] };
  state.verslag = "";
  state.evaluated = null;
  state.showModel = false;
  state.anamneseCheck = null;
  state.verslagCheck = null;
}

function buildOptionsForCase(caseItem) {
  const route = ROUTES[caseItem.route];
  const mergedCorrect = getCorrect(caseItem);
  const options = {};
  GROUPS.forEach((group) => {
    if (["chat", "exam", "verslag"].includes(group.type)) {
      options[group.key] = [];
      return;
    }
    if (group.key === "urgency") {
      options[group.key] = Object.values(URGENCY);
      return;
    }
    const correct = mergedCorrect[group.key] || [];
    const routeDistractors = route.distractors[group.key] || [];
    const globalDistractors = GLOBAL_DISTRACTORS[group.key] || [];
    const distractors = sample(uniq([...routeDistractors, ...globalDistractors].filter((item) => !correct.includes(item))), group.key === "dd" ? 5 : 4);
    options[group.key] = shuffle(uniq([...correct, ...distractors]));
  });
  state.options = options;
}

function renderStats() {
  const { done, totalScore, streak } = state.progress;
  document.getElementById("statDone").textContent = done;
  document.getElementById("statAvg").textContent = done ? `${Math.round(totalScore / done)}%` : "0%";
  document.getElementById("statStreak").textContent = streak;
}

function renderRailActions() {
  const container = document.querySelector(".rail-buttons");
  if (!container) return;
  container.innerHTML = `
    <button id="newCase">Nieuwe casus</button>
    <button id="showModel">Modelantwoord</button>
    <button id="showHistory">Historie (${state.history.length})</button>
    <button id="backToPractice" ${state.view === "practice" ? "disabled" : ""}>Oefenen</button>
  `;
}

async function initAIStatus() {
  const el = document.getElementById("aiStatus");
  if (!AI_AVAILABLE) {
    el.textContent = "Local";
    el.className = "ai-status local";
    return;
  }
  try {
    const response = await fetch("/api/status");
    const status = await response.json();
    el.textContent = status.ai ? "ChatGPT" : "Local";
    el.className = `ai-status ${status.ai ? "online" : "local"}`;
    el.title = status.ai
      ? `AI model: ${status.model}`
      : "Geen OPENAI_API_KEY gevonden. Zet de sleutel in output/dkv_nhg_trainer/.env en herstart de server.";
  } catch {
    el.textContent = "Local";
    el.className = "ai-status local";
  }
}

function markAIError(message) {
  const el = document.getElementById("aiStatus");
  if (!el) return;
  el.textContent = "AI error";
  el.className = "ai-status error";
  el.title = message || "AI request failed; local fallback wordt gebruikt.";
}

function renderSelectors() {
  const routeFilter = document.getElementById("routeFilter");
  routeFilter.innerHTML = [
    `<option value="all">Alle routes</option>`,
    ...Object.entries(ROUTES).map(([id, route]) => `<option value="${id}">${escapeHtml(route.label)}</option>`),
  ].join("");
  routeFilter.value = state.routeFilter;

  const filtered = filteredCases();
  const casePicker = document.getElementById("casePicker");
  casePicker.innerHTML = filtered.map((item) => `<option value="${item.id}">${escapeHtml(item.title)}</option>`).join("");
  if (!filtered.some((item) => item.id === state.caseId)) {
    state.caseId = filtered[0]?.id || CASES[0].id;
    resetAnswers();
    buildOptionsForCase(currentCase());
  }
  casePicker.value = state.caseId;
}

function filteredCases() {
  return state.routeFilter === "all" ? CASES : CASES.filter((item) => item.route === state.routeFilter);
}

function renderCase() {
  const item = currentCase();
  const route = ROUTES[item.route];
  document.getElementById("routeKicker").textContent = route.label;
  document.getElementById("practiceTitle").textContent = item.title;
  document.getElementById("caseBox").innerHTML = `
    <h2>${escapeHtml(item.title)}</h2>
    <p>${escapeHtml(item.stem)}</p>
    <div class="case-meta">
      ${item.meta.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
    </div>
  `;
  const best = state.progress.best[item.id];
  const scorePill = document.getElementById("lastScore");
  scorePill.className = "score-pill";
  scorePill.textContent = best == null ? "Nog niet beoordeeld" : `Beste score: ${best}%`;
  if (best >= 80) scorePill.classList.add("good");
  else if (best != null) scorePill.classList.add("warn");
}

function renderTabs() {
  const tabs = document.getElementById("stepTabs");
  tabs.innerHTML = GROUPS.map(
    (group) => `<button type="button" class="${group.key === state.activeGroup ? "active" : ""}" data-tab="${group.key}">${escapeHtml(group.label)}</button>`
  ).join("");
}

function chipClass(groupKey, option) {
  if (!state.evaluated) return "";
  const selected = state.answers[groupKey] || [];
  const correct = getCorrect()[groupKey] || [];
  if (correct.includes(option) && selected.includes(option)) return "correct";
  if (correct.includes(option) && !selected.includes(option)) return "missed";
  if (!correct.includes(option) && selected.includes(option)) return "extra";
  return "";
}

function renderChatGroup(group) {
  const isExam = group.type === "exam";
  const transcript = state.transcripts[group.key] || [];
  const title = isExam ? "Lichamelijk onderzoek aanvragen" : "Anamnese: stel je vraag aan de patiënt";
  const placeholder = isExam
    ? "Bijv. Ik wil de vitale parameters meten en de longen ausculteren."
    : "Bijv. Sinds wanneer bent u benauwd? Heeft u koorts of pijn op de borst?";
  const messages = transcript.length
    ? transcript
        .map(
          (line) => `
          <div class="chat-message ${line.role}">
            <strong>${line.role === "doctor" ? "Arts" : isExam ? "Bevinding" : "Patiënt"}</strong>
            <span>${escapeHtml(line.text)}</span>
          </div>
        `
        )
        .join("")
    : `<div class="chat-empty">${isExam ? "Vraag welk onderzoek je wilt doen; de app geeft bevindingen terug." : "Begin zoals in het examen: open vraag, daarna gericht doorvragen."}</div>`;
  return `
    <section class="choice-group chat-workbench">
      <h3>${escapeHtml(title)}</h3>
      <div class="chat-log" id="chatLog">${messages}</div>
      <div class="chat-input-row">
        <textarea id="chatInput" rows="3" placeholder="${escapeHtml(placeholder)}"></textarea>
        <div class="chat-btn-col">
          <button type="button" id="micButton" class="mic-button" title="Spreek je vraag in">🎙</button>
          <button type="button" id="sendChat">${isExam ? "Onderzoek" : "Vraag"}</button>
        </div>
      </div>
      ${!isExam ? `<div class="anamnese-check-row"><button type="button" id="checkAnamnese" class="check-anamnese-btn">Wat heb ik gemist? →</button></div><div id="anamneseCheckResult" class="anamnese-check-result" style="display:none"></div>` : ""}
    </section>
  `;
}

function renderVerslagGroup() {
  return `
    <section class="choice-group verslag-workbench">
      <h3>Verslag schrijven</h3>
      <div class="verslag-template">
        <strong>Gebruik deze structuur:</strong>
        <span>Patiënt + reden van komst</span>
        <span>Speciële anamnese met relevante positieve en negatieve bevindingen</span>
        <span>Voorgeschiedenis, medicatie, allergieën, sociale context</span>
        <span>Lichamelijk onderzoek met vitale parameters</span>
        <span>Probleemlijst + DD</span>
        <span>Plan: aanvullend onderzoek, uitleg, beleid, controle en alarmsymptomen</span>
      </div>
      <textarea id="verslagAnswer" rows="12" placeholder="Schrijf hier je verslag zoals in het masterboek: Reden van komst, speciële anamnese, LO, probleemlijst, DD en plan.">${escapeHtml(state.verslag)}</textarea>
      <div class="anamnese-check-row">
        <button type="button" id="checkVerslag" class="check-anamnese-btn">Beoordeel mijn verslag →</button>
      </div>
      <div id="verslagCheckResult" class="anamnese-check-result" style="display:none"></div>
    </section>
  `;
}

function renderCurrentGroup() {
  const group = GROUPS.find((item) => item.key === state.activeGroup);
  if (group.type === "chat" || group.type === "exam") {
    document.getElementById("practiceForm").innerHTML = renderChatGroup(group);
    return;
  }
  if (group.type === "verslag") {
    document.getElementById("practiceForm").innerHTML = renderVerslagGroup();
    return;
  }
  const options = state.options[group.key] || [];
  const form = document.getElementById("practiceForm");
  const inputs = options.map((option) => {
    const checked = (state.answers[group.key] || []).includes(option) ? "checked" : "";
    const type = group.type;
    const name = group.type === "radio" ? group.key : `${group.key}-${option}`;
    const klass = chipClass(group.key, option);
    return `
      <label class="chip ${klass}">
        <input type="${type}" name="${escapeHtml(name)}" value="${escapeHtml(option)}" data-group="${group.key}" ${checked} />
        <span>${escapeHtml(labelFor(option))}</span>
      </label>
    `;
  }).join("");

  form.innerHTML = `
    <section class="choice-group">
      <h3>${escapeHtml(group.label)}</h3>
      <div class="chip-grid">${inputs}</div>
    </section>
  `;
}

function caseAgeText(caseItem) {
  const match = caseItem.title.match(/^(\d+)\s+(jaar|maanden?)/i);
  if (!match) return "volwassen";
  return `${match[1]} ${match[2]}`;
}

function identityFor(caseItem) {
  const age = caseAgeText(caseItem);
  const haystack = normalizeText(`${caseItem.title} ${caseItem.stem}`);
  const ageNumber = Number((age.match(/\d+/) || [0])[0]);
  const isChild = haystack.includes("maanden") || (age.includes("jaar") && ageNumber > 0 && ageNumber < 16);
  const isFemale = /(vrouw|bevalling|menstruatie|vaginaal|postmenopauzaal|fluor|dyspareunie|amenorroe)/.test(haystack);
  const name = isChild ? "Sam de Jong" : isFemale ? "Sara de Vries" : "Jan Jansen";
  return {
    name,
    age,
    isChild,
    identity: isChild ? `Mijn kind heet ${name}.` : `Ik heet ${name}.`,
    ageLine: isChild ? `Mijn kind is ${age}.` : `Ik ben ${age}.`,
  };
}

function storyFor(patient) {
  return uniq([patient.start, patient.onset, patient.pattern, patient.triggers, patient.severity, patient.dyspnea, patient.chest, patient.cough, patient.fever])
    .filter((line) => !line.startsWith("Er is geen duidelijke trigger bekend") && !line.startsWith("Het patroon past bij deze casus"))
    .slice(0, 3)
    .join(" ");
}

function dialogueFor(caseItem = currentCase()) {
  const route = caseItem.route;
  const caseSummary = `${caseItem.stem} ${caseItem.meta.join(" ")}`;
  const identity = identityFor(caseItem);
  const base = {
    patient: {
      identity: identity.identity,
      age: identity.ageLine,
      contact: "Mijn adres en telefoonnummer zijn voor deze oefencasus niet verder uitgewerkt.",
      start: caseItem.stem,
      onset: `Wat ik daarover kan vertellen: ${caseSummary}`,
      pattern: `Het patroon past bij deze casus: ${caseSummary}`,
      triggers: "Er is geen duidelijke trigger bekend buiten wat in de casus staat.",
      severity: `De ernst en beperkingen passen bij deze casus: ${caseSummary}`,
      fever: caseItem.stem.toLowerCase().includes("koorts") ? "Ja, er is koorts genoemd in deze casus." : "Nee, koorts staat niet op de voorgrond.",
      chest: caseItem.stem.toLowerCase().includes("pijn") ? "Er is pijn genoemd; vraag gerust naar locatie, karakter en alarmsymptomen." : "Geen duidelijke pijn op de borst op de voorgrond.",
      dyspnea: caseItem.stem.toLowerCase().includes("benauwd") ? "Ja, benauwdheid is een belangrijke klacht." : "Benauwdheid staat niet op de voorgrond.",
      cough: caseItem.stem.toLowerCase().includes("hoest") ? "Ja, er is hoest genoemd." : "Hoesten staat niet op de voorgrond.",
      vegetative: "Zweten, misselijkheid of bleekheid staan niet duidelijk op de voorgrond.",
      syncope: "Ik ben niet flauwgevallen.",
      neuro: "Geen duidelijke uitvalsverschijnselen op de voorgrond.",
      headache: "Geen heftige hoofdpijn op de voorgrond.",
      falls: "Ik ben niet gevallen, tenzij dat in deze casus genoemd wordt.",
      memory: "Mijn geheugen is niet de hoofdklacht.",
      abdomen: "Buikklachten staan niet op de voorgrond.",
      gyn: "Geen gynaecologische klachten op de voorgrond.",
      pregnancy: "Zwangerschap is niet aan de orde, tenzij de casus dat noemt.",
      urinary: "Geen duidelijke plasklachten op de voorgrond.",
      stool: "Geen duidelijke verandering van ontlasting op de voorgrond.",
      drinking: "Drinken is niet duidelijk afwijkend, tenzij de casus dat noemt.",
      nausea: "Misselijkheid staat niet op de voorgrond.",
      rash: "Geen opvallende huiduitslag.",
      neck: "Geen nekstijfheid.",
      sexual: "Geen seksuele risicofactoren op de voorgrond.",
      back: "Geen rugklachten op de voorgrond.",
      knee: "Geen knieklachten op de voorgrond.",
      trauma: "Geen trauma, tenzij dat in deze casus genoemd wordt.",
      mental: "Psychische klachten staan niet op de voorgrond.",
      sleep: "Slaap is niet duidelijk de hoofdklacht.",
      appetite: "Eetlust is niet duidelijk veranderd.",
      suicidality: "Nee, ik heb geen concrete plannen om mezelf iets aan te doen.",
      psychosis: "Geen stemmen of wanen.",
      bowel: "Geen duidelijke obstipatie of diarree op de voorgrond.",
      skin: "Geen opvallende huidklachten.",
      meds: "Geen bijzonderheden, tenzij u gericht naar medicatie of risicofactoren vraagt.",
      history: "Geen aanvullende voorgeschiedenis buiten wat in de casus staat.",
      allergy: "Geen bekende medicatieallergieën.",
      family: "In de familie is niets opvallends bekend dat direct met deze klacht te maken heeft.",
      smoking: "Ik rook niet, tenzij dat in deze casus anders genoemd wordt.",
      alcohol: "Ik drink geen opvallende hoeveelheden alcohol en gebruik geen drugs.",
      occupation: identity.isChild ? "Ik ben hier als ouder/verzorger met mijn kind." : "Ik werk of studeer; de klacht belemmert me vooral als de inspanning of stress toeneemt.",
      living: identity.isChild ? "Mijn kind woont thuis bij ons." : "Ik woon zelfstandig en heb zo nodig hulp van naasten.",
      concern: "Ik wil vooral weten wat er aan de hand is en wat ik moet doen als het erger wordt.",
      function: "De klachten beïnvloeden mijn functioneren; vraag gericht naar werk, lopen, slapen of ADL.",
      clarify: "Kunt u dat iets concreter vragen? Dan kan ik u gerichter antwoord geven.",
    },
    exam: {
      general: "Beoordeel algemene indruk: gebruik de ernst uit de casus en let op ziek/niet ziek.",
      vitals: "Vitale parameters moeten gericht worden beoordeeld; gebruik de waarden uit de casus als die gegeven zijn.",
      lungs: route === "dyspneu" || route === "kind" ? "Longonderzoek past bij de respiratoire bevindingen uit de casus." : "Geen primaire longbevindingen op de voorgrond.",
      heart: route === "thorax" || route === "dyspneu" ? "Hartonderzoek: let op frequentie, ritme, souffles en tekenen van hartfalen." : "Geen primaire cardiale afwijkingen op de voorgrond.",
      abdomen: route === "buik" || route === "soa" ? "Buikonderzoek: beoordeel drukpijn, defense/peritoneale prikkeling en lokalisatie." : "Buikonderzoek niet primair afwijkend.",
      neuro: route === "neurologie" ? "Neurologisch onderzoek is gericht op FAST, kracht, sensibiliteit, spraak en coördinatie." : "Geen focale neurologische afwijkingen op de voorgrond.",
      gyn: route === "soa" ? "Gynaecologisch onderzoek op indicatie: speculum en VT bij PID/bloedverlies, met respectvolle uitleg." : "Gynaecologisch onderzoek alleen op indicatie.",
      legs: route === "bewegingsapparaat" ? "Onderzoek functie, zwelling, neurovasculaire status en stabiliteit." : "Geen duidelijke afwijkingen aan de benen tenzij in de casus genoemd.",
      hydration: "Geen duidelijke dehydratie op de voorgrond.",
      skin: "Geen acute huidafwijkingen op de voorgrond.",
      throat: "Keelonderzoek is niet primair afwijkend.",
      ears: "Ooronderzoek is niet primair afwijkend.",
      renal: "Geen duidelijke slagpijn in de nierloge, tenzij in de casus genoemd.",
      urinary: "Urineonderzoek alleen op indicatie; geen standaard afwijking bekend.",
      back: "Rugonderzoek is niet primair afwijkend.",
      knee: "Knieonderzoek is niet primair afwijkend.",
      thyroid: "Schildklieronderzoek is niet primair afwijkend.",
      mental: "Psychisch onderzoek is niet primair afwijkend.",
      feet: "Voetonderzoek alleen op indicatie; geen acute afwijking bekend.",
    },
  };
  const specific = CASE_DIALOGUE[caseItem.id] || {};
  const patient = { ...base.patient, ...(specific.patient || {}) };
  patient.story = patient.story || storyFor(patient);
  return {
    patient,
    exam: { ...base.exam, ...(specific.exam || {}) },
  };
}

function responseRules(mode) {
  return mode === "onderzoek"
    ? [
        ["vitals", ["vitaal", "bloeddruk", "rr", "pols", "hartslag", "ademfrequentie", "saturatie", "temperatuur", "koorts meten", "parameters"]],
        ["general", ["algemene indruk", "ziek", "abcde", "bewustzijn", "klinisch", "lichamelijk onderzoek", "inspectie"]],
        ["lungs", ["long", "auscult", "adem", "thorax", "piep", "crepitat", "percuss"]],
        ["heart", ["hart", "auscult", "ritme", "souffle", "pols"]],
        ["neck", ["halsven", "jvp", "cvd"]],
        ["legs", ["been", "enkels", "oedeem", "kuit", "pulsaties", "voet", "knie", "heup"]],
        ["abdomen", ["buik", "abdomen", "palp", "defense", "nierloge", "lever"]],
        ["renal", ["nierloge", "slagpijn", "flank"]],
        ["urinary", ["urine", "urinedip", "nitriet", "leukocyten", "hematurie"]],
        ["neuro", ["neurolog", "fast", "kracht", "sensibiliteit", "spraak", "coordinatie", "tremor"]],
        ["gyn", ["speculum", "vaginaal", "toucher", "vt", "fluor", "bloedverlies"]],
        ["hydration", ["hydratatie", "dehydratie", "slijmvliezen", "huidturgor", "fontanel", "luiers"]],
        ["skin", ["huid", "petechien", "uitslag", "kleur", "cyanose"]],
        ["throat", ["keel", "tonsillen"]],
        ["ears", ["oor", "oren", "otoscopie"]],
        ["back", ["rug", "wervelkolom", "lasegue"]],
        ["knee", ["knie", "meniscus", "slotstand", "stabiliteit", "voorste schuiflade"]],
        ["thyroid", ["schildklier", "struma"]],
        ["mental", ["psychisch", "stemming", "suicide", "suicidaal", "mse"]],
        ["feet", ["voet", "voeten", "monofilament", "wond"]],
      ]
    : [
        ["identity", ["naam", "heet", "identiteit", "voorletters"]],
        ["age", ["leeftijd", "oud", "geboren", "geboortedatum"]],
        ["contact", ["adres", "telefoon", "postcode", "woonplaats"]],
        ["story", ["wat kan ik", "waarvoor", "reden", "klacht", "probleem", "last", "merkt", "precies", "vertellen", "aan de hand"]],
        ["onset", ["wanneer", "sinds", "begon", "begin", "duur", "beloop", "plots", "geleidelijk", "hoe lang"]],
        ["pattern", ["aanval", "aanvallen", "constant", "continu", "hele tijd", "af en toe", "tussendoor", "patroon"]],
        ["triggers", ["moment", "momenten", "erger", "ergst", "uitlok", "trigger", "kou", "stof", "inspanning", "nacht", "ochtend", "avond"]],
        ["severity", ["ernst", "hoe erg", "ernstig", "lopen", "trap", "beperkt", "rust", "functioneren", "zinnen spreken"]],
        ["dyspnea", ["benauwd", "kortadem", "adem", "lucht"]],
        ["orthopnea", ["plat", "kussen", "nacht", "orthopneu", "wakker", "slapen"]],
        ["cough", ["hoest", "slijm", "sputum", "bloed", "hemoptoe"]],
        ["fever", ["koorts", "temperatuur", "ziek", "rillen"]],
        ["chest", ["borst", "thorac", "druk", "uitstraling", "arm", "kaak", "inademen", "pleuritisch"]],
        ["vegetative", ["zweten", "misselijk", "bleek", "klam", "vegetatief"]],
        ["syncope", ["flauw", "wegraking", "bewustzijn", "collaps", "duizelig"]],
        ["neuro", ["uitval", "kracht", "spraak", "scheve mond", "tinteling", "gevoelsstoornis", "trillen", "tremor", "traag", "handschrift"]],
        ["headache", ["hoofdpijn", "migraine"]],
        ["falls", ["gevallen", "valneiging"]],
        ["memory", ["geheugen", "vergeet", "cognitie"]],
        ["abdomen", ["buik", "onderbuik", "flank", "lies", "maag"]],
        ["gyn", ["vaginaal", "menstruatie", "bloedverlies", "fluor", "afscheiding", "dyspareunie", "gemeenschap", "overgang"]],
        ["pregnancy", ["zwanger", "zwangerschap", "menstruatie te laat", "overtijd"]],
        ["urinary", ["plassen", "mictie", "urine", "branderig", "bloed bij urine", "nachtplassen"]],
        ["stool", ["ontlasting", "diarree", "obstipatie", "poep"]],
        ["drinking", ["drinken", "dorst", "vocht", "luiers"]],
        ["nausea", ["misselijk", "braken", "overgeven"]],
        ["rash", ["uitslag", "vlek", "petechien", "huiduitslag"]],
        ["neck", ["nek", "nekstijf"]],
        ["sexual", ["partner", "condoom", "soa", "seks", "seksueel"]],
        ["back", ["rug", "lage rug", "uitstraling been"]],
        ["knee", ["knie", "slot", "strekken", "zwelling knie"]],
        ["trauma", ["trauma", "gevallen", "gedraaid", "tillen", "voetbal"]],
        ["mental", ["somber", "depressief", "angst", "paniek", "plezier", "schuld", "concentratie"]],
        ["sleep", ["slaap", "slapen", "wakker"]],
        ["appetite", ["eetlust", "eten"]],
        ["suicidality", ["suicide", "suicidaal", "dood", "zelfmoord", "leven niet meer", "iets aandoen"]],
        ["psychosis", ["stemmen", "waan", "psychose"]],
        ["bowel", ["obstipatie", "verstopping", "diarree"]],
        ["skin", ["huid", "droog", "jeuk"]],
        ["legs", ["been", "enkels", "oedeem", "kuit", "zwelling"]],
        ["weight", ["gewicht", "aangekomen", "afgevallen"]],
        ["risk", ["risico", "reis", "operatie", "zwanger", "bevalling", "pil", "dvt", "longembolie", "trombose"]],
        ["history", ["voorgeschiedenis", "eerder", "hart", "long", "diabetes", "hypertensie", "astma", "copd"]],
        ["meds", ["medicatie", "medicijn", "puf", "inhal", "nsaid", "ibuprofen", "bloedverdunner"]],
        ["allergy", ["allerg"]],
        ["smoking", ["rook", "roken", "sigaret", "alcohol", "drugs"]],
        ["alcohol", ["alcohol", "drugs", "middelen"]],
        ["occupation", ["werk", "beroep", "studie", "school"]],
        ["living", ["woont", "woonsituatie", "alleen", "partner", "thuis", "mantelzorg"]],
        ["family", ["familie"]],
        ["concern", ["zorgen", "bang", "verwacht", "hulpvraag"]],
        ["function", ["werk", "thuis", "sport", "adl", "dagelijks"]],
      ];
}

function defaultExamKeysForRoute(routeKey) {
  const byRoute = {
    dyspneu: ["general", "vitals", "lungs", "heart", "legs"],
    thorax: ["general", "vitals", "heart", "lungs", "legs"],
    neurologie: ["general", "vitals", "neuro", "heart"],
    kind: ["general", "vitals", "hydration", "lungs", "skin", "throat", "ears"],
    buik: ["general", "vitals", "abdomen", "renal", "urinary"],
    soa: ["general", "vitals", "abdomen", "gyn"],
    bewegingsapparaat: ["general", "vitals", "back", "knee", "legs", "neuro"],
    psychisch: ["general", "mental", "vitals"],
    endocrien: ["general", "vitals", "thyroid", "skin", "heart", "feet"],
  };
  return byRoute[routeKey] || ["general", "vitals"];
}

function findResponseKeys(text, mode) {
  const q = normalizeText(text);
  let hits = responseRules(mode)
    .filter(([, words]) => words.some((word) => q.includes(word)))
    .map(([key]) => key);
  const routeKey = currentCase().route;
  if (mode !== "onderzoek" && hits.includes("orthopnea") && !["dyspneu", "thorax"].includes(routeKey)) {
    hits = hits.filter((key) => key !== "orthopnea");
  }
  if (mode !== "onderzoek" && hits.includes("vegetative") && hits.includes("nausea")) {
    hits = ["buik", "kind", "endocrien"].includes(routeKey)
      ? hits.filter((key) => key !== "vegetative")
      : hits.filter((key) => key !== "nausea");
  }
  if (mode === "onderzoek" && hits.includes("general") && /lichamelijk onderzoek|onderzoek doen|alles onderzoeken|volledig onderzoek|algemeen onderzoek/.test(q)) {
    return defaultExamKeysForRoute(currentCase().route);
  }
  if (mode !== "onderzoek" && hits.length > 1 && hits.includes("story")) {
    return hits.filter((key) => key !== "story");
  }
  return hits.length ? hits : mode === "onderzoek" ? ["general"] : ["clarify"];
}

function responseLabel(mode, key) {
  const labels = {
    general: "Algemene indruk",
    vitals: "Vitale parameters",
    lungs: "Longen",
    heart: "Hart",
    neck: "Halsvenen",
    legs: "Benen/extremiteiten",
    abdomen: "Buik",
    renal: "Nierloge",
    urinary: "Urine",
    neuro: "Neurologisch",
    gyn: "Gynaecologisch",
    hydration: "Hydratatie",
    skin: "Huid",
    throat: "Keel",
    ears: "Oren",
    back: "Rug",
    knee: "Knie",
    thyroid: "Schildklier",
    mental: "Psychisch onderzoek",
    feet: "Voeten",
  };
  return mode === "onderzoek" ? labels[key] || "Bevinding" : "";
}

function answerChat(mode, text) {
  const dialogue = dialogueFor();
  const keys = findResponseKeys(text, mode);
  const bank = mode === "onderzoek" ? dialogue.exam : dialogue.patient;
  const answers = uniq(
    keys
      .map((key) => {
        const answer = bank[key];
        if (!answer) return "";
        const label = responseLabel(mode, key);
        return label ? `${label}: ${answer}` : answer;
      })
      .filter(Boolean)
  );
  if (!answers.length) return bank.start || "Kunt u dat nog iets gerichter vragen?";
  if (answers.length === 1) return answers[0];
  return answers.slice(0, mode === "onderzoek" ? 6 : 4).join(" ");
}

async function answerChatSmart(mode, text) {
  if (AI_AVAILABLE) {
    try {
      const response = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          question: text,
          case: currentCase(),
          route: currentRoute(),
          dialogue: dialogueFor(),
          transcript: state.transcripts[mode] || [],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.answer) return data.answer;
      } else {
        const data = await response.json().catch(() => ({}));
        markAIError(data.error || "AI request failed; local fallback wordt gebruikt.");
      }
    } catch {
      // Local fallback below keeps the app usable offline.
      markAIError("AI request failed; local fallback wordt gebruikt.");
    }
  }
  return answerChat(mode, text);
}

function renderAlgorithm() {
  const route = currentRoute();
  document.getElementById("algorithmTitle").textContent = route.label;
  if (!state.evaluated) {
    document.getElementById("algorithmMap").innerHTML = `
      <div class="locked-map">
        <strong>Beslisboom is nog verborgen.</strong>
        Vul eerst je anamnese, LO, DD, lab/imaging, uitleg, beleid en plan van aanpak in. Na Controleer verschijnt de beslisboom hier.
      </div>
    `;
    document.getElementById("sourceLinks").innerHTML = "";
    return;
  }
  document.getElementById("algorithmMap").innerHTML = `
    <div class="route-start">${escapeHtml(route.label)}: eerst urgentie, daarna patroon.</div>
    ${route.branches
      .map(
        (branch) => `
        <section class="branch">
          <h3>${escapeHtml(branch.bucket)}</h3>
          <div class="branch-grid">
            <div><strong>DD</strong>${escapeHtml(branch.dd)}</div>
            <div><strong>Lab / imaging</strong>${escapeHtml(branch.tests)}</div>
            <div><strong>Beleid</strong>${escapeHtml(branch.action)}</div>
            <div><strong>Safety net</strong>toename pijn/benauwdheid/koorts, sufheid, collaps, nieuwe uitval of geen verbetering.</div>
          </div>
        </section>
      `
      )
      .join("")}
  `;
  document.getElementById("sourceLinks").innerHTML = route.sources
    .map(([label, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`)
    .join("");
}

function renderFeedback() {
  const panel = document.getElementById("feedbackPanel");
  if (state.showModel && state.evaluated) {
    panel.innerHTML = modelAnswerHtml();
    return;
  }
  if (!state.evaluated) {
    panel.innerHTML = "";
    return;
  }
  const score = state.evaluated.score;
  const scoreClass = score < 55 ? "low" : score < 80 ? "mid" : "";
  panel.innerHTML = `
    <div class="feedback-summary">
      <div class="feedback-score ${scoreClass}">${score}%</div>
      <div>
        <h3>${score >= 80 ? "Sterke route" : score >= 55 ? "Bijna daar" : "Terug naar triage"}</h3>
        <p>${escapeHtml(state.evaluated.message)}</p>
      </div>
    </div>
    <div class="feedback-details">
      ${state.evaluated.lines.map((line) => `<div class="detail-line ${line.kind}">${line.html}</div>`).join("")}
    </div>
    ${modelAnswerHtml()}
  `;
}

function modelAnswerHtml() {
  const item = currentCase();
  const c = getCorrect(item);
  return `
    <section class="model-block">
      <h3>Modelantwoord</h3>
      <ol>
        <li><strong>Urgentie:</strong> ${escapeHtml(c.urgency.join(", "))}</li>
        <li><strong>Anamnese:</strong> ${escapeHtml(c.anamnese.map(labelFor).join("; "))}</li>
        <li><strong>Lichamelijk onderzoek:</strong> ${escapeHtml(c.onderzoek.map(labelFor).join("; "))}</li>
        <li><strong>DD:</strong> ${escapeHtml(c.dd.join(", "))}</li>
        <li><strong>Lab / imaging:</strong> ${escapeHtml(c.tests.map(labelFor).join("; "))}</li>
        <li><strong>Uitleg aan patiënt:</strong> ${escapeHtml(c.explanation.map(labelFor).join("; "))}</li>
        <li><strong>Beleid:</strong> ${escapeHtml(c.actions.map(labelFor).join("; "))}</li>
        <li><strong>Niet doen:</strong> ${escapeHtml(c.avoid.map(labelFor).join("; "))}</li>
      </ol>
      <h3>Gesprekszinnen</h3>
      <ol>
        ${consultLines(item, c).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ol>
      <h3>Plan van aanpak template</h3>
      <p>${escapeHtml(planTemplate(item, c))}</p>
    </section>
  `;
}

function historyModelAnswerHtml(entry) {
  const item = CASES.find((caseItem) => caseItem.id === entry.caseId) || currentCase();
  const c = entry.correct || getCorrect(item);
  return `
    <section class="model-block">
      <h3>Modelantwoord toen</h3>
      <ol>
        <li><strong>Urgentie:</strong> ${escapeHtml((c.urgency || []).join(", "))}</li>
        <li><strong>Anamnese:</strong> ${escapeHtml((c.anamnese || []).map(labelFor).join("; "))}</li>
        <li><strong>Lichamelijk onderzoek:</strong> ${escapeHtml((c.onderzoek || []).map(labelFor).join("; "))}</li>
        <li><strong>DD:</strong> ${escapeHtml((c.dd || []).join(", "))}</li>
        <li><strong>Lab / imaging:</strong> ${escapeHtml((c.tests || []).map(labelFor).join("; "))}</li>
        <li><strong>Uitleg:</strong> ${escapeHtml((c.explanation || []).map(labelFor).join("; "))}</li>
        <li><strong>Beleid:</strong> ${escapeHtml((c.actions || []).map(labelFor).join("; "))}</li>
        <li><strong>Niet doen:</strong> ${escapeHtml((c.avoid || []).map(labelFor).join("; "))}</li>
      </ol>
    </section>
  `;
}

function transcriptHtml(lines, isExam = false) {
  if (!lines?.length) return `<div class="history-empty">Niet ingevuld.</div>`;
  return `
    <div class="history-chat">
      ${lines
        .map(
          (line) => `
          <div class="chat-message ${line.role}">
            <strong>${line.role === "doctor" ? "Arts" : isExam ? "Bevinding" : "Patiënt"}</strong>
            <span>${escapeHtml(line.text)}</span>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

function renderHistoryView() {
  const panel = document.querySelector(".practice-panel");
  const algorithm = document.querySelector(".algorithm-panel");
  if (algorithm) algorithm.style.display = "none";
  if (!state.history.length) {
    panel.innerHTML = `
      <div class="panel-head">
        <div>
          <p class="panel-kicker">Review</p>
          <h2>Historie</h2>
        </div>
      </div>
      <section class="choice-group history-empty-panel">
        <h3>Nog geen beoordeelde casussen</h3>
        <p>Klik na een oefening op <strong>Controleer</strong>. Daarna bewaart de app je feedback, gesprek en verslag hier.</p>
      </section>
    `;
    return;
  }
  const selected = state.history.find((entry) => entry.id === state.selectedHistoryId) || state.history[0];
  state.selectedHistoryId = selected.id;
  const scoreClass = selected.score < 55 ? "low" : selected.score < 80 ? "mid" : "";
  panel.innerHTML = `
    <div class="panel-head">
      <div>
        <p class="panel-kicker">Review</p>
        <h2>Historie</h2>
      </div>
      <div class="score-pill">${state.history.length} opgeslagen</div>
    </div>
    <section class="history-layout">
      <div class="history-list" id="historyList">
        ${state.history
          .map((entry) => {
            const active = entry.id === selected.id ? "active" : "";
            return `
              <button type="button" class="history-item ${active}" data-history-id="${entry.id}">
                <strong>${escapeHtml(entry.caseTitle)}</strong>
                <span>${escapeHtml(new Date(entry.createdAt).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" }))}</span>
                <em>${entry.score}%</em>
              </button>
            `;
          })
          .join("")}
      </div>
      <article class="history-detail">
        <div class="feedback-summary">
          <div class="feedback-score ${scoreClass}">${selected.score}%</div>
          <div>
            <h3>${escapeHtml(selected.caseTitle)}</h3>
            <p>${escapeHtml(selected.message)}</p>
          </div>
        </div>
        <div class="feedback-details">
          ${selected.lines.map((line) => `<div class="detail-line ${line.kind}">${line.html}</div>`).join("")}
        </div>
        <section class="history-section">
          <h3>Anamnese gesprek</h3>
          ${transcriptHtml(selected.transcripts?.anamnese || [])}
        </section>
        <section class="history-section">
          <h3>Lichamelijk onderzoek</h3>
          ${transcriptHtml(selected.transcripts?.onderzoek || [], true)}
        </section>
        <section class="history-section">
          <h3>Verslag</h3>
          <p>${escapeHtml(selected.verslag || "Niet ingevuld.")}</p>
        </section>
        <section class="history-section fouten-section">
          <h3>📋 Mijn Fouten & Verbeterpunten</h3>
          ${selected.anamneseCheck ? `
            <div class="fouten-block">
              <h4>Anamnese — wat gemist?</h4>
              ${selected.anamneseCheck.split("\n").filter(Boolean).map((line) => {
                const cls = line.startsWith("✓") ? "check-ok" : line.startsWith("✗") ? "check-miss" : "";
                return `<div class="check-line ${cls}">${escapeHtml(line)}</div>`;
              }).join("")}
            </div>` : `<p class="anamnese-check-empty">Geen anamnese-analyse beschikbaar voor deze sessie.</p>`}
          ${selected.verslagCheck ? `
            <div class="fouten-block">
              <h4>Verslag — feedback</h4>
              ${selected.verslagCheck.split("\n").filter(Boolean).map((line) => {
                const cls = line.startsWith("✓") ? "check-ok" : line.startsWith("✗") ? "check-miss" : line.startsWith("⚠") ? "check-warn" : "";
                return `<div class="check-line ${cls}">${escapeHtml(line)}</div>`;
              }).join("")}
            </div>` : `<p class="anamnese-check-empty">Klik op "Beoordeel mijn verslag" tijdens de oefening om verslagfeedback op te slaan.</p>`}
        </section>
        ${historyModelAnswerHtml(selected)}
      </article>
    </section>
  `;
}

function renderPracticeShell() {
  const panel = document.querySelector(".practice-panel");
  const algorithm = document.querySelector(".algorithm-panel");
  if (algorithm) algorithm.style.display = "";
  panel.innerHTML = `
    <div class="panel-head">
      <div>
        <p class="panel-kicker" id="routeKicker">Route</p>
        <h2 id="practiceTitle">Casus</h2>
      </div>
      <div class="score-pill" id="lastScore">Nog niet beoordeeld</div>
    </div>

    <div class="exam-timer-row">
      <span class="timer-label" id="timerLabel">Gesprek</span>
      <span class="timer-display" id="timerDisplay">20:00</span>
      <button type="button" class="timer-btn" id="timerStartBtn" title="Start / Pauze">▶</button>
      <button type="button" class="timer-btn" id="timerResetBtn" title="Reset">↺</button>
    </div>

    <div class="step-tabs" id="stepTabs"></div>
    <form id="practiceForm" class="response-grid"></form>

    <div class="practice-actions">
      <button type="button" id="checkAnswer">Controleer</button>
      <button type="button" id="clearAnswer">Wis selectie</button>
    </div>

    <section id="feedbackPanel" class="feedback-panel" aria-live="polite"></section>
  `;
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/-]/g, " ");
}

function keyTerms(values) {
  const stop = new Set(["geen", "met", "bij", "het", "een", "van", "voor", "door", "naar", "als", "niet", "wel", "en", "of", "op", "de", "te", "in"]);
  return uniq(
    values
      .join(" ")
      .split(/[\s,;:/()]+/)
      .map((word) => normalizeText(word).trim())
      .filter((word) => word.length >= 4 && !stop.has(word))
  );
}

function userTranscriptText(key) {
  return normalizeText((state.transcripts[key] || []).filter((line) => line.role === "doctor").map((line) => line.text).join(" "));
}

function entryMatched(text, entry) {
  const terms = keyTerms([entry]);
  return terms.slice(0, 8).some((term) => text.includes(term));
}

function evaluateConversationGroup(key, correct) {
  const text = userTranscriptText(key);
  const got = correct.filter((entry) => entryMatched(text, entry));
  const missed = correct.filter((entry) => !entryMatched(text, entry));
  return { got, missed, extra: [] };
}

function suggestionFor(groupKey, entry) {
  const e = normalizeText(entry);
  if (groupKey === "anamnese") {
    if (e.includes("begin") || e.includes("beloop") || e.includes("duur")) return "Sinds wanneer heeft u dit en begon het plots of geleidelijk?";
    if (e.includes("inspanning") || e.includes("orthopneu") || e.includes("nacht")) return "Wordt u benauwd bij inspanning, in rust of als u plat ligt? Wordt u 's nachts benauwd wakker?";
    if (e.includes("hoest") || e.includes("koorts") || e.includes("sputum")) return "Heeft u hoest, slijm, koorts of pijn bij het ademhalen?";
    if (e.includes("thoracale") || e.includes("hemoptoe") || e.includes("longembolie")) return "Heeft u pijn op de borst, bloed opgehoest, beenzwelling, een lange reis/operatie of zwangerschap/kraambed?";
    if (e.includes("voorgeschiedenis") || e.includes("medicatie") || e.includes("allerg")) return "Heeft u astma/COPD/hartziekten, welke medicatie gebruikt u en heeft u allergieën?";
    if (e.includes("roken")) return "Rookt u, drinkt u alcohol, wat voor werk doet u en komen deze klachten in de familie voor?";
    if (e.includes("vat samen")) return "Vat samen: als ik het goed begrijp..., klopt dat?";
    if (e.includes("seksuele")) return "Heeft u een nieuwe partner, condoomgebruik, eerdere SOA of risico op zwangerschap?";
    if (e.includes("suic")) return "Heeft u gedachten aan de dood of plannen om uzelf iets aan te doen?";
    return `Vraag gericht naar: ${entry}.`;
  }
  if (groupKey === "onderzoek") {
    if (e.includes("vitale")) return "Meet RR, pols, ademfrequentie, saturatie en temperatuur.";
    if (e.includes("algemene") || e.includes("abcde")) return "Beoordeel algemene indruk en ABCDE voordat je focust.";
    if (e.includes("long")) return "Inspecteer ademarbeid en ausculteer de longen op piepen/crepitaties.";
    if (e.includes("hart")) return "Ausculeer het hart en beoordeel ritme, souffles, halsvenen en oedeem op indicatie.";
    if (e.includes("neurolog")) return "Doe gericht neurologisch onderzoek: FAST, kracht, sensibiliteit, spraak en coördinatie.";
    if (e.includes("buik")) return "Onderzoek de buik: lokalisatie drukpijn, defense/peritoneale prikkeling en nierloge op indicatie.";
    if (e.includes("speculum") || e.includes("vaginaal")) return "Kondig speculumonderzoek/VT respectvol aan en leg uit waarom.";
    return `Onderzoek nog: ${entry}.`;
  }
  return entry;
}

function missedSuggestions(groupKey, missed) {
  return missed.slice(0, 5).map((entry) => suggestionFor(groupKey, entry));
}

function evaluateVerslag(c) {
  const text = normalizeText(state.verslag || "");
  const diagTerms = keyTerms(c.dd).slice(0, 8);
  const testTerms = keyTerms(c.tests).slice(0, 10);
  const actionTerms = keyTerms(c.actions).slice(0, 10);
  const explanationTerms = keyTerms(c.explanation).slice(0, 10);
  const checks = [
    {
      label: "Samenvatting/werkdiagnose/DD",
      terms: ["samenvat", "samenvatting", "werkdiagnose", "differentiaal", "denk", ...diagTerms],
    },
    {
      label: "Aanvullend onderzoek",
      terms: ["onderzoek", "lab", "bloed", "ecg", "urine", "pcr", "beeldvorming", "echo", "spirometrie", ...testTerms],
    },
    {
      label: "Uitleg aan patiënt",
      terms: ["uitleg", "betekent", "past", "waarschijnlijk", "oorzaak", "thuisarts", ...explanationTerms],
    },
    {
      label: "Beleid/medicatie/verwijzing",
      terms: ["beleid", "behandeling", "medicatie", "verwijs", "verwijzing", "advies", "controle", ...actionTerms],
    },
    {
      label: "Alarmsymptomen/safety net",
      terms: ["alarm", "alarmsymptomen", "contact", "spoed", "112", "seh", "erger", "suf", "collaps", "koorts", "benauwder"],
    },
  ];
  const sectionChecks = [
    { label: "Patiënt/reden van komst", terms: ["patient", "reden", "komst", "klacht"] },
    { label: "Speciële anamnese", terms: ["speciele", "anamnese", "sinds", "beloop", "geen", "wel"] },
    { label: "Lichamelijk onderzoek", terms: ["lichamelijk", "onderzoek", "rr", "pols", "saturatie", "temperatuur", "algemene indruk"] },
    { label: "DD/probleemlijst", terms: ["probleemlijst", "differentiaal", "dd", "werkdiagnose", ...diagTerms] },
    { label: "Plan", terms: ["plan", "beleid", "aanvullend", "verwijzing", "controle", "advies"] },
  ];
  const results = [...checks, ...sectionChecks].map((check) => ({
    label: check.label,
    ok: check.terms.some((term) => text.includes(term)),
  }));
  const hits = results.filter((item) => item.ok).length;
  return { hits, total: results.length, results };
}

function consultLines(item, c) {
  return [
    "Goedemorgen, ik ben de arts van vandaag. Waar kan ik u mee helpen?",
    `Kunt u vertellen wanneer de klachten begonnen zijn en hoe het beloop is?`,
    c.anamnese[0] ? `Ik vraag specifiek naar: ${c.anamnese.slice(0, 3).join("; ")}.` : "Ik vraag gericht door op alarmsymptomen en risicofactoren.",
    c.onderzoek[0] ? `Ik wil u lichamelijk onderzoeken: ${c.onderzoek.slice(0, 3).join("; ")}.` : "Ik wil eerst uw algemene indruk en vitale parameters beoordelen.",
    `Op basis hiervan denk ik vooral aan ${c.dd.slice(0, 2).join(" / ")}.`,
    `Ik bespreek het plan: ${c.tests.slice(0, 2).join("; ")} en ${c.actions.slice(0, 2).join("; ")}.`,
  ];
}

function planTemplate(item, c) {
  return `Ik vat samen: ${item.stem} Mijn werkdiagnose is ${c.dd[0] || "..."}, met als belangrijke DD ${c.dd.slice(1, 3).join(", ") || "..."}. Ik wil aanvullend ${c.tests.slice(0, 3).join("; ")}. Ik leg uit dat ${c.explanation[0] || "de bevindingen passen bij deze werkdiagnose"}. Mijn beleid is ${c.actions.slice(0, 3).join("; ")}. Ik benoem expliciet: ${c.avoid.slice(0, 2).join("; ")}. Controle en safety net: direct contact bij verergering, alarmsymptomen of geen verbetering binnen de afgesproken termijn.`;
}

function missingAnswerParts() {
  const missing = GROUPS.filter((group) => {
    if (group.type === "chat" || group.type === "exam") {
      return (state.transcripts[group.key] || []).filter((line) => line.role === "doctor").length < (group.type === "chat" ? 4 : 2);
    }
    if (group.type === "verslag") {
      return state.verslag.trim().length < 120;
    }
    return !(state.answers[group.key] || []).length;
  }).map((group) => group.label);
  return missing;
}

async function requestAIEvaluation(correctByGroup, reviewId) {
  const review = state.history.find((entry) => entry.id === reviewId);
  if (!AI_AVAILABLE || !review) return;
  try {
    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        case: CASES.find((item) => item.id === review.caseId) || currentCase(),
        route: ROUTES[review.route] || currentRoute(),
        correct: correctByGroup,
        answers: review.answers,
        transcript: review.transcripts,
        verslag: review.verslag,
      }),
    });
    if (!response.ok) return;
    const data = await response.json();
    if (!data.feedback) return;
    const aiLine = {
      kind: "good",
      html: `<strong>AI-examinator:</strong><br>${escapeHtml(data.feedback).replaceAll("\n", "<br>")}`,
    };
    const entry = state.history.find((item) => item.id === reviewId);
    if (!entry) return;
    entry.lines = [aiLine, ...entry.lines.filter((line) => !line.html.includes("<strong>AI-examinator:</strong>"))];
    entry.updatedAt = new Date().toISOString();
    if (state.evaluated && state.selectedHistoryId === reviewId) state.evaluated.lines = entry.lines;
    saveHistory();
    if (state.view === "history" || state.selectedHistoryId === reviewId) renderAll();
  } catch {
    // Local evaluation remains visible.
  }
}

function saveCurrentReview(correctByGroup, options = {}) {
  if (!state.evaluated) return null;
  const item = currentCase();
  const previousLatest = state.history[0];
  const id =
    options.replaceLatest && previousLatest?.caseId === item.id
      ? previousLatest.id
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const entry = {
    id,
    createdAt: options.replaceLatest && previousLatest?.caseId === item.id ? previousLatest.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    caseId: item.id,
    caseTitle: item.title,
    route: item.route,
    stem: item.stem,
    score: state.evaluated.score,
    message: state.evaluated.message,
    lines: state.evaluated.lines,
    answers: JSON.parse(JSON.stringify(state.answers)),
    transcripts: JSON.parse(JSON.stringify(state.transcripts)),
    verslag: state.verslag,
    correct: correctByGroup,
    anamneseCheck: state.anamneseCheck || null,
    verslagCheck: state.verslagCheck || null,
  };
  state.history = options.replaceLatest && previousLatest?.caseId === item.id ? [entry, ...state.history.slice(1)] : [entry, ...state.history];
  state.history = state.history.slice(0, HISTORY_LIMIT);
  state.selectedHistoryId = entry.id;
  saveHistory();
  return entry.id;
}

function evaluate() {
  const missing = missingAnswerParts();
  if (missing.length) {
    state.evaluated = null;
    state.showModel = false;
    renderAlgorithm();
    document.getElementById("feedbackPanel").innerHTML = `
      <div class="feedback-summary">
        <div class="feedback-score mid">...</div>
        <div>
          <h3>Nog niet compleet</h3>
          <p>Vul eerst alle onderdelen in: ${escapeHtml(missing.join(", "))}. Daarna verschijnt ook de beslisboom.</p>
        </div>
      </div>
    `;
    return;
  }
  const item = currentCase();
  const correctByGroup = getCorrect(item);
  let hits = 0;
  let total = 0;
  let extras = 0;
  const lines = [];
  GROUPS.forEach((group) => {
    let correct = correctByGroup[group.key] || [];
    let selected = state.answers[group.key] || [];
    let got;
    let missed;
    let extra;
    if (group.type === "chat" || group.type === "exam") {
      ({ got, missed, extra } = evaluateConversationGroup(group.key, correct));
      selected = got;
    } else if (group.type === "verslag") {
      const verslag = evaluateVerslag(correctByGroup);
      correct = verslag.results.map((item) => item.label);
      got = verslag.results.filter((item) => item.ok).map((item) => item.label);
      missed = verslag.results.filter((item) => !item.ok).map((item) => item.label);
      extra = [];
    } else {
      got = correct.filter((value) => selected.includes(value));
      missed = correct.filter((value) => !selected.includes(value));
      extra = selected.filter((value) => !correct.includes(value));
    }
    hits += got.length;
    total += correct.length;
    extras += extra.length;
    if (missed.length === 0 && extra.length === 0) {
      lines.push({ kind: "good", html: `<strong>${escapeHtml(group.label)}:</strong> compleet.` });
    } else {
      const parts = [];
      if (got.length) parts.push(`goed: ${escapeHtml(got.map(labelFor).join(", "))}`);
      if (missed.length) parts.push(`gemist: ${escapeHtml(missed.map(labelFor).join(", "))}`);
      if (extra.length) parts.push(`te veel: ${escapeHtml(extra.map(labelFor).join(", "))}`);
      const suggestions = group.type === "chat" || group.type === "exam" ? missedSuggestions(group.key, missed) : [];
      const suggestionHtml = suggestions.length ? `<br><em>Je had nog kunnen vragen/doen: ${escapeHtml(suggestions.join(" | "))}</em>` : "";
      lines.push({ kind: missed.length ? "warn" : "bad", html: `<strong>${escapeHtml(group.label)}:</strong> ${parts.join(" | ")}${suggestionHtml}` });
    }
  });
  const raw = total ? (hits / (total + extras * 0.7)) * 100 : 0;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  state.evaluated = {
    score,
    lines,
    message:
      score >= 80
        ? "Je mist weinig en je teststrategie is gericht."
        : score >= 55
          ? "De hoofdroute klopt deels; kijk vooral naar gemiste alarmsymptomen en overbodige testen."
          : "Begin opnieuw bij urgentie en kies daarna alleen testen die beleid veranderen.",
  };
  state.showModel = false;
  updateProgress(score);
  const reviewId = saveCurrentReview(correctByGroup);
  renderAll();
  requestAIEvaluation(correctByGroup, reviewId);
  autoAnamneseCheck(reviewId);
}

function updateHistoryCheckFields() {
  const entry = state.history.find((item) => item.id === state.selectedHistoryId);
  if (!entry) return;
  if (state.anamneseCheck) entry.anamneseCheck = state.anamneseCheck;
  if (state.verslagCheck) entry.verslagCheck = state.verslagCheck;
  saveHistory();
}

async function autoAnamneseCheck(reviewId) {
  const transcript = state.transcripts.anamnese;
  if (!transcript.length) return;
  try {
    const resp = await fetch("/api/anamnese-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case: currentCase().stem, transcript }),
    });
    if (!resp.ok) return;
    const data = await resp.json();
    if (!data.analysis) return;
    state.anamneseCheck = data.analysis;
    const entry = state.history.find((item) => item.id === reviewId);
    if (entry) { entry.anamneseCheck = data.analysis; saveHistory(); }
  } catch { /* silent */ }
}

function updateProgress(score) {
  const item = currentCase();
  state.progress.done += 1;
  state.progress.totalScore += score;
  state.progress.streak = score >= 80 ? state.progress.streak + 1 : 0;
  state.progress.best[item.id] = Math.max(state.progress.best[item.id] || 0, score);
  saveProgress();
}

function setCase(caseId) {
  state.caseId = caseId;
  state.activeGroup = "urgency";
  state.view = "practice";
  resetAnswers();
  buildOptionsForCase(currentCase());
  renderAll();
}

function randomCase() {
  const pool = filteredCases();
  const choices = pool.filter((item) => item.id !== state.caseId);
  const next = sample(choices.length ? choices : pool, 1)[0];
  if (next) setCase(next.id);
}

function renderAll() {
  renderStats();
  renderSelectors();
  renderRailActions();
  if (state.view === "history") {
    renderCase();
    renderHistoryView();
    return;
  }
  renderPracticeShell();
  updateTimerDisplay();
  renderCase();
  renderTabs();
  renderCurrentGroup();
  renderAlgorithm();
  renderFeedback();
}

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.id === "routeFilter") {
    state.routeFilter = target.value;
    const first = filteredCases()[0];
    setCase(first ? first.id : CASES[0].id);
  }
  if (target.id === "casePicker") {
    setCase(target.value);
  }
  if (state.view === "history") return;
  if (target.matches("input[data-group]")) {
    const group = target.dataset.group;
    if (target.type === "radio") {
      state.answers[group] = [target.value];
    } else {
      const set = new Set(state.answers[group] || []);
      if (target.checked) set.add(target.value);
      else set.delete(target.value);
      state.answers[group] = [...set];
    }
    state.evaluated = null;
    state.showModel = false;
    renderCurrentGroup();
    renderAlgorithm();
    renderFeedback();
  }
});

document.addEventListener("input", (event) => {
  if (state.view === "history") return;
  if (event.target.id === "verslagAnswer") {
    state.verslag = event.target.value;
    state.evaluated = null;
    state.showModel = false;
    renderAlgorithm();
    renderFeedback();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target.id === "chatInput" && event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    document.getElementById("sendChat")?.click();
  }
});

document.addEventListener("click", async (event) => {
  const historyItem = event.target.closest("[data-history-id]");
  if (historyItem) {
    state.selectedHistoryId = historyItem.dataset.historyId;
    renderAll();
    return;
  }
  const tab = event.target.closest("[data-tab]");
  if (tab) {
    state.activeGroup = tab.dataset.tab;
    if (tab.dataset.tab === "verslag" && timerPhase !== "verslag") timerSetPhase("verslag");
    else if (tab.dataset.tab === "anamnese" && timerPhase !== "gesprek") timerSetPhase("gesprek");
    renderTabs();
    renderCurrentGroup();
    return;
  }
  if (event.target.id === "newCase") randomCase();
  if (event.target.id === "showHistory") {
    state.view = "history";
    renderAll();
    return;
  }
  if (event.target.id === "backToPractice") {
    state.view = "practice";
    renderAll();
    return;
  }
  if (state.view === "history") return;
  if (event.target.id === "checkAnswer") evaluate();
  if (event.target.id === "clearAnswer") {
    resetAnswers();
    renderAll();
  }
  if (event.target.id === "sendChat") {
    const input = document.getElementById("chatInput");
    const text = (input?.value || "").trim();
    if (!text) return;
    const key = state.activeGroup;
    state.transcripts[key].push({ role: "doctor", text });
    state.transcripts[key].push({ role: "patient", text: "..." });
    renderCurrentGroup();
    const answer = await answerChatSmart(key, text);
    const last = state.transcripts[key][state.transcripts[key].length - 1];
    if (last && last.role === "patient" && last.text === "...") last.text = answer;
    speakText(answer);
    state.evaluated = null;
    state.showModel = false;
    renderCurrentGroup();
    renderAlgorithm();
    renderFeedback();
  }
  if (event.target.id === "micButton") {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    return;
  }
  if (event.target.id === "checkAnamnese") {
    const btn = event.target;
    const resultEl = document.getElementById("anamneseCheckResult");
    const transcript = state.transcripts["anamnese"] || [];
    if (transcript.length < 2) {
      resultEl.style.display = "block";
      resultEl.innerHTML = `<p class="anamnese-check-empty">Voer eerst een gesprek voordat je de anamnese laat controleren.</p>`;
      return;
    }
    btn.disabled = true;
    btn.textContent = "Analyseren…";
    resultEl.style.display = "block";
    resultEl.innerHTML = `<p class="anamnese-check-empty">Bezig met analyseren…</p>`;
    try {
      const resp = await fetch("/api/anamnese-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case: currentCase().stem, transcript }),
      });
      const data = await resp.json();
      state.anamneseCheck = data.analysis || null;
      updateHistoryCheckFields();
      const html = (data.analysis || "Geen analyse beschikbaar.")
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const cls = line.startsWith("✓") ? "check-ok" : line.startsWith("✗") ? "check-miss" : "";
          return `<div class="check-line ${cls}">${escapeHtml(line)}</div>`;
        })
        .join("");
      resultEl.innerHTML = html;
    } catch {
      resultEl.innerHTML = `<p class="anamnese-check-empty">Analyse mislukt. Controleer je verbinding.</p>`;
    }
    btn.disabled = false;
    btn.textContent = "Wat heb ik gemist? →";
    return;
  }
  if (event.target.id === "checkVerslag") {
    const btn = event.target;
    const resultEl = document.getElementById("verslagCheckResult");
    const tekst = (document.getElementById("verslagAnswer")?.value || "").trim();
    if (tekst.length < 40) {
      resultEl.style.display = "block";
      resultEl.innerHTML = `<p class="anamnese-check-empty">Schrijf eerst je verslag voordat je het laat beoordelen.</p>`;
      return;
    }
    btn.disabled = true;
    btn.textContent = "Beoordelen…";
    resultEl.style.display = "block";
    resultEl.innerHTML = `<p class="anamnese-check-empty">Bezig met beoordelen…</p>`;
    try {
      const resp = await fetch("/api/verslag-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case: currentCase().stem,
          transcript: state.transcripts,
          verslag: tekst,
        }),
      });
      const data = await resp.json();
      state.verslagCheck = data.feedback || null;
      updateHistoryCheckFields();
      const html = (data.feedback || "Geen beoordeling beschikbaar.")
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const cls = line.startsWith("✓") ? "check-ok" : line.startsWith("✗") ? "check-miss" : line.startsWith("⚠") ? "check-warn" : "";
          return `<div class="check-line ${cls}">${escapeHtml(line)}</div>`;
        })
        .join("");
      resultEl.innerHTML = html;
    } catch {
      resultEl.innerHTML = `<p class="anamnese-check-empty">Beoordeling mislukt. Controleer je verbinding.</p>`;
    }
    btn.disabled = false;
    btn.textContent = "Beoordeel mijn verslag →";
    return;
  }
  if (event.target.id === "showModel") {
    if (!state.evaluated) {
      document.getElementById("feedbackPanel").innerHTML = `
        <div class="feedback-summary">
          <div class="feedback-score mid">?</div>
          <div>
            <h3>Eerst zelf proberen</h3>
            <p>Vul je antwoorden en plan van aanpak in en klik op Controleer. Daarna verschijnt het modelantwoord en de beslisboom.</p>
          </div>
        </div>
      `;
      return;
    }
    state.showModel = !state.showModel;
    renderFeedback();
  }
  if (event.target.id === "resetProgress") {
    state.progress = { done: 0, totalScore: 0, streak: 0, best: {} };
    saveProgress();
    renderAll();
  }
});

resetAnswers();
buildOptionsForCase(currentCase());
renderAll();
initAIStatus();
