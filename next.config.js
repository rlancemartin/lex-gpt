/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

/*
// 1/ Returns - Module build failed: UnhandledSchemeError: Reading from "node:fs/promises" is not handled by plugins (Unhandled scheme).
// Import trace for requested module:
// node:fs/promises
// ./node_modules/langchain/dist/vectorstores/hnswlib.js
// ./node_modules/langchain/dist/vectorstores/index.js
// ./node_modules/langchain/vectorstores.js
const nodeExternals = require('webpack-node-externals');
module.exports = {
  //...
  externals: [nodeExternals({
    exclude: ['fs'],
    debug: true
  })]
};
*/

/*
// 2/ Same error as above 
module.exports = {
  externals: [
    /node:fs\/promises/,
  ],
};
*/

/*
// 3/ Can't find API error
error - PageNotFoundError: Cannot find module for page: /api/search
    at DevServer.getEdgeFunctionInfo (/Users/31treehaus/Desktop/AI/lex-gpt/node_modules/next/dist/server/next-server.js:1075:23)
    at DevServer.runEdgeFunction (/Users/31treehaus/Desktop/AI/lex-gpt/node_modules/next/dist/server/next-server.js:1410:25)
    at async Object.fn (/Users/31treehaus/Desktop/AI/lex-gpt/node_modules/next/dist/server/next-server.js:794:59)
    at async Router.execute (/Users/31treehaus/Desktop/AI/lex-gpt/node_modules/next/dist/server/router.js:243:32)
    at async DevServer.runImpl (/Users/31treehaus/Desktop/AI/lex-gpt/node_modules/next/dist/server/base-server.js:432:29)
    at async DevServer.run (/Users/31treehaus/Desktop/AI/lex-gpt/node_modules/next/dist/server/dev/next-dev-server.js:814:20)
    at async DevServer.handleRequestImpl (/Users/31treehaus/Desktop/AI/lex-gpt/node_modules/next/dist/server/base-server.js:375:20)
    at async /Users/31treehaus/Desktop/AI/lex-gpt/node_modules/next/dist/server/base-server.js:157:99 {
  code: 'ENOENT'

module.exports = {
  externals: [
    /node:fs\/promises/,
    /^\.\/node_modules\/langchain\/dist\/vectorstores\/hnswlib\.js$/,
    /^\.\/node_modules\/langchain\/dist\/vectorstores\/index\.js$/,
    /^\.\/node_modules\/langchain\/vectorstores\.js$/,
  ],
};
*/

module.exports = nextConfig;
