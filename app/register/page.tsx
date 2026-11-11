import { ModeToggle } from '@/components/mode-toggle';
import RegisterForm from '@/components/register-form';

export default function register() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <RegisterForm />
    </div>
  );
}