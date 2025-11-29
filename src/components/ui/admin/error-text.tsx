export default function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-pace-orange-500 text-pace-sm mt-1">{message}</p>;
}
