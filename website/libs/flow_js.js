/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

declare type FlowJsErrorMessage = {
  loc: {
    source: string,
    start: {line: number, column: number},
    end: {line: number, column: number},
  },
  context: string,
  type: string,
  descr: string,
};

declare type FlowJsErrorMessageInformation = {
  message: $ReadOnlyArray<FlowJsErrorMessage>,
  children: $ReadOnlyArray<FlowJsErrorMessageInformation>,
};

declare type FlowJsError = {
  level: string,
  message: $ReadOnlyArray<FlowJsErrorMessage>,
  extra: $ReadOnlyArray<FlowJsErrorMessageInformation>,
};

declare type FlowJsParseOptions = {
  esproposal_class_instance_fields: boolean,
  esproposal_class_static_fields: boolean,
  esproposal_decorators: boolean,
  esproposal_export_star_as: boolean,
  esproposal_optional_chaining: boolean,
  esproposal_nullish_coalescing: boolean,
  enums?: boolean,
  types?: boolean,
};

declare type FlowJsConfigSchema = Array<
  | {
      key: string,
      type: 'enum',
      choices: Array<string>,
      default: string,
    }
  | {key: string, type: 'bool', default: boolean},
>;

declare type FlowJs = {
  flowVersion: string,
  configSchema?: string,
  checkContent(
    filename: string,
    body: string,
    options: {[string]: mixed},
  ): $ReadOnlyArray<FlowJsError>,
  typeAtPos(
    filename: string,
    body: string,
    line: number,
    col: number,
    options: {[string]: mixed},
  ): string,
  parse(body: string, options: FlowJsParseOptions): interface {},
};
