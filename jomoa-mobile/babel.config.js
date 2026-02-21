module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./src",
            "@/ui": "./src/shared/ui",
            "@/theme": "./src/shared/theme",
            "@/types": "./src/shared/types",
            "@/config": "./src/config",
            "@/features": "./src/features",
            "@/navigation": "./src/navigation",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};

