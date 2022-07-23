/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["maps.googleapis.com"],
  },
};

// DEV CONFIGURATION:
// const webpack = require("webpack");
// const dotenv = require("dotenv");

// const { parsed: env } = dotenv.config();

// module.exports = {
//   reactStrictMode: true,
//   images: {
//     domains: ["maps.googleapis.com"],
//   },
//   webpack: (config) => {
//     config.plugins.push(new webpack.EnvironmentPlugin(env));
//     return config;
//   },
// };
