fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios pods

```sh
[bundle exec] fastlane ios pods
```

Install CocoaPods

### ios build

```sh
[bundle exec] fastlane ios build
```

Build App Store IPA

### ios upload

```sh
[bundle exec] fastlane ios upload
```

Upload latest IPA to App Store Connect (TestFlight)

### ios release

```sh
[bundle exec] fastlane ios release
```

Build then upload

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
