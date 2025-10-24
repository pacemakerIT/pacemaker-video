import '@/app/globals.css';
import MyPage from '@/components/features/mypage/my-page';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <MyPage>{children}</MyPage>;
}
