# Deep Watcher

A utility library for deep watching objects and properties, with first-class React support.

## Features

- 🔍 Deep object property watching
- ⚡ React hooks integration
- 🚀 Lightweight and performant
- 🔄 Automatic dependency tracking
- 🛠️ TypeScript support

## Installation

Install with npm or yarn:

```bash
npm install fanfanlo-deep-watcher
# or
yarn add fanfanlo-deep-watcher
```

## Basic Usage

## API Reference

### `proxyWatch<T>(target: T): T`

Creates a proxy that enables deep watching on the target object.

### `useProxyWatch<T, K extends keyof T>(target: T, property: K, defaultValue?: T[K]): [T[K], (value: T[K]) => void]`

React hook to watch and update a property in a reactive object.

## TypeScript Support

The library includes TypeScript type definitions, providing full type checking and autocompletion in your IDE.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Examples

Check out the complete examples in the `examples/react-ts` directory.

see [https://fanfanlo-deep-watcher.cloudflare.shangwoa.top/](https://fanfanlo-deep-watcher.cloudflare.shangwoa.top/)

## License

MIT
