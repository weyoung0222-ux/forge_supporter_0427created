export interface LoginPayload {
  email: string;
}

export interface LoginResult {
  message: string;
}

export async function loginWithEmail(payload: LoginPayload): Promise<LoginResult> {
  await new Promise((resolve) => {
    setTimeout(resolve, 900);
  });

  return {
    message: `${payload.email} 계정으로 로그인 링크를 전송했어요.`,
  };
}
