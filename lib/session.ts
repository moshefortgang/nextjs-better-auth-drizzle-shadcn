import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/auth";

// Deduplicated per request: the layout and the page can both call this
// without hitting the session store twice.
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
