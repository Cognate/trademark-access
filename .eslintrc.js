module.exports = {
  extends: [
    'plugin:prettier/recommended',  // displays prettier errors as ESLint errors
  ],
  parserOptions: {
    ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
  },
};
