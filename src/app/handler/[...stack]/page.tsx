import { Suspense } from "react";
import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack";
import ShaderBackground from "@/components/shader-background";

interface HandlerProps {
  params: Promise<{
    stack: string[];
  }>;
}

export default async function Handler({ params }: HandlerProps) {
  const resolvedParams = await params;
  return (
    <ShaderBackground hideCircle>
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-light text-slate-100 mb-4">
                Loading <span className="font-medium italic instrument">Authentication</span>
              </h2>
              <p className="text-sm text-slate-200 font-light">
                Please wait while we prepare your sign-in experience...
              </p>
            </div>
          }>
            <div className="p-8">
              {/* Stack Auth Handler with default styling */}
              <StackHandler fullPage app={stackServerApp} routeProps={{ params: resolvedParams }} />
            </div>
          </Suspense>
        </div>
      </div>
    </ShaderBackground>
  );
}