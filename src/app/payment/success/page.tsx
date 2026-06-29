import { redirect } from 'next/navigation';

type PaymentSuccessAliasProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentSuccessAlias({
  searchParams
}: PaymentSuccessAliasProps) {
  const params = await searchParams;
  const redirectParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => redirectParams.append(key, item));
    } else if (value) {
      redirectParams.set(key, value);
    }
  }

  const query = redirectParams.toString();
  redirect(
    query ? `/mypage/payment-success?${query}` : '/mypage/payment-success'
  );
}
