module.exports = {
    root: true,

    env: {
        node: true
    },

    rules: {
        'no-console': 'off',
        props: false,
        'no-debugger': 'off',
        indent: ['error', 4],
        'comma-dangle': ['error', 'never'],
        props: false
    },
    extends: ['plugin:vue/essential', '@vue/standard']
};
