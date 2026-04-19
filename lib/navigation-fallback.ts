/** روابط افتراضية عندما لا تتوفر بيانات من لوحة التحكم أو فشل الـ API */
export type NavigationItemDTO = {
  href: string;
  labelEn: string;
  labelAr: string;
  sortOrder?: number;
};

export const fallbackNavigationItems: NavigationItemDTO[] = [
  { href: '/', labelEn: 'Home', labelAr: 'الرئيسية', sortOrder: 0 },
  { href: '/workshops', labelEn: 'Workshops', labelAr: 'الورش', sortOrder: 1 },
  { href: '/about', labelEn: 'About Us', labelAr: 'من نحن', sortOrder: 2 },
];
