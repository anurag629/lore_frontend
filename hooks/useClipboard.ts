import { useToast } from '@/components/ui/Toast';

export function useClipboard() {
  const { showToast } = useToast();

  const copy = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label || 'Copied'} to clipboard!`, 'success');
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  return { copy };
}

