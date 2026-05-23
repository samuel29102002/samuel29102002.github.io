import DataDash from '@/components/ui/DataDash';

export const metadata = {
  title: 'Play · Samuel Heinrich',
  description: 'Data Dash — jump over the errors.',
};

export default function PlayPage() {
  return (
    <div className="pt-32">
      <section className="mx-auto max-w-screen-xl px-6 pb-8 lg:px-12">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
          Play
        </span>
        <h1 className="mt-3 font-display text-fluid-3xl tracking-tighter">Data Dash.</h1>
        <p className="mt-4 max-w-md font-mono text-sm text-muted">
          Jump over the errors. Your player is a{' '}
          <span className="text-accent">df</span> block.{' '}
          <span className="text-accent">SPACE</span> or tap to jump.
        </p>
      </section>

      <section className="mx-auto max-w-screen-xl px-6 pb-24 lg:px-12">
        <DataDash />
      </section>
    </div>
  );
}
