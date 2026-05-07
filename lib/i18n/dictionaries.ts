import type { IntroSegment, Locale } from './types';

export const dictionaries: Record<
  Locale,
  {
    nav: { home: string; workshops: string; about: string; login: string; profile: string };
    lang: { en: string; ar: string };
    home: {
      explore: string;
      introAria: string;
      tagline: string;
      intro: IntroSegment[];
      stageTitles: Record<string, string>;
      cpdTitle: string;
      cpdSubtitle: string;
      cpdBadge: string;
      cpdWorkshop: string;
      cpdBtn: string;
      cpdTagline: string;
      joinUs: string;
      discoverInterests: string;
      careerPosition: string;
      futurePath: string;
      partnerDistributor: string;
      partnerInnovator: string;
      partnerAccredited: string;
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
      takeAssessment: string;
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
      tagline: 'Towards an Inspiring and Ambitious Career Path',
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
      cpdTitle: 'Where are you in your career path?',
      cpdSubtitle: 'Discover your career path today — identify your strengths and what you need to achieve your professional ambitions.',
      cpdBadge: 'Build your career path with high-quality CPD',
      cpdWorkshop: 'Confirm your professional interests, discover your strengths and future career opportunities, and build an inspiring and motivating future.',
      cpdBtn: 'Where are you in your career path?',
      cpdTagline: 'Join the workshop to define your career path — from Choice to Esteem — CPD Certified',
      joinUs: 'Join Us',
      discoverInterests: 'Discover Your Interests',
      careerPosition: 'Your Professional Position Today',
      futurePath: 'Define Your Future Path',
      partnerDistributor: 'Distributor',
      partnerInnovator: 'Innovator',
      partnerAccredited: 'Accredited',
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
      takeAssessment: 'Take the Readiness Assessment',
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
      tagline: 'نحو بناء مسار مهني ملهم وطموح',
      stageTitles: {
        choice: 'اختيار',
        adapt: 'تأقلم',
        role: 'دور',
        effective: 'فعالية',
        esteem: 'تقدير',
        retire: 'تقاعد',
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
      cpdTitle: 'أين أنت من مسارك المهني؟',
      cpdSubtitle: 'اكتشف مسارك المهني اليوم، وتعرّف على نقاط قوتك، وما تحتاج إليه لتحقيق طموحك المهني.',
      cpdBadge: 'أبني مسارك المهني بجودة عالية من CPD',
      cpdWorkshop: 'تأكد من ميولك المهنية واكتشف نقاط قوتك وفرصك المهنية المستقبلية بناء مستقبل ملهم ومحفز',
      cpdBtn: 'أين أنت من مسارك المهني؟',
      cpdTagline: 'انضم إلى ورشة العمل لتحديد مسارك المهني من الاختيار إلى المكانة .. شهادة معتمدة من CPD',
      joinUs: 'انضم إلينا',
      discoverInterests: 'اكتشف ميولك',
      careerPosition: 'موقعك المهني اليوم',
      futurePath: 'حدد مسارك المستقبلي',
      partnerDistributor: 'الموزع',
      partnerInnovator: 'المبتكر',
      partnerAccredited: 'المعتمد',
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
      takeAssessment: 'ابدأ استبيان الجاهزية',
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
