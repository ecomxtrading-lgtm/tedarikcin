import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  // SADECE BLOKE ET - redirect yapma
  if (!session) return <Navigate to="/login" replace />;

  return children;
};

export default RequireAuth;
