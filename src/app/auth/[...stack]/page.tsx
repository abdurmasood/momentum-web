import { Suspense } from "react";
import AuthRouter from "../../../components/auth/auth-router";

export default function Handler() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthRouter />
    </Suspense>
  );
}