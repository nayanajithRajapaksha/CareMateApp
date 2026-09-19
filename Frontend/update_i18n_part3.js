const fs = require('fs');
const path = require('path');

function getEnTranslations() {
  return `
  // Part 3: Remaining Screens
  selectClinicTitle: 'Select Clinic',
  selectClinicSubtitle: 'Find a nearby clinic for your vaccination.',
  searchClinicsPlaceholder: 'Search clinics...',
  vaccinesAvailable: 'Vaccines Available',
  bookHereBtn: 'Book Here',
  selectBtn: 'Select',
  loadingClinics: 'Loading clinics...',
  noClinicsFound: 'No clinics found matching your criteria.',
  
  registerChildTitle: 'Register Child',
  editChildTitle: 'Edit Child Profile',
  stepIndicator: 'Step %{current} of %{total}',
  childFullName: "Child's Full Name",
  enterChildFullName: "Enter child's full name",
  gender: 'Gender',
  male: 'Male',
  female: 'Female',
  dateOfBirth: 'Date of Birth',
  selectDate: 'Select Date',
  relationshipToChild: 'Relationship to Child',
  mother: 'Mother',
  father: 'Father',
  guardian: 'Guardian',
  nextStep: 'Next Step',
  backBtn: 'Back',
  medicalHistory: 'Medical History (Optional)',
  allergiesTitle: 'Allergies',
  allergiesPlaceholder: 'List any allergies (e.g., peanuts, penicillin)',
  birthWeightTitle: 'Birth Weight (kg)',
  birthWeightPlaceholder: 'e.g., 3.2',
  primaryClinic: 'Primary Clinic',
  selectClinicLabel: 'Select Clinic',
  finishRegistrationBtn: 'Finish Registration',
  saveChangesBtn: 'Save Changes',
  closeBtn: 'Close',
  
  childRecordsTitle: "%{childName}'s Records",
  upcomingBookingsTitle: 'Upcoming Bookings',
  bookingHistoryTitle: 'Booking History',
  noUpcomingBookings: 'No upcoming bookings.',
  noPastBookings: 'No past bookings.',
  
  manageAppointmentsTitle: 'My Appointments',
  cancelAppointmentAlertTitle: 'Cancel Appointment',
  cancelAppointmentAlertMessage: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
  keepBtn: 'Keep it',
  yesCancelBtn: 'Yes, Cancel',
  statusBooked: 'Booked',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',
  noAppointmentsTitle: 'No Appointments',
  noAppointmentsSubtitle: 'You do not have any appointments booked yet.',
  bookNowBtn: 'Book Now',
`;
}

function getSiTranslations() {
  return `
  // Part 3: Remaining Screens
  selectClinicTitle: 'සායනය තෝරන්න',
  selectClinicSubtitle: 'ඔබගේ එන්නත් කිරීම සඳහා ආසන්නතම සායනයක් සොයාගන්න.',
  searchClinicsPlaceholder: 'සායන සොයන්න...',
  vaccinesAvailable: 'ලබා ගත හැකි එන්නත්',
  bookHereBtn: 'මෙතැනින් වෙන්කරවා ගන්න',
  selectBtn: 'තෝරන්න',
  loadingClinics: 'සායන පූරණය වෙමින්...',
  noClinicsFound: 'ඔබේ සෙවුමට ගැලපෙන සායන හමු නොවීය.',
  
  registerChildTitle: 'දරුවා ලියාපදිංචි කරන්න',
  editChildTitle: 'ළමා පැතිකඩ සංස්කරණය කරන්න',
  stepIndicator: 'පියවර %{total} න් %{current}',
  childFullName: "දරුවාගේ සම්පූර්ණ නම",
  enterChildFullName: "දරුවාගේ සම්පූර්ණ නම ඇතුළත් කරන්න",
  gender: 'ස්ත්‍රී/පුරුෂ භාවය',
  male: 'පිරිමි',
  female: 'ගැහැණු',
  dateOfBirth: 'උපන් දිනය',
  selectDate: 'දිනය තෝරන්න',
  relationshipToChild: 'දරුවාට ඇති සම්බන්ධතාවය',
  mother: 'මව',
  father: 'පියා',
  guardian: 'භාරකරු',
  nextStep: 'ඊළඟ පියවර',
  backBtn: 'ආපසු',
  medicalHistory: 'වෛද්‍ය ඉතිහාසය (විකල්ප)',
  allergiesTitle: 'ආසාත්මිකතා',
  allergiesPlaceholder: 'ආසාත්මිකතා දක්වන්න (උදා: රටකජු, පෙනිසිලින්)',
  birthWeightTitle: 'උපන් බර (kg)',
  birthWeightPlaceholder: 'උදා: 3.2',
  primaryClinic: 'ප්‍රධාන සායනය',
  selectClinicLabel: 'සායනය තෝරන්න',
  finishRegistrationBtn: 'ලියාපදිංචිය අවසන් කරන්න',
  saveChangesBtn: 'වෙනස්කම් සුරකින්න',
  closeBtn: 'වසන්න',
  
  childRecordsTitle: "%{childName} ගේ වාර්තා",
  upcomingBookingsTitle: 'ඉදිරි වෙන්කරවා ගැනීම්',
  bookingHistoryTitle: 'වෙන්කරවා ගැනීමේ ඉතිහාසය',
  noUpcomingBookings: 'ඉදිරි වෙන්කරවා ගැනීම් නොමැත.',
  noPastBookings: 'පසුගිය වෙන්කරවා ගැනීම් නොමැත.',
  
  manageAppointmentsTitle: 'මගේ හමුවීම්',
  cancelAppointmentAlertTitle: 'හමුවීම අවලංගු කරන්න',
  cancelAppointmentAlertMessage: 'ඔබට මෙම හමුවීම අවලංගු කිරීමට අවශ්‍ය බව විශ්වාසද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.',
  keepBtn: 'තබා ගන්න',
  yesCancelBtn: 'ඔව්, අවලංගු කරන්න',
  statusBooked: 'වෙන්කර ඇත',
  statusCompleted: 'සම්පූර්ණයි',
  statusCancelled: 'අවලංගු කර ඇත',
  noAppointmentsTitle: 'හමුවීම් නොමැත',
  noAppointmentsSubtitle: 'ඔබ තවමත් කිසිදු හමුවීමක් වෙන්කරවා ගෙන නොමැත.',
  bookNowBtn: 'දැන් වෙන්කරවා ගන්න',
`;
}

