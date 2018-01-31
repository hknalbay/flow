/*
 * @flow
 * @lint-ignore-every LINEWRAP1
 */


import {suite, test} from '../../packages/flow-dev-tools/src/test/Tester';

export default suite(({addFile, addFiles, addCode}) => [
  test('Unaliased type import', [
    addFile('esmodule.js')
      .addCode('import {type T, C} from "./esmodule";')
      .addCode('new C();')
      .addCode('(42: T);')
        .noNewErrors(),

    addCode('("str": T);')
      .newErrors(
        `
          test.js:9
            9: ("str": T);
                ^^^^^ Cannot cast string to \`T\` because string [1] is incompatible with number [2].
            References:
              9: ("str": T);
                  ^^^^^ [1]: string
              9: ("str": T);
                         ^ [2]: number
        `,
      ),
  ]),

  test('Aliased type import', [
    addFile('esmodule.js')
      .addCode('import {type T as U, C} from "./esmodule";')
      .addCode('new C();')
      .addCode('(42: U);')
        .noNewErrors(),

    addCode('("str": U);')
      .newErrors(
        `
          test.js:9
            9: ("str": U);
                ^^^^^ Cannot cast string to \`U\` because string [1] is incompatible with number [2].
            References:
              9: ("str": U);
                  ^^^^^ [1]: string
              9: ("str": U);
                         ^ [2]: number
        `,
      ),
  ]),

  test('Unaliased typeof import', [
    addFile('esmodule.js')
      .addCode('import {typeof C, C as CImpl} from "./esmodule";')
      .addCode('new CImpl();')
      .addCode('(CImpl: C);')
        .noNewErrors(),

    addCode('("str": C);')
      .newErrors(
        `
          test.js:9
            9: ("str": C);
                ^^^^^ Cannot cast string to \`C\` because string [1] is incompatible with statics of \`C\` [2].
            References:
              9: ("str": C);
                  ^^^^^ [1]: string
              9: ("str": C);
                         ^ [2]: statics of \`C\`
        `,
      ),
  ]),

  test('Aliased type import', [
    addFile('esmodule.js')
      .addCode('import {typeof C as CPrime, C as CImpl} from "./esmodule";')
      .addCode('new CImpl();')
      .addCode('(CImpl: CPrime);')
        .noNewErrors(),

    addCode('("str": CPrime);')
      .newErrors(
        `
          test.js:9
            9: ("str": CPrime);
                ^^^^^ Cannot cast string to \`CPrime\` because string [1] is incompatible with statics of \`C\` [2].
            References:
              9: ("str": CPrime);
                  ^^^^^ [1]: string
              9: ("str": CPrime);
                         ^^^^^^ [2]: statics of \`C\`
        `,
      ),
  ]),
]);
