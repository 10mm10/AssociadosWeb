module.exports = {
  expo: {
    name: "Interagir",
    slug: "mobile-app",
    version: "1.0.5",
    scheme: "associadosweb",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    entryPoint: "expo-router/entry",

    splash: {
      image: "./assets/images/Interagir.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.seuprojeto.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      package: "com.seuprojeto.app",
      googleServicesFile: "./config/google-services.json",

      // 🔥 ESSENCIAL para HTTP funcionar no Android
      usesCleartextTraffic: true,

      adaptiveIcon: {
        foregroundImage: "./assets/images/InteragirLogo.png",
        backgroundColor: "#ffffff",
      },
    },

    web: {
      favicon: "./assets/images/favicon.png",
    },

    /**
     * ⚠️ NÃO defina BACKEND_URL aqui
     * Ele vem SOMENTE do eas.json
     */
    extra: {
      BACKEND_URL: process.env.BACKEND_URL,
      eas: {
        projectId: "489bc3db-f012-416f-aeca-c6397c480bc4",
      },
    },


    plugins: [
      "expo-notifications",
      "expo-web-browser",
      "expo-secure-store",
      "expo-router",
    ],
  },
};
