import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { updateSettings } from '../accessors/settings';
import { SETTINGS_KEY } from './useSettings';

export function useMarkReviewPrompted() {
  const db = useDb();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateSettings(db, { reviewPromptedAt: Date.now() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
}