function getTaTranslations() {
  return `
  // Part 3: Remaining Screens
  selectClinicTitle: 'கிளினிக்கைத் தேர்ந்தெடுக்கவும்',
  selectClinicSubtitle: 'உங்கள் தடுப்பூசிக்கான அருகிலுள்ள கிளினிக்கைக் கண்டறியவும்.',
  searchClinicsPlaceholder: 'கிளினிக்குகளைத் தேடுங்கள்...',
  vaccinesAvailable: 'கிடைக்கக்கூடிய தடுப்பூசிகள்',
  bookHereBtn: 'இங்கே பதிவு செய்யுங்கள்',
  selectBtn: 'தேர்ந்தெடு',
  loadingClinics: 'கிளினிக்குகளை ஏற்றுகிறது...',
  noClinicsFound: 'உங்கள் தேடலுக்குப் பொருத்தமான கிளினிக்குகள் எதுவும் கிடைக்கவில்லை.',
  
  registerChildTitle: 'குழந்தையை பதிவு செய்',
  editChildTitle: 'குழந்தையின் சுயவிவரத்தைத் திருத்து',
  stepIndicator: 'படி %{current} இல் %{total}',
  childFullName: "குழந்தையின் முழுப் பெயர்",
  enterChildFullName: "குழந்தையின் முழுப் பெயரை உள்ளிடவும்",
  gender: 'பாலினம்',
  male: 'ஆண்',
  female: 'பெண்',
  dateOfBirth: 'பிறந்த தேதி',
  selectDate: 'தேதியைத் தேர்ந்தெடுக்கவும்',
  relationshipToChild: 'குழந்தையுடனான உறவு',
  mother: 'தாய்',
  father: 'தந்தை',
  guardian: 'பாதுகாவலர்',
  nextStep: 'அடுத்த படி',
  backBtn: 'பின்செல்க',
  medicalHistory: 'மருத்துவ வரலாறு (விருப்பமானவை)',
  allergiesTitle: 'ஒவ்வாமை',
  allergiesPlaceholder: 'ஏதேனும் ஒவ்வாமைகளைப் பட்டியலிடுங்கள் (எ.கா: வேர்க்கடலை, பென்சிலின்)',
  birthWeightTitle: 'பிறந்த எடை (kg)',
  birthWeightPlaceholder: 'எ.கா: 3.2',
  primaryClinic: 'முதன்மை கிளினிக்',
  selectClinicLabel: 'கிளினிக்கைத் தேர்ந்தெடுக்கவும்',
  finishRegistrationBtn: 'பதிவை முடிக்கவும்',
  saveChangesBtn: 'மாற்றங்களைச் சேமி',
  closeBtn: 'மூடு',
  
  childRecordsTitle: "%{childName} இன் பதிவுகள்",
  upcomingBookingsTitle: 'வரவிருக்கும் பதிவுகள்',
  bookingHistoryTitle: 'பதிவு வரலாறு',
  noUpcomingBookings: 'வரவிருக்கும் பதிவுகள் ஏதுமில்லை.',
  noPastBookings: 'கடந்த பதிவுகள் ஏதுமில்லை.',
  
  manageAppointmentsTitle: 'எனது சந்திப்புகள்',
  cancelAppointmentAlertTitle: 'சந்திப்பை ரத்து செய்',
  cancelAppointmentAlertMessage: 'இந்தச் சந்திப்பை ரத்து செய்ய விரும்புகிறீர்களா? இந்தச் செயலைத் தவிர்க்க முடியாது.',
  keepBtn: 'வைத்திருக்கவும்',
  yesCancelBtn: 'ஆம், ரத்து செய்',
  statusBooked: 'பதிவு செய்யப்பட்டது',
  statusCompleted: 'முடிந்தது',
  statusCancelled: 'ரத்து செய்யப்பட்டது',
  noAppointmentsTitle: 'சந்திப்புகள் இல்லை',
  noAppointmentsSubtitle: 'நீங்கள் இதுவரை எந்தச் சந்திப்புகளையும் பதிவு செய்யவில்லை.',
  bookNowBtn: 'இப்போது பதிவு செய்',
`;
}

