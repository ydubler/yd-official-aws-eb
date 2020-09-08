module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          edge: "17",
          firefox: "60",
          chrome: "67",
          safari: "11.1",
        },
        useBuiltIns: "usage",
        corejs: "3.6.4",
      },
    ],
  ];
  // const plugins = ["@babel/plugin-transform-async-to-generator"];

  const overrides = [
    {
      compact: true,
    },
  ];

  return {
    presets,
    //overrides,
    // plugins
  };
};
