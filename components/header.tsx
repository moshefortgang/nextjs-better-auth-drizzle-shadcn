
// import { auth } from '@/app/auth';
import { ModeToggle } from './mode-toggle';
import { Search } from './search';
import { SidebarTrigger } from './ui/sidebar';
import { UserNav } from './user-nav';

export default function Header() {
 return (
    <header className="sticky flex justify-center border-b">
      <div className="flex items-center justify-between w-full h-16 px-4 mx-auto sm:px-6">
        <SidebarTrigger />
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