function updateTranslationFile(filename, newContent) {
  let content = fs.readFileSync(filename, 'utf8');
  content = content.replace(/};\s*$/, newContent + '\n};\n');
  fs.writeFileSync(filename, content);
}

console.log("Updating translation files...");
updateTranslationFile('src/i18n/translations/en.ts', getEnTranslations());
updateTranslationFile('src/i18n/translations/si.ts', getSiTranslations());
updateTranslationFile('src/i18n/translations/ta.ts', getTaTranslations());

function updateSelectClinicScreen() {
  const file = 'src/screens/SelectClinicScreen.tsx';
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/import \{ clinicService, Clinic \} from '\.\.\/services\/clinicService';/,
`import { clinicService, Clinic } from '../services/clinicService';
import { useLanguage } from '../i18n/LanguageContext';`);

  content = content.replace(/export const SelectClinicScreen: React\.FC = \(\) => \{/,
`export const SelectClinicScreen: React.FC = () => {
  const { t } = useLanguage();`);

  content = content.replace(/>Select Clinic</g, ">{t('selectClinicTitle')}<");
  content = content.replace(/>Find a nearby clinic for your vaccination\.</g, ">{t('selectClinicSubtitle')}<");
  content = content.replace(/placeholder="Search clinics\.\.\."/, "placeholder={t('searchClinicsPlaceholder')}");
  content = content.replace(/>Vaccines Available</g, ">{t('vaccinesAvailable')}<");
  content = content.replace(/>Book Here</g, ">{t('bookHereBtn')}<");
  content = content.replace(/>Select</g, ">{t('selectBtn')}<");

  fs.writeFileSync(file, content);
}

