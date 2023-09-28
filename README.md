# ArianeeSdk

## Help

You can test the sdk with the arianee-sdk-example (apps/arianee-sdk-example).

You can launch the arianee-sdk-example with :

```bash
  npm run dev
```

it will automatically serve the project and build dependencies.

## Publish

Before publishing your changes of the arianee-sdk repository, please follow these steps to ensure version consistency across all packages.
This will make it easier to update an app using the arianee-sdk in order to add new features or fix bugs.

- Bump the version for all packages by running:

```bash
npm run bump:all
```

- Build all packages with:

```bash
npm run build:all
```

- Publish the changes with:

```bash
npm run publish:all
```
