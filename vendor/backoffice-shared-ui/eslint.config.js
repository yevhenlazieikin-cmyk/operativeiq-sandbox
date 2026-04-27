// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['.angular/**', 'coverage/**', 'dist/**'],
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintConfigPrettier
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/contextual-lifecycle': 'warn',
      '@angular-eslint/directive-class-suffix': 'off',
      "@angular-eslint/directive-selector": [
        "warn",
        {
          type: "attribute",
          prefix: "bo",
          style: "camelCase",
        },
      ],
      '@angular-eslint/no-conflicting-lifecycle': 'warn',
      '@angular-eslint/no-input-prefix': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/use-component-view-encapsulation': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/prefer-standalone': 'off',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': [
        'error',
        {
          'default': 'array'
        }
      ],
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/dot-notation': 'warn',
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        {
          'accessibility': 'explicit',
          'overrides': {
            'constructors': 'no-public',
            'parameterProperties': 'explicit'
          }
        }
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/lines-between-class-members': 'off',// airbnb error
      '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-for-in-array': 'warn',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          'ignoreParameters': true
        }
      ],
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          "checksVoidReturn": false
        }
      ],
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          'path': 'always',
          'types': 'prefer-import',
          'lib': 'always'
        }
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'arrow-body-style': 'error',
      'arrow-parens': [
        'error',
        'as-needed'
      ],
      'brace-style': [
        'warn',
        '1tbs'
      ],
      'capitalized-comments': 'off',
      'class-methods-use-this': 'off',
      'comma-dangle': [
        'error',
        {
          'objects': 'never',
          'arrays': 'never',
          'functions': 'never',
          'exports': 'never'
        }
      ],
      'complexity': [
        'error',
        {
          'max': 20
        }
      ],
      'consistent-return': 'warn',// airbnb error
      'constructor-super': 'error',
      'curly': [
        'error',
        'multi-line'
      ],
      'default-case': 'warn',
      'eol-last': 'error',
      'eqeqeq': [
        'warn',
        'smart'
      ],
      'guard-for-in': 'error',
      'id-blacklist': [
        'error',
        'any',
        'Number',
        'number',
        'String',
        'string',
        'Boolean',
        'boolean',
        'Undefined',
        'undefined'
      ],
      'id-match': 'error',
      'import/namespace': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'off',// airbnb error
      'import/no-unresolved': 'off',
      'import/order': 'off',
      'jsdoc/check-indentation': 'off',
      'linebreak-style': [
        'error',
        'windows'
      ],
      'max-classes-per-file': 'off',
      'max-len': [
        'warn',
        {
          'code': 140
        }
      ],
      'max-lines': [
        'warn',
        1000
      ],
      'new-parens': 'error',
      'no-array-constructor': 'off',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-case-declarations': 'warn',// airbnb error
      'no-cond-assign': 'error',
      'no-console': [
        'error',
        {
          'allow': [
            'log',
            'dirxml',
            'warn',
            'error',
            'dir',
            'timeLog',
            'assert',
            'clear',
            'count',
            'countReset',
            'group',
            'groupCollapsed',
            'groupEnd',
            'table',
            'Console',
            'markTimeline',
            'profile',
            'profileEnd',
            'timeline',
            'timelineEnd',
            'timeStamp',
            'context'
          ]
        }
      ],
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
      'no-duplicate-imports': 'error',
      'no-else-return': 'off',// airbnb error
      'no-empty': 'off',
      'no-empty-function': 'off',
      'no-eval': 'warn',
      'no-fallthrough': 'error',
      'no-invalid-this': 'warn',
      'no-lonely-if': 'off',// airbnb error
      'no-multiple-empty-lines': [
        'error',
        {
          'max': 1
        }
      ],
      'no-new-wrappers': 'error',
      'no-param-reassign': 'warn',// airbnb error
      'no-plusplus': 'off',// airbnb error
      'no-redeclare': 'error',
      'no-restricted-imports': [
        'error',
        'rxjs/Rx'
      ],
      'no-return-assign': 'warn',// airbnb error
      'no-return-await': 'warn',
      'no-shadow': 'off',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'warn',
      'no-trailing-spaces': 'error',
      'no-undef-init': 'error',
      'no-underscore-dangle': 'off',
      'no-unsafe-finally': 'error',
      'no-unused-labels': 'error',
      'no-unused-vars': 'off',
      'no-var': 'error',
      'object-shorthand': 'error',
      'one-var': [
        'error',
        'never'
      ],
      'padding-line-between-statements': [
        'error',
        {
          'blankLine': 'always',
          'prev': '*',
          'next': 'return'
        }
      ],
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
      'prefer-template': 'error',
      'quote-props': [
        'error',
        'as-needed'
      ],
      'radix': 'error',
      'require-await': 'off',
      'sort-imports': 'off',
      'space-before-function-paren': [
        'error',
        {
          'anonymous': 'always',
          'asyncArrow': 'always',
          'named': 'never'
        }
      ],
      'space-in-parens': [
        'error',
        'never'
      ],
      'spaced-comment': 'off',
      'unicorn/filename-case': 'off',
      'use-isnan': 'error',
      'valid-typeof': 'off',
      'yoda': 'error',
      'prefer-destructuring': ['warn', {
        'array': true,
        'object': true
      }, {
        "enforceForRenamedProperties": false
      }],
      'no-restricted-syntax': 'off',
      'no-nested-ternary': 'warn',
      'no-multi-assign': 'warn',
      'array-callback-return': 'warn',
      'no-continue': 'warn',
      'prefer-promise-reject-errors': 'warn',
      'no-control-regex': 'warn',
      'import/export': 'off'
    }
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      /** TODO made warning for click // ...angular.configs.templateAccessibility, */
    ],
    rules: {
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/eqeqeq': 'off',
      'max-len': [
        'warn',
        {
          'code': 140
        }
      ],
      'linebreak-style': [
        'error',
        'windows'
      ]
    }
  }
);
