import { Bell, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { LanguageSwitcher, LanguageSwitcherMini } from "@/components/language-switcher";

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();
  const [notificationCount] = useState(3);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center py-3 px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2 text-neutral-700"
            onClick={onMenuToggle}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="md:hidden">
            <Logo size="sm" showText={false} />
          </div>
          <h1 className="text-xl font-medium text-neutral-800 ml-3">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language switcher - Desktop version */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Language switcher - Mobile version */}
          <div className="block md:hidden">
            <LanguageSwitcherMini />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {notificationCount}
                </span>
              )}
            </Button>
          </div>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary-100 text-primary-800">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 font-medium text-neutral-700 hidden sm:block">
                  {user?.fullName || user?.username}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600" 
                onClick={() => logoutMutation.mutate()}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
