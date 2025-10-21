module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^axios$': 'axios/dist/node/axios.cjs'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-chrono|react-wordcloud|d3-.*)/)'
  ],
  testTimeout: 10000,
  testPathIgnorePatterns: [
    '/node_modules/'
  ]
};
