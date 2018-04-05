'use strict';

const buildJsonResults = require('../utils/buildJsonResults');
const constants = require('../constants/index');

describe('buildJsonResults', () => {
  it('should contain number of tests in testSuite', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[1].testsuite[0]._attr.tests).toBe(1);

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should contain number of tests in testSuites', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[0]._attr.tests).toBe(1);

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper name from ancestorTitles when usePathForSuiteName is "false"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '', constants.DEFAULT_OPTIONS);

    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('foo');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filename when suiteNameTemplate is "{filename}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS, { suiteNameTemplate: "{filename}" }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('foo.test.js');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filename when classNameTemplate is "{filename}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS, { classNameTemplate: "{filename}" }));
    expect(jsonResults.testsuites[1].testsuite[1].testcase[0]._attr.classname).toBe('foo.test.js');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filepath when titleTemplate is "{filepath}"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS, { titleTemplate: "{filepath}" }));
    expect(jsonResults.testsuites[1].testsuite[1].testcase[0]._attr.name).toBe('/path/to/test/__tests__/foo.test.js');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper filepath when suiteNameTemplate is "{filepath}" and usePathForSuiteName is "false"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS, { suiteNameTemplate: "{filepath}" }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('/path/to/test/__tests__/foo.test.js');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper name from ancestorTitles when suiteNameTemplate is set to "{title}" and usePathForSuiteName is "true"', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS, { usePathForSuiteName: "true" }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('/path/to/test/__tests__/foo.test.js');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper name from testFilePath when usePathForSuiteName is "true"; no appDirectory set', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS, { usePathForSuiteName: "true" }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('/path/to/test/__tests__/foo.test.js');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper name from testFilePath when usePathForSuiteName is "true"; with appDirectory set', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '/path/to/test',
      Object.assign({}, constants.DEFAULT_OPTIONS, { usePathForSuiteName: "true" }));
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('/__tests__/foo.test.js');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper classname when ancestorSeparator is default', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS));
    expect(jsonResults.testsuites[1].testsuite[1].testcase[0]._attr.classname).toBe('foo baz should bar');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should return the proper classname when ancestorSeparator is customized', () => {
    const noFailingTestsReport = require('../__mocks__/no-failing-tests.json');
    const jsonResults = buildJsonResults(noFailingTestsReport, '',
      Object.assign({}, constants.DEFAULT_OPTIONS, { ancestorSeparator: " › " }));
    expect(jsonResults.testsuites[1].testsuite[1].testcase[0]._attr.classname).toBe('foo › baz should bar');

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should parse failure messages for failing tests', () => {
    const failingTestsReport = require('../__mocks__/failing-tests.json');
    const jsonResults = buildJsonResults(failingTestsReport, '/path/to/test', constants.DEFAULT_OPTIONS);

    const failureMsg = jsonResults.testsuites[1].testsuite[1].testcase[1].failure;

    // Make sure no escape codes are there that exist in the mock
    expect(failureMsg.includes('\u001b')).toBe(false);

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should support displayName template var for jest multi-project', () => {
    const multiProjectNoFailingTestsReport = require('../__mocks__/multi-project-no-failing-tests.json');

    const jsonResults = buildJsonResults(multiProjectNoFailingTestsReport, '',
    Object.assign({}, constants.DEFAULT_OPTIONS, {
      suiteNameTemplate: "{displayName}-foo",
      titleTemplate: "{displayName}-foo"
    }));

    expect(jsonResults).toMatchSnapshot();

    expect(jsonResults).toConvertToXmlAndPassXsd();
  });

  it('should output a failed suite', () => {
    const failingTestsReport = require('../__mocks__/failing-suite.json');
    const jsonResults = buildJsonResults(failingTestsReport, '/path/to/test', constants.DEFAULT_OPTIONS);

    expect(jsonResults).toConvertToXmlAndPassXsd();

    expect(jsonResults.testsuites[1].testsuite[0]._attr.errors).toBe(1);

    const failureMsg = jsonResults.testsuites[1].testsuite[1]['system-err'];
    // Make sure no escape codes are there that exist in the mock
    expect(failureMsg.includes('\u001b')).toBe(false);
    expect(failureMsg).toBe("Test suite failed to run\n\nCannot find module './math' from 'failure.js");
  });
});
