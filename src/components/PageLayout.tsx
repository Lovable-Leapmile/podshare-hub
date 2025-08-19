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

export function PageLayout({ pageTitle, showBack = true, showSettings = true, children }: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <>
      <Header title="" showSettings={showSettings} />

      <div className="bg-qikpod-light-bg px-4 py-3">
        <div className="max-w-md mx-auto flex items-center">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-3 h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 text-center">
            <span className="font-semibold text-foreground">{pageTitle}</span>
          </div>
          {/* spacer to balance back button width */}
          {showBack ? <div className="w-8" /> : <div className="w-8" />}
        </div>
      </div>

      {children}
    </>
  );
}


