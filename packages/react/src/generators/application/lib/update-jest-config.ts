import { updateBabelJestConfig } from '../../../rules/update-babel-jest-config';
import { updateJestConfigContent } from '../../../utils/jest-utils';
import { NormalizedSchema } from '../schema';
import { offsetFromRoot, Tree, updateJson } from '@nrwl/devkit';

export function updateJestConfig(host: Tree, options: NormalizedSchema) {
  if (options.unitTestRunner !== 'jest') {
    return;
  }

  updateJson(host, `${options.appProjectRoot}/tsconfig.spec.json`, (json) => {
    const offset = offsetFromRoot(options.appProjectRoot);
    json.files = [
      `${offset}node_modules/@nrwl/react/typings/cssmodule.d.ts`,
      `${offset}node_modules/@nrwl/react/typings/image.d.ts`,
    ];
    if (options.style === 'styled-jsx') {
      json.files.unshift(
        `${offset}node_modules/@nrwl/react/typings/styled-jsx.d.ts`
      );
    }
    return json;
  });

  const configPath = `${options.appProjectRoot}/jest.config.js`;
  const originalContent = host.read(configPath).toString();
  const content = updateJestConfigContent(originalContent);
  host.write(configPath, content);

  updateBabelJestConfig(host, options.appProjectRoot, (json) => {
    if (options.style === 'styled-jsx') {
      json.plugins = (json.plugins || []).concat('styled-jsx/babel');
    }
    return json;
  });
}