import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
interface PageLayoutProps {
  pageTitle: string;
  showBack?: boolean;
  showSettings?: boolean;
  children: ReactNode;
}
export function PageLayout({
  pageTitle,
  showBack = true,
  showSettings = true,
  children
}: PageLayoutProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Header title="" showSettings={showSettings} />
      
      {showBack && (
        <div className="p-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 p-2 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Button>
        </div>
      )}
      
      {pageTitle && (
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        </div>
      )}
      
      {children}
    </div>
  );
}