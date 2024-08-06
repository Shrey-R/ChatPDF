import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

const NotFound = () => {
  return (
    <MaxWidthWrapper>
      <div className="mt-28 flex flex-col items-center justify-center bg-gray-100 w-full text-center">
        <div className="bg-white p-8 rounded-md shadow-lg max-w-auto text-center w-full h-96 flex flex-col justify-center items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-red-500 mb-4">404 - Page Not Found</h1>
          <p className="text-xs md:text-sm text-gray-700 mb-6">
            The page you are looking for does not exist.
          </p>
          <Link href="/" className={buttonVariants({
            variant:'link',
            className:'text-zinc-800 underline'
          })}>
              Go Back Home
          </Link>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default NotFound;
