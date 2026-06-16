"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../requests/get-profile";

export function useProfileQuery() {
  return useQuery({
    queryKey: ["associated", "profile"],
    queryFn: getProfile,
  });
}
