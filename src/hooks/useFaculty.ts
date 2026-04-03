import useSWR from "swr";

export type FacultySummary = {
  id: string;
  name: string;
  designation: string | null;
  department: string | null;
  photoUrl: string | null;
  ratingCount: number;
  avgRating: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const FIVE_MINUTES = 5 * 60 * 1000;

export function useFaculty() {
  const { data, error, isLoading, mutate } = useSWR<{ faculty: FacultySummary[] }>(
    "/api/faculty",
    fetcher,
    {
      dedupingInterval: FIVE_MINUTES,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      keepPreviousData: true,
    }
  );

  return {
    faculty: data?.faculty ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}