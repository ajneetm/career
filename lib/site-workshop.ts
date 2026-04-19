import type { Locale } from '@/lib/i18n/types';

export type SiteWorkshopDTO = {
  id: string;
  titleEn: string;
  titleAr: string;
  instructor: string;
  category: string;
  color: string;
  letter: string;
  image: string | null;
  dayOfWeek: number | null;
  workshopDate: string | null;
  details: string[];
  sortOrder: number;
};

export type WorkshopCard = {
  id: string;
  title: string;
  instructor: string;
  category: string;
  color: string;
  letter: string;
  details: string[];
  image: string;
  dayOfWeek?: number | null;
};

export function siteWorkshopDtoToCard(dto: SiteWorkshopDTO, locale: Locale): WorkshopCard {
  return {
    id: dto.id,
    title: locale === 'ar' ? dto.titleAr || dto.titleEn : dto.titleEn,
    instructor: dto.instructor,
    category: dto.category,
    color: dto.color,
    letter: dto.letter,
    image: dto.image || '/Picture1.png',
    details: dto.details ?? [],
    dayOfWeek: dto.dayOfWeek,
  };
}
