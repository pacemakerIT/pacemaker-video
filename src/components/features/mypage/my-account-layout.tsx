'use client';

import MyAccountSidebar from './my-account-side-bar';

export default function MyAccountLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full bg-[rgb(247,249,252)]">
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1248px] flex-1 px-6 py-12"
      >
        <div className="flex flex-col gap-8 lg:flex-row">
          <MyAccountSidebar />
          <section className="min-w-0 flex-1">{children}</section>
        </div>
      </main>
    </div>
  );
}
