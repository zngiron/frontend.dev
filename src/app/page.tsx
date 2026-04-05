import Image from 'next/image';

export default async function Page(_: PageProps<'/'>) {
  return (
    <Image
      className="size-16"
      src="/static/frontend-dev-icon.svg"
      alt="Front-End Development Framework"
      width={64}
      height={64}
      draggable={false}
      priority
    />
  );
}
