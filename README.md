# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Local backend on Wi-Fi

Run `npm run start:local` to detect your computer's LAN IPv4 address, write
`EXPO_PUBLIC_API_URL=http://<address>:4000` to `.env.local`, and start Expo.
Other environment variables and `.env` are preserved. `.env.local` is already
Git-ignored and overrides the same variable in `.env` for other Expo commands too.

The script checks for address changes every five seconds while Expo runs. When
the URL changes, reload the app; you may also need to reconnect to Expo on the
new network. Your phone and backend computer must be on the same reachable
network, with the backend listening on port 4000.

Expo options can be forwarded with `npm run start:local -- --ios` (or `--android`
or `--web`). To update the file without starting Expo, use
`npm run start:local -- --update-only`. If detection is ambiguous or a VPN uses
the default route, select the LAN interface explicitly, for example
`TEMPO_LOCAL_INTERFACE=en0 npm run start:local` on macOS.

Use this command only for local development. To use your Render backend, set
`EXPO_PUBLIC_API_URL=https://your-backend.onrender.com` in `.env` and run
`npm run start:hosted`. This command uses the API URL from `.env` even when
`.env.local` contains a local URL, without changing either file. Other local
environment settings still load normally. Both commands accept Expo's cache
clear flag: `npm run start:local -- -c` or `npm run start:hosted -- -c`.
Stop the running Expo server before switching modes. These commands select the
backend for development sessions; production builds need their own API configuration.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
