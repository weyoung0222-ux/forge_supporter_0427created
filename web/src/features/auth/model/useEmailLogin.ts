import { useState } from 'react';
import { loginWithEmail } from '../api/login';

export function useEmailLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (email: string) => {
    setIsLoading(true);
    try {
      return await loginWithEmail({ email });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submit,
  };
}
