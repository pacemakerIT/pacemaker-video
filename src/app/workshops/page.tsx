import WorkshopsClient from './workshops-client';

export const metadata = {
  title: 'Career Workshops',
  description:
    'Find practical career workshops and live learning events from PaceUp Career.'
};

export default function WorkshopsPage() {
  return <WorkshopsClient />;
}
