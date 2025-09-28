import { BookOpen, Code2, Home, Search, Settings, Plus } from "lucide-react"
import { Link, useLocation } from "wouter"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "My Snippets",
    url: "/snippets",
    icon: Code2,
  },
  {
    title: "Collections",
    url: "/collections",
    icon: BookOpen,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const [location] = useLocation()

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Code Snippets</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="mb-4 px-2">
              <Button 
                className="w-full justify-start gap-2" 
                size="sm"
                data-testid="button-new-snippet"
                onClick={() => console.log('Create new snippet')}
              >
                <Plus className="h-4 w-4" />
                New Snippet
              </Button>
            </div>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">John Doe</p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">john@example.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}