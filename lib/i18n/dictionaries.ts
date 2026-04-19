import type { IntroSegment, Locale } from './types';

export const dictionaries: Record<
  Locale,
  {
    nav: { home: string; workshops: string; about: string; login: string; profile: string };
    lang: { en: string; ar: string };
    home: {
      explore: string;
      introAria: string;
      intro: IntroSegment[];
      /** عناوين بوكسات C-A-R-E-E-R على الصفحة الرئيسية */
      stageTitles: Record<string, string>;
    };
    about: {
      title: string;
      heroLine: string;
      missionTitle: string;
      missionParagraph: string;
      offerTitle: string;
      offerWorkshopsTitle: string;
      offerWorkshopsDesc: string;
      offerMentorshipTitle: string;
      offerMentorshipDesc: string;
      offerResourcesTitle: string;
      offerResourcesDesc: string;
    };
    career: {
      notFoundTitle: string;
      notFoundBody: string;
      joinWorkshop: string;
      bookConsultation: string;
      footerLine1: string;
      footerLine2: string;
    };
    workshops: {
      pageTitle: string;
      filterAll: string;
      registerNow: string;
      reserveTitle: string;
      workshopLabel: string;
      fullName: string;
      fullNamePlaceholder: string;
      confirmRegistration: string;
      successTitle: string;
      successBody: string;
      daySectionOther: string;
      dayNames: string[];
    };
  }
> = {
  en: {
    nav: {
      home: 'Home',
      workshops: 'Workshops',
      about: 'About Us',
      login: 'Login',
      profile: 'Profile',
    },
    lang: { en: 'EN', ar: 'عربي' },
    home: {
      explore: 'EXPLORE',
      introAria: 'C4E Introduction',
      stageTitles: {
        choice: 'CHOICE',
        adapt: 'ADAPT',
        role: 'ROLE',
        effective: 'EFFECTIVE',
        esteem: 'ESTEEM',
        retire: 'RETIRE',
      },
      intro: [
        { text: 'C4E (Career for Everyone)', tone: 'primary' },
        {
          text: ' is a UK-based company focused on advancing career pathways for individuals and organizations. Through professional solutions, C4E helps people ',
          tone: 'default',
        },
        { text: 'discover their strengths', tone: 'blue' },
        { text: ', ', tone: 'default' },
        { text: 'identify the right options', tone: 'orange' },
        { text: ', and ', tone: 'default' },
        { text: 'progress with greater clarity and impact', tone: 'green' },
        { text: ', serving beneficiaries across the world.', tone: 'default' },
      ],
    },
    about: {
      title: 'About Us',
      heroLine: 'Empowering your professional journey since 2026',
      missionTitle: 'Our Mission',
      missionParagraph:
        'At Career For Everyone, we believe that professional growth shouldn\'t be a luxury. Our mission is to bridge the gap between education and employment by providing accessible workshops, career guidance, and a supportive community.',
      offerTitle: 'What We Offer',
      offerWorkshopsTitle: 'Workshops',
      offerWorkshopsDesc:
        'Practical sessions led by industry experts to sharpen your skills and market knowledge.',
      offerMentorshipTitle: 'Mentorship',
      offerMentorshipDesc:
        'Direct guidance from professionals who have walked the path before you and succeeded.',
      offerResourcesTitle: 'Resources',
      offerResourcesDesc:
        'A curated library of tools and templates to boost your productivity and career search.',
    },
    career: {
      notFoundTitle: 'Stage Not Found',
      notFoundBody: 'The requested career stage does not exist.',
      joinWorkshop: 'Join Workshop',
      bookConsultation: 'Book a Consultation',
      footerLine1: 'Identify your stage now… and take the next step with awareness.',
      footerLine2: 'Career Path Workshop | Individual Consultation',
    },
    workshops: {
      pageTitle: 'CAREER Workshops',
      filterAll: 'ALL',
      registerNow: 'Register Now',
      reserveTitle: 'Reserve Your Spot',
      workshopLabel: 'Workshop:',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      confirmRegistration: 'Confirm Registration',
      successTitle: "You're In!",
      successBody: "We've received your registration for {title}.",
      daySectionOther: 'Other dates',
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      workshops: 'الورش',
      about: 'من نحن',
      login: 'تسجيل الدخول',
      profile: 'الملف الشخصي',
    },
    lang: { en: 'EN', ar: 'عربي' },
    home: {
      explore: 'استكشف',
      introAria: 'تعريف C4E',
      stageTitles: {
        choice: 'اختيار',
        adapt: 'تأقلم',
        role: 'دور',
        effective: 'فعالية',
        esteem: 'تقدير',
        retire: 'إرث',
      },
      intro: [
        { text: 'C4E (Career for Everyone)', tone: 'primary' },
        {
          text: ' شركة بريطانية تُعنى بتطوير المسار المهني للأفراد والمؤسسات، من خلال تقديم حلول مهنية تساعد على ',
          tone: 'default',
        },
        { text: 'اكتشاف القدرات', tone: 'blue' },
        { text: '، و', tone: 'default' },
        { text: 'تحديد الخيارات المناسبة', tone: 'orange' },
        { text: '، و', tone: 'default' },
        { text: 'دعم التقدم المهني بصورة أكثر وضوحًا وتأثيرًا', tone: 'green' },
        { text: '، بما يخدم المستفيدين من مختلف أنحاء العالم.', tone: 'default' },
      ],
    },
    about: {
      title: 'من نحن',
      heroLine: 'نمكّن رحلتك المهنية منذ 2026',
      missionTitle: 'رسالتنا',
      missionParagraph:
        'في Career For Everyone، نؤمن أن النمو المهني ليس رفاهية. تتمثل رسالتنا في سد الفجوة بين التعليم وسوق العمل من خلال ورش عمل يسهل الوصول إليها، وإرشاد مهني، ومجتمع داعم.',
      offerTitle: 'ما نقدم',
      offerWorkshopsTitle: 'ورش العمل',
      offerWorkshopsDesc: 'جلسات عملية يقدمها خبراء لصقل مهاراتك وفهم السوق.',
      offerMentorshipTitle: 'الإرشاد',
      offerMentorshipDesc: 'توجيه مباشر من محترفين مروا بالمسار وحققوا النجاح.',
      offerResourcesTitle: 'الموارد',
      offerResourcesDesc: 'مكتبة مختارة من الأدوات والقوالب لتعزيز إنتاجيتك وبحثك عن فرص.',
    },
    career: {
      notFoundTitle: 'المرحلة غير موجودة',
      notFoundBody: 'مرحلة المسار المطلوبة غير متوفرة.',
      joinWorkshop: 'انضم للورشة',
      bookConsultation: 'احجز استشارة',
      footerLine1: 'حدّد مرحلتك الآن… واتخذ خطوتك التالية بوعي.',
      footerLine2: 'ورشة المسار المهني | استشارة فردية',
    },
    workshops: {
      pageTitle: 'ورش المسار المهني',
      filterAll: 'الكل',
      registerNow: 'سجّل الآن',
      reserveTitle: 'احجز مقعدك',
      workshopLabel: 'الورشة:',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'اكتب اسمك الكامل',
      confirmRegistration: 'تأكيد التسجيل',
      successTitle: 'تم التسجيل!',
      successBody: 'استلمنا تسجيلك لورشة «{title}».',
      daySectionOther: 'تواريخ أخرى',
      dayNames: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    },
  },
};
