/* eslint-disable global-require */
jest.mock('cross-spawn');
jest.mock('jest');

const cases = require('jest-in-case');

const testCases = [
  {
    name: 'calls flow CLI with default args'
  },
  {
    name: '--no-color will disable colored output',
    args: ['--no-color']
  },
  {
    name: 'does not use built-in config with .flowconfig file',
    fileExists: filename => filename === '.flowconfig'
  }
];

const testFn = ({ fileExists = () => false, args = [] }) => {
  const { sync: crossSpawnSyncMock } = require('cross-spawn');
  const originalExit = process.exit;
  const originalArgv = process.argv;
  process.exit = jest.fn();

  Object.assign(require('../../utils/fileExists'), { fileExists });
  Object.assign(require('../../utils/resolveBin'), {
    resolveBin: (modName, { executable = modName } = {}) => executable
  });

  process.exit = jest.fn();

  try {
    // tests
    process.argv = ['node', '../flow', ...args];
    crossSpawnSyncMock.mockClear();

    require('../flow');

    expect(crossSpawnSyncMock).toHaveBeenCalledTimes(1);
    const [firstCall] = crossSpawnSyncMock.mock.calls;
    const [script, calledArgs] = firstCall;
    expect([script, ...calledArgs].join(' ')).toMatchSnapshot();
  } catch (error) {
    throw error;
  } finally {
    // afterEach
    process.exit = originalExit;
    process.argv = originalArgv;
    jest.resetModules();
  }
};

cases('flow', testFn, testCases);
