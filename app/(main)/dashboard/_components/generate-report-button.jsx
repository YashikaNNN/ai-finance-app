"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function GenerateReportButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    
    try {
      // Navigate to the financial report page instead of sending an email
      router.push("/financial-report");
    } catch (error) {
      console.error("Error navigating to report page:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full"
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Report...
        </>
      ) : (
        "View Financial Report"
      )}
    </Button>
  );
} 