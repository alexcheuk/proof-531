import { useDb } from '@/data/DbProvider';
import { updateSettings } from '@/data/accessors/settings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SETTINGS_KEY } from './useSettings';

export function useMarkStoreReviewRequested() {
  const db = useDb();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => updateSettings(db, { storeReviewRequested: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
}
