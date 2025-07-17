import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "search": "Search",
      "post": "Post",
      "messages": "Messages",
      "profile": "Profile",
      
      // Auth
      "login": "Login",
      "signup": "Sign Up",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "fullName": "Full Name",
      "signInWith": "Sign in with",
      "orContinueWith": "Or continue with",
      "forgotPassword": "Forgot password?",
      "noAccount": "Don't have an account? Sign up",
      "hasAccount": "Already have an account? Sign in",
      "loginSuccess": "Login successful",
      "signupSuccess": "Account created successfully",
      "welcome": "Welcome!",
      
      // Post Creation
      "createPost": "Create Post",
      "serviceProvider": "Service Provider",
      "serviceSeeker": "Service Seeker",
      "userType": "I am a",
      "whatServiceCompleted": "What service did you complete today? Share your work with the community...",
      "whatServiceNeeded": "What service do you need? Describe your requirements...",
      "serviceCategory": "Service Category",
      "selectCategory": "Select a service category",
      "photos": "Photos",
      "addPhoto": "Add Photo",
      "tags": "Tags",
      "addTag": "Add a tag",
      "location": "Location",
      "change": "Change",
      "postSettings": "Post Settings",
      "allowComments": "Allow comments",
      "showContactInfo": "Show contact info",
      "posting": "Posting...",
      "cancel": "Cancel",
      
      // Chat
      "startJob": "Start Job",
      "jobInProgress": "Job in Progress",
      "endJob": "End Job",
      "leaveReview": "Leave a Review",
      "rating": "Rating",
      "comment": "Comment (optional)",
      "submitReview": "Submit Review",
      "skip": "Skip",
      "typeMessage": "Type a message...",
      "searchConversations": "Search conversations...",
      
      // Settings
      "settings": "Settings",
      "language": "Language",
      "selectLanguage": "Select Language",
      
      // Languages
      "arabic": "العربية",
      "french": "Français",
      "english": "English"
    }
  },
  ar: {
    translation: {
      // Navigation
      "home": "الرئيسية",
      "search": "البحث",
      "post": "نشر",
      "messages": "الرسائل",
      "profile": "الملف الشخصي",
      
      // Auth
      "login": "تسجيل الدخول",
      "signup": "إنشاء حساب",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "confirmPassword": "تأكيد كلمة المرور",
      "fullName": "الاسم الكامل",
      "signInWith": "سجل الدخول باستخدام",
      "orContinueWith": "أو تابع باستخدام",
      "forgotPassword": "نسيت كلمة المرور؟",
      "noAccount": "ليس لديك حساب؟ سجل الآن",
      "hasAccount": "لديك حساب بالفعل؟ سجل الدخول",
      "loginSuccess": "تم تسجيل الدخول بنجاح",
      "signupSuccess": "تم إنشاء الحساب بنجاح",
      "welcome": "مرحباً!",
      
      // Post Creation
      "createPost": "إنشاء منشور",
      "serviceProvider": "مقدم خدمة",
      "serviceSeeker": "باحث عن خدمة",
      "userType": "أنا",
      "whatServiceCompleted": "ما هي الخدمة التي أكملتها اليوم؟ شارك عملك مع المجتمع...",
      "whatServiceNeeded": "ما هي الخدمة التي تحتاجها؟ اشرح متطلباتك...",
      "serviceCategory": "فئة الخدمة",
      "selectCategory": "اختر فئة الخدمة",
      "photos": "الصور",
      "addPhoto": "إضافة صورة",
      "tags": "العلامات",
      "addTag": "إضافة علامة",
      "location": "الموقع",
      "change": "تغيير",
      "postSettings": "إعدادات المنشور",
      "allowComments": "السماح بالتعليقات",
      "showContactInfo": "إظهار معلومات الاتصال",
      "posting": "جاري النشر...",
      "cancel": "إلغاء",
      
      // Chat
      "startJob": "بدء العمل",
      "jobInProgress": "العمل قيد التنفيذ",
      "endJob": "إنهاء العمل",
      "leaveReview": "اترك تقييماً",
      "rating": "التقييم",
      "comment": "تعليق (اختياري)",
      "submitReview": "إرسال التقييم",
      "skip": "تخطي",
      "typeMessage": "اكتب رسالة...",
      "searchConversations": "البحث في المحادثات...",
      
      // Settings
      "settings": "الإعدادات",
      "language": "اللغة",
      "selectLanguage": "اختر اللغة",
      
      // Languages
      "arabic": "العربية",
      "french": "Français",
      "english": "English"
    }
  },
  fr: {
    translation: {
      // Navigation
      "home": "Accueil",
      "search": "Recherche",
      "post": "Publier",
      "messages": "Messages",
      "profile": "Profil",
      
      // Auth
      "login": "Connexion",
      "signup": "S'inscrire",
      "email": "Email",
      "password": "Mot de passe",
      "confirmPassword": "Confirmer le mot de passe",
      "fullName": "Nom complet",
      "signInWith": "Se connecter avec",
      "orContinueWith": "Ou continuer avec",
      "forgotPassword": "Mot de passe oublié ?",
      "noAccount": "Pas de compte ? S'inscrire",
      "hasAccount": "Déjà un compte ? Se connecter",
      "loginSuccess": "Connexion réussie",
      "signupSuccess": "Compte créé avec succès",
      "welcome": "Bienvenue !",
      
      // Post Creation
      "createPost": "Créer une publication",
      "serviceProvider": "Prestataire de service",
      "serviceSeeker": "Chercheur de service",
      "userType": "Je suis un",
      "whatServiceCompleted": "Quel service avez-vous terminé aujourd'hui ? Partagez votre travail avec la communauté...",
      "whatServiceNeeded": "Quel service avez-vous besoin ? Décrivez vos exigences...",
      "serviceCategory": "Catégorie de service",
      "selectCategory": "Sélectionner une catégorie",
      "photos": "Photos",
      "addPhoto": "Ajouter une photo",
      "tags": "Tags",
      "addTag": "Ajouter un tag",
      "location": "Localisation",
      "change": "Changer",
      "postSettings": "Paramètres de publication",
      "allowComments": "Autoriser les commentaires",
      "showContactInfo": "Afficher les infos de contact",
      "posting": "Publication...",
      "cancel": "Annuler",
      
      // Chat
      "startJob": "Commencer le travail",
      "jobInProgress": "Travail en cours",
      "endJob": "Terminer le travail",
      "leaveReview": "Laisser un avis",
      "rating": "Note",
      "comment": "Commentaire (optionnel)",
      "submitReview": "Soumettre l'avis",
      "skip": "Passer",
      "typeMessage": "Tapez un message...",
      "searchConversations": "Rechercher des conversations...",
      
      // Settings
      "settings": "Paramètres",
      "language": "Langue",
      "selectLanguage": "Sélectionner la langue",
      
      // Languages
      "arabic": "العربية",
      "french": "Français",
      "english": "English"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;