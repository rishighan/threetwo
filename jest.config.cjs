module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.cjs',
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    // constants/endpoints.ts uses Vite's `import.meta.env`, which TypeScript
    // refuses to parse when compiling to CommonJS (what ts-jest needs for Jest
    // to require() the output). Babel doesn't have that restriction, so this
    // one file is transformed with babel + a plugin that rewrites
    // `import.meta.env.X` to `process.env.X`, ahead of the general ts-jest rule.
    'src/client/constants/endpoints\\.ts$': ['babel-jest', {
      presets: [
        '@babel/preset-typescript',
        ['@babel/preset-env', { targets: { node: 'current' } }],
      ],
      plugins: ['babel-plugin-transform-vite-meta-env'],
    }],
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        ignoreDeprecations: '6.0',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
};
