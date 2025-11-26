export interface CommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

// Browser-safe mock of command execution. Replace with real API calls when wiring backend.
export const safeSpawn = async (cmd: string, args: string[]): Promise<CommandResult> => {
  const rendered = `${cmd} ${args.join(' ')}`.trim();
  return { ok: true, stdout: `[mock] ${rendered}`, stderr: '' };
};

export const pipelineExamples = {
  doppler: () => safeSpawn('doppler', ['run', '--project', 'local-mac-work', '--config', 'dev_personal', '--', 'echo', 'pipeline']),
  makePipeline: () => safeSpawn('make', ['pipeline']),
  pythonScript: (path: string) => safeSpawn('python3', [path, '--dry-run']),
};
