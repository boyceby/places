/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const webpack = require("webpack");
const dotenv = require("dotenv");

const { parsed: env } = dotenv.config();

module.exports = {
  images: {
    domains: ["maps.googleapis.com"],
  },
  webpack: (config) => {
    config.plugins.push(new webpack.EnvironmentPlugin(env));
    return config;
  },
};
