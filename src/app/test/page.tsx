"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DLMMService } from "@/services/dlmm";

export default function TestPage() {
  const [dlmmResults, setDlmmResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDLMM = async () => {
    setLoading(true);
    setError(null);

    try {
      const dlmm = new DLMMService();
      console.log("Testing DLMM connection...");

      const result = await dlmm.testConnection();
      setDlmmResults(result);
      console.log("DLMM Test Result:", result);
    } catch (err) {
      console.error("DLMM test failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>DLMM Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDLMM} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test DLMM Connection"}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 break-words">Error: {error}</p>
              </div>
            )}

            {dlmmResults && (
              <div className="p-4 bg-gray-50 border rounded-md">
                <h3 className="font-semibold mb-2">Connection Results:</h3>
                <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap break-words">
                    {JSON.stringify(dlmmResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
