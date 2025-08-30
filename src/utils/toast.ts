import { useToastStore } from '../components/UI/ToastContainer';

export const toast = {
  info: (msg: string) => useToastStore.getState().push(msg, 'info'),
  success: (msg: string) => useToastStore.getState().push(msg, 'success'),
  warning: (msg: string) => useToastStore.getState().push(msg, 'warning'),
  error: (msg: string) => useToastStore.getState().push(msg, 'error'),
};

