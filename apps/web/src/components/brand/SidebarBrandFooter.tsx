'use client';

import { useTranslations } from 'next-intl';
import ArkyaLogo from '@/arkya/ArkyaLogo';
import ArkyaMark from '@/arkya/ArkyaMark';
import { useOnboardingTour } from '@/context/onboardingTour';

// The Arkya logo at the bottom of both sidebars: the wordmark, or the mark alone when the
// sidebar is in icon mode. It opens the tour of the product.
export default function SidebarBrandFooter() {
  const t = useTranslations('onboarding');
  const tour = useOnboardingTour();

  return (
    <div className="flex w-full items-center px-2 pt-2 pb-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <button
        type="button"
        onClick={tour.replay}
        data-product-mark
        aria-label={t('replay')}
        title={t('replay')}
        className="rounded-md text-sidebar-foreground transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-hidden"
      >
        <ArkyaLogo className="h-6 w-auto group-data-[collapsible=icon]:hidden" />
        <ArkyaMark className="hidden size-7 group-data-[collapsible=icon]:block" />
      </button>
    </div>
  );
}
