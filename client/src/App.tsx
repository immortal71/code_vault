import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBar } from "@/components/search-bar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import MySnippets from "@/pages/my-snippets";
import Collections from "@/pages/collections";
import SearchPage from "@/pages/search";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/snippets" component={MySnippets} />
      <Route path="/collections" component={Collections} />
      <Route path="/search" component={SearchPage} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark">
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                  <SidebarTrigger data-testid="button-sidebar-toggle" className="md:hidden" />
                  
                  <div className="flex-1 flex justify-center px-4">
                    <SearchBar 
                      placeholder="Search snippets... ⌘K"
                      className="w-full max-w-[500px]"
                    />
                  </div>
                  
                  <ThemeToggle />
                </header>
                
                <main className="flex-1 overflow-auto">
                  <div className="container mx-auto px-6 py-6">
                    <Router />
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
