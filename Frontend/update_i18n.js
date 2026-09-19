const fs = require('fs');

function updateParentDashboard() {
  const file = 'src/screens/ParentDashboardScreen.tsx';
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/import \{ appointmentService \} from '\.\.\/services\/appointmentService';/,
`import { appointmentService } from '../services/appointmentService';
import { useLanguage } from '../i18n/LanguageContext';`);

  content = content.replace(/export const ParentDashboardScreen: React\.FC = \(\) => \{/,
`export const ParentDashboardScreen: React.FC = () => {
  const { t } = useLanguage();`);

  content = content.replace(/>No Children Added</g, '>{t(\'noChildrenAdded\')}<');
  content = content.replace(/>Add a child profile to track their health and vaccinations\.</g, '>{t(\'noChildrenSubtitle\')}<');
  content = content.replace(/\"Register a Child\"/g, '"{t(\'registerChild\')}"');
  content = content.replace(/>Hello, \{userName\}!</g, '>{t(\'helloUser\', { name: userName })}<');
  content = content.replace(/Your family\'s health is on track\. All children are up to date with vaccinations\./g, '{t(\'familyHealthOnTrack\')}');
  content = content.replace(/>All Good</g, '>{t(\'allGood\')}<');
  content = content.replace(/>Quick Actions</g, '>{t(\'quickActions\')}<');
  content = content.replace(/>Book</g, '>{t(\'bookAction\')}<');
  content = content.replace(/>Clinic</g, '>{t(\'clinicAction\')}<');
  content = content.replace(/>Vaccines</g, '>{t(\'vaccinesAction\')}<');
  content = content.replace(/>Family\{"\\n"\}Planning</g, '>{t(\'familyPlanningAction\')}<');
  content = content.replace(/>Upcoming Appointments</g, '>{t(\'upcomingAppointments\')}<');
  content = content.replace(/>Manage</g, '>{t(\'manageText\')}<');
  content = content.replace(/>\{appt\.child_name\} - \{appt\.clinic_name\}</g, '>{t(\'appointmentWith\', { childName: appt.child_name, clinicName: appt.clinic_name })}<');
  content = content.replace(/>With \{appt\.midwife_name\}</g, '>{t(\'withMidwife\', { name: appt.midwife_name })}<');
  content = content.replace(/>Children</g, '>{t(\'childrenSection\')}<');
  content = content.replace(/>View All</g, '>{t(\'viewAllText\')}<');
  content = content.replace(/>Loading\.\.\.</g, '>{t(\'loadingText\')}<');
  content = content.replace(/>Up to date</g, '>{t(\'upToDate\')}<');

  // Fix the quotes on title={t('registerChild')} since we replaced "Register a Child" above
  content = content.replace(/title="\{t\('registerChild'\)\}"/g, "title={t('registerChild')}");

  fs.writeFileSync(file, content);
  console.log('Updated ParentDashboardScreen.tsx');
}

function updateChildrenScreen() {
  const file = 'src/screens/ChildrenScreen.tsx';
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/import \{ childService \} from '\.\.\/services\/childService';/,
`import { childService } from '../services/childService';
import { useLanguage } from '../i18n/LanguageContext';`);

  content = content.replace(/export const ChildrenScreen: React\.FC = \(\) => \{/,
`export const ChildrenScreen: React.FC = () => {
  const { t } = useLanguage();`);

  content = content.replace(/>No Children Added</g, '>{t(\'noChildrenAdded\')}<');
  content = content.replace(/>You haven't added any children profiles yet\. Add your child to start managing their health records and vaccination schedules\.</g, '>{t(\'noChildrenAddedLongSubtitle\')}<');
  content = content.replace(/\"Register a Child\"/g, '"{t(\'registerChild\')}"');
  content = content.replace(/>My Children</g, '>{t(\'myChildrenTitle\')}<');
  content = content.replace(/>Manage profiles and vaccination schedules\.</g, '>{t(\'myChildrenSubtitle\')}<');
  content = content.replace(/>Loading\.\.\.</g, '>{t(\'loadingText\')}<');
  content = content.replace(/>Schedule</g, '>{t(\'scheduleBtn\')}<');
  content = content.replace(/>Records</g, '>{t(\'recordsBtn\')}<');

  // Fix the quotes
  content = content.replace(/title="\{t\('registerChild'\)\}"/g, "title={t('registerChild')}");

  fs.writeFileSync(file, content);
  console.log('Updated ChildrenScreen.tsx');
}

updateParentDashboard();
updateChildrenScreen();
