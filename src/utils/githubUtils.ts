export const convertToRawUrl = (githubUrl: string): string => {
  return githubUrl
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/');
};

export const validateSolidityUrl = (url: string): boolean => {
  return url.includes('.sol');
};

export const extractContractName = (githubUrl: string): string => {
  return githubUrl.split('/').pop() || 'Contract';
};

export interface FetchContractResult {
  content: string;
  name: string;
  error?: string;
}

export const fetchContractFromGithub = async (
  githubUrl: string
): Promise<FetchContractResult> => {
  if (!validateSolidityUrl(githubUrl)) {
    return {
      content: '',
      name: '',
      error: '❌ Please provide a direct link to a .sol file!',
    };
  }

  try {
    const rawUrl = convertToRawUrl(githubUrl);
    const contractName = extractContractName(githubUrl);

    const response = await fetch(rawUrl);

    if (!response.ok) {
      let errorMessage = `❌ Failed to fetch contract: ${response.statusText}`;

      if (response.status === 404) {
        errorMessage =
          '❌ Contract file not found. Make sure the link is correct and the file exists.';
      } else if (response.status === 403) {
        errorMessage = '❌ Access denied. The repository might be private.';
      }

      return {
        content: '',
        name: '',
        error: errorMessage,
      };
    }

    const content = await response.text();
    return {
      content,
      name: contractName,
    };
  } catch (err: any) {
    return {
      content: '',
      name: '',
      error: `❌ Failed to fetch contract: ${err.message}`,
    };
  }
};