function updateRegisterChildScreen() {
  const file = 'src/screens/RegisterChildScreen.tsx';
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/import DateTimePicker from '@react-native-community\/datetimepicker';/,
`import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '../i18n/LanguageContext';`);

  content = content.replace(/export const RegisterChildScreen: React\.FC = \(\) => \{/,
`export const RegisterChildScreen: React.FC = () => {
  const { t } = useLanguage();`);

  content = content.replace(/>Register Child</g, ">{t('registerChildTitle')}<");
  content = content.replace(/>Edit Child Profile</g, ">{t('editChildTitle')}<");
  content = content.replace(/>Step \{step\} of 2</, ">{t('stepIndicator', { current: step, total: 2 })}<");
  content = content.replace(/>Child's Full Name</g, ">{t('childFullName')}<");
  content = content.replace(/placeholder="Enter child's full name"/, "placeholder={t('enterChildFullName')}");
  content = content.replace(/>Gender</g, ">{t('gender')}<");
  content = content.replace(/>Male</g, ">{t('male')}<");
  content = content.replace(/>Female</g, ">{t('female')}<");
  content = content.replace(/>Date of Birth</g, ">{t('dateOfBirth')}<");
  content = content.replace(/>Select Date</g, ">{t('selectDate')}<");
  content = content.replace(/>Relationship to Child</g, ">{t('relationshipToChild')}<");
  content = content.replace(/>Mother</g, ">{t('mother')}<");
  content = content.replace(/>Father</g, ">{t('father')}<");
  content = content.replace(/>Guardian</g, ">{t('guardian')}<");
  content = content.replace(/>Next Step</g, ">{t('nextStep')}<");
  content = content.replace(/>Back</g, ">{t('backBtn')}<");
  content = content.replace(/>Medical History \(Optional\)</g, ">{t('medicalHistory')}<");
  content = content.replace(/>Allergies</g, ">{t('allergiesTitle')}<");
  content = content.replace(/placeholder="List any allergies \(e\.g\., peanuts, penicillin\)"/, "placeholder={t('allergiesPlaceholder')}");
  content = content.replace(/>Birth Weight \(kg\)</g, ">{t('birthWeightTitle')}<");
  content = content.replace(/placeholder="e\.g\., 3\.2"/, "placeholder={t('birthWeightPlaceholder')}");
  content = content.replace(/>Primary Clinic</g, ">{t('primaryClinic')}<");
  content = content.replace(/title="Finish Registration"/, "title={t('finishRegistrationBtn')}");
  content = content.replace(/title="Save Changes"/, "title={t('saveChangesBtn')}");
  content = content.replace(/>Close</g, ">{t('closeBtn')}<");

  fs.writeFileSync(file, content);
}

function updateChildRecordsScreen() {
  const file = 'src/screens/ChildRecordsScreen.tsx';
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/import \{ appointmentService \} from '\.\.\/services\/appointmentService';/,
`import { appointmentService } from '../services/appointmentService';
import { useLanguage } from '../i18n/LanguageContext';`);

  content = content.replace(/export const ChildRecordsScreen: React\.FC = \(\) => \{/,
`export const ChildRecordsScreen: React.FC = () => {
  const { t } = useLanguage();`);

  content = content.replace(/>\{child\.full_name\}'s Records</, ">{t('childRecordsTitle', { childName: child.full_name })}<");
  content = content.replace(/>Upcoming Bookings</g, ">{t('upcomingBookingsTitle')}<");
  content = content.replace(/>No upcoming bookings\.</g, ">{t('noUpcomingBookings')}<");
  content = content.replace(/>Booking History</g, ">{t('bookingHistoryTitle')}<");
  content = content.replace(/>No past bookings\.</g, ">{t('noPastBookings')}<");

  fs.writeFileSync(file, content);
}

function updateManageAppointmentsScreen() {
  const file = 'src/screens/ManageAppointmentsScreen.tsx';
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/import \{ appointmentService \} from '\.\.\/services\/appointmentService';/,
`import { appointmentService } from '../services/appointmentService';
import { useLanguage } from '../i18n/LanguageContext';`);

  content = content.replace(/export const ManageAppointmentsScreen: React\.FC = \(\) => \{/,
`export const ManageAppointmentsScreen: React.FC = () => {
  const { t } = useLanguage();`);

  content = content.replace(/'Cancel Appointment'/g, "t('cancelAppointmentAlertTitle')");
  content = content.replace(/'Are you sure you want to cancel this appointment\? This action cannot be undone\.'/g, "t('cancelAppointmentAlertMessage')");
  content = content.replace(/'Keep it'/g, "t('keepBtn')");
  content = content.replace(/'Yes, Cancel'/g, "t('yesCancelBtn')");

  content = content.replace(/>My Appointments</g, ">{t('manageAppointmentsTitle')}<");
  content = content.replace(/>No Appointments</g, ">{t('noAppointmentsTitle')}<");
  content = content.replace(/>You do not have any appointments booked yet\.</g, ">{t('noAppointmentsSubtitle')}<");
  content = content.replace(/>Book Now</g, ">{t('bookNowBtn')}<");

  content = content.replace(/\{appt\.status === 'booked' \? 'Booked' : appt\.status === 'completed' \? 'Completed' : 'Cancelled'\}/g, "{appt.status === 'booked' ? t('statusBooked') : appt.status === 'completed' ? t('statusCompleted') : t('statusCancelled')}");
  
  content = content.replace(/\{appt\.status\.toUpperCase\(\)\}/g, "{appt.status === 'booked' ? t('statusBooked').toUpperCase() : appt.status === 'completed' ? t('statusCompleted').toUpperCase() : t('statusCancelled').toUpperCase()}");

  fs.writeFileSync(file, content);
}

console.log("Updating screens...");
updateSelectClinicScreen();
updateRegisterChildScreen();
updateChildRecordsScreen();
updateManageAppointmentsScreen();
console.log("Done!");
