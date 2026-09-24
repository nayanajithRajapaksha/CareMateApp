const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'screens');

// Let's do string replacement for the raw text
const mappings = [
  { file: 'FamilyPlanningScreen.tsx', strings: {
      'Discover evidence-based guidance, track your milestones, and build a healthy foundation for your growing family.': '{t("heroDescriptionFP")}'
  }},
  { file: 'PreconceptionCareScreen.tsx', strings: {
      'The Essential Guide to Preconception Care': '{t("preconceptionSubtitle")}',
      'Preparing your body for a healthy pregnancy starts well before conception. Discover the crucial steps for both partners to ensure optimal health.': '{t("preconceptionIntroText")}',
      'Preconception care is a vital, proactive approach to family planning that focuses on optimizing health and identifying potential risks before conception. It\\\'s not just for women; preconception health is equally important for men to ensure healthy sperm development and a supportive environment.': '{t("preconceptionPara1")}',
      'Why Preconception Care Matters': '{t("preconceptionWhyMatters")}',
      'Many critical developments in fetal growth occur within the first few weeks of pregnancy often before a woman even realizes she is pregnant. By adopting healthy habits and addressing medical conditions early, you significantly reduce the risk of complications and birth defects.': '{t("preconceptionPara2")}',
      'The Preconception Checklist': '{t("preconceptionChecklist")}',
      'Health Screenings': '{t("preconceptionHealthScreenings")}',
      'Comprehensive blood panel & thyroid check.': '{t("preconceptionCheck1")}',
      'Screening for STIs and genetic carrier testing.': '{t("preconceptionCheck2")}',
      'Review of current medications and immunizations.': '{t("preconceptionCheck3")}',
      'Nutrition & Vitamins': '{t("preconceptionNutritionVitamins")}',
      'Start a daily prenatal vitamin with 400mcg of Folic Acid.': '{t("preconceptionCheck4")}',
      'Ensure adequate Iron, Calcium, and Vitamin D intake.': '{t("preconceptionCheck5")}',
      'Adopt a balanced diet rich in leafy greens and lean proteins.': '{t("preconceptionCheck6")}',
      'Lifestyle Adjustments': '{t("preconceptionLifestyle")}',
      'Eliminate alcohol, smoking, and recreational drugs.': '{t("preconceptionCheck7")}',
      'Limit caffeine intake to less than 200mg per day.': '{t("preconceptionCheck8")}',
      'Maintain a healthy weight through regular, moderate exercise.': '{t("preconceptionCheck9")}',
      'Environmental Factors': '{t("preconceptionEnvironment")}',
      'Avoid exposure to toxic substances (e.g., strong cleaning chemicals).': '{t("preconceptionCheck10")}',
      'Manage stress levels with relaxation techniques or counseling.': '{t("preconceptionCheck11")}',
      'Discuss any workplace hazards with your healthcare provider.': '{t("preconceptionCheck12")}',
      'A Note for Partners': '{t("preconceptionPartnersNote")}',
      'Sperm generation takes about 74 days. Male partners should adopt healthier lifestyle choices—such as reducing alcohol, quitting smoking, and eating a balanced diet—at least three months before trying to conceive.': '{t("preconceptionPartnersDesc")}'
  }},
  { file: 'FamilyPlanningMethodsScreen.tsx', strings: {
      'Family Planning Guide': '{t("fpMethodsHeader")}',
      'Every family’s journey is different. Whether you are preparing for your first baby, considering another child, or choosing to delay pregnancy, family planning helps you make informed decisions about your future. It supports your right to decide whether and when to have children, while reducing the health risks associated with unintended pregnancies.': '{t("fpMethodsP1")}',
      'Prepare for pregnancy with confidence': '{t("fpMethodsH2_1")}',
      'A healthy pregnancy begins with care before conception. Arrange a discussion with a healthcare professional about existing health conditions, medicines, vaccinations, and any concerns about previous pregnancies or inherited conditions. This helps identify the support you may need before trying for a baby.': '{t("fpMethodsP2")}',
      'Folic acid is an important part of this preparation. WHO recommends 400 micrograms daily from the time you begin trying to conceive until 12 weeks of pregnancy. Ask your doctor or clinic about the appropriate dose for you, as some people need a different prescription.': '{t("fpMethodsP3")}',
      'Understand your family planning options': '{t("fpMethodsH2_2")}',
      'Contraceptive methods differ in how they are used and how long they work. Options include:': '{t("fpMethodsP4")}',
      'Condoms: ': '{t("fpMethodsL1Bold")}',
      'Help prevent pregnancy and also protect against sexually transmitted infections.': '{t("fpMethodsL1Desc")}',
      'Contraceptive pills: ': '{t("fpMethodsL2Bold")}',
      'Require regular use according to the prescribed instructions.': '{t("fpMethodsL2Desc")}',
      'Injectable contraceptives: ': '{t("fpMethodsL3Bold")}',
      'Require repeat appointments at the recommended intervals.': '{t("fpMethodsL3Desc")}',
      'Implants and IUDs: ': '{t("fpMethodsL4Bold")}',
      'Provide highly effective, long-lasting, reversible contraception.': '{t("fpMethodsL4Desc")}',
      'Permanent methods: ': '{t("fpMethodsL5Bold")}',
      'Intended for people who are certain they do not want future pregnancies.': '{t("fpMethodsL5Desc")}',
      'Fertility-awareness methods require careful monitoring and are generally less reliable than modern contraceptive methods. Your health, breastfeeding status, preferences, and future pregnancy plans should guide your choice with a trained healthcare provider.': '{t("fpMethodsP5")}',
      'Build healthy everyday habits': '{t("fpMethodsH2_3")}',
      'Choose varied, balanced meals using familiar foods such as vegetables, leafy greens, fruit, dhal, beans, whole grains, eggs, or fish. Limit foods and drinks high in added sugar, salt, and unhealthy fats. Healthy eating supports your general wellbeing as you prepare for parenthood.': '{t("fpMethodsP6")}',
      'Regular physical activity and avoiding tobacco and alcohol are also part of preparing for pregnancy. Both partners can support healthier routines and discuss concerns with a healthcare professional. Small, consistent changes can make preparation more manageable.': '{t("fpMethodsP7")}',
      'Find support in Sri Lanka': '{t("fpMethodsSupportTitle")}',
      'Your local Public Health Midwife (PHM) or Medical Officer of Health (MOH) clinic is a practical starting point for family planning advice. Ask about available methods, possible side effects, follow-up appointments, and planning pregnancy after childbirth.': '{t("fpMethodsSupportDesc")}',
      'Take the next step': '{t("fpMethodsNextStepTitle")}',
      'Write down your questions and discuss your goals with a healthcare professional. You may involve your partner if you wish, while keeping your own comfort and preferences central to the decision.': '{t("fpMethodsNextStepDesc")}',
      'This article provides general health information. Your PHM or doctor can help you choose care suited to your individual needs.': '{t("fpMethodsDisclaimer")}'
  }},
  { file: 'NutritionGuideScreen.tsx', strings: {
      'Nutrition Guide': '{t("nutritionHeaderTitle")}',
      'By Dr. Amarasinghe • 5 min read': '{t("nutritionAuthor")}',
      'Ensuring your toddler receives the right balance of nutrients is crucial for their rapid physical and cognitive development during these formative years. As they transition from infant formulas or breast milk to solid foods, introducing a variety of textures and flavors helps establish healthy lifelong eating habits.': '{t("nutritionP1")}',
      'Building a Balanced Plate': '{t("nutritionH2_1")}',
      'A toddler\\\'s stomach is small, so they need nutrient-dense meals and snacks spread throughout the day. Aim for three small meals and two to three healthy snacks daily. Each main meal should ideally include components from major food groups.': '{t("nutritionP2")}',
      'Proteins: ': '{t("nutritionL1Bold")}',
      'Essential for growth. Include lean meats, poultry, fish, eggs, beans, and lentils.': '{t("nutritionL1Desc")}',
      'Carbohydrates: ': '{t("nutritionL2Bold")}',
      'Provide necessary energy. Focus on whole grains like brown rice, whole-wheat pasta, and oats.': '{t("nutritionL2Desc")}',
      'Fruits & Vegetables: ': '{t("nutritionL3Bold")}',
      'Vital for vitamins, minerals, and fiber. Offer a rainbow of colors daily.': '{t("nutritionL3Desc")}',
      'Dairy or Alternatives: ': '{t("nutritionL4Bold")}',
      'Crucial for calcium and bone health. Whole milk, yogurt, and cheese are excellent choices for this age group.': '{t("nutritionL4Desc")}',
      'Key Tip: Managing Picky Eating': '{t("nutritionTipTitle")}',
      'It\\\'s common for toddlers to suddenly refuse foods they previously loved. Keep offering a variety of healthy options without pressuring them to eat. It can take up to 15 exposures to a new food before a child accepts it.': '{t("nutritionTipDesc")}',
      'Foods to Limit or Avoid': '{t("nutritionH2_2")}',
      'While exploring new foods is encouraged, certain items should be restricted to protect a toddler\\\'s developing system and prevent choking hazards.': '{t("nutritionP3")}',
      'Choking Hazards': '{t("nutritionHazard1Title")}',
      'Avoid whole grapes, nuts, popcorn, hot dogs (unless cut lengthwise), and hard candies.': '{t("nutritionHazard1Desc")}',
      'Added Sugars & Sodium': '{t("nutritionHazard2Title")}',
      'Limit fruit juices (even 100% juice), highly processed snacks, and foods with high added salt content.': '{t("nutritionHazard2Desc")}'
  }},
  { file: 'WhyImmunizeScreen.tsx', strings: {
      'Immunization is one of the safest and most effective ways to protect your child\\\'s health and the well-being of the community. Here is why staying on schedule matters.': '{t("whyImmunizeIntroText")}',
      'Vaccines train your child\\\'s immune system to recognize and fight serious diseases, providing immunity before exposure.': '{t("whyImmunizeReason1Desc")}',
      'High vaccination rates prevent outbreaks, protecting vulnerable individuals who cannot be vaccinated due to medical conditions.': '{t("whyImmunizeReason2Desc")}',
      'Check your personalized immunization timeline or book an appointment with your pediatrician.': '{t("whyImmunizeActionDesc")}'
  }}
];

