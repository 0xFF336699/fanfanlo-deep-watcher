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

### Watching Object Properties

```typescript
import { proxyWatch, useProxyWatch } from 'fanfanlo-deep-watcher';

// Create a watchable object
const state = proxyWatch({
  user: {
    name: 'John',
    age: 30,
    address: {
      city: 'New York',
      country: 'USA'
    }
  }
});

// Watch for property changes
state.user.$watch('name', (newValue, oldValue) => {
  console.log(`Name changed from ${oldValue} to ${newValue}`);
});

### Using with React

```typescript
// In your React component
function UserProfile() {
  const [user] = useProxyWatch(state, 'user');
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Age: {user.age}</p>
      <p>Location: {user.address.city}, {user.address.country}</p>
    </div>
  );
}
```

## Advanced Usage

### Watching Nested Properties

```typescript
// Watch nested property changes
state.user.$watch('address.city', (newCity, oldCity) => {
  console.log(`User moved from ${oldCity} to ${newCity}`);
});

// Later in your code
state.user.address.city = 'San Francisco'; // This will trigger the watcher
```

### React Hook Example

```typescript
import { useProxyWatch } from 'fanfanlo-deep-watcher';

function Counter() {
  const [count, setCount] = useProxyWatch(state, 'counter', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

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

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

## License

MIT
