declare module 'inquirer' {
  interface PromptQuestion {
    type?: string;
    name: string;
    message?: string;
    default?: unknown;
    choices?: unknown[];
  }
  interface Inquirer {
    prompt(questions: PromptQuestion[]): Promise<Record<string, string>>;
  }
  const inquirer: Inquirer;
  export default inquirer;
}