function patchTsx() {
  for (const rep of mappings) {
    const filePath = path.join(srcDir, rep.file);
    if (!fs.existsSync(filePath)) {
      continue;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We will do a generic replacement for Text tags
    for (const [oldStr, newStr] of Object.entries(rep.strings)) {
        // Find the string in the file (ignoring all whitespace and newlines)
        const strippedOld = oldStr.replace(/\\'/g, "'").replace(/\s+/g, '');
        let contentStripped = content.replace(/\s+/g, '');
        
        // Let's use a regex that matches the string across newlines/whitespace
        // Escape regex special chars
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const regexStr = escapeRegExp(oldStr.replace(/\\'/g, "'")).replace(/\\\s+/g, '\\s+');
        const regex = new RegExp(`>\\s*${regexStr}\\s*<`, 'g');
        
        if (regex.test(content)) {
            content = content.replace(regex, `>${newStr}<`);
        } else {
             // Let's try splitting the old string into words and matching
             const words = oldStr.replace(/\\'/g, "'").split(/\s+/);
             let regexStr2 = '';
             for(let i = 0; i < words.length; i++) {
                 regexStr2 += escapeRegExp(words[i]);
                 if(i < words.length - 1) regexStr2 += '\\s+';
             }
             const regex2 = new RegExp(`>\\s*${regexStr2}\\s*<`, 'g');
             if(regex2.test(content)) {
                 content = content.replace(regex2, `>${newStr}<`);
             } else {
                  console.log(`Could not find in ${rep.file}: ${oldStr.substring(0, 30)}`);
             }
        }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched ' + rep.file);
  }
}

patchTsx();
