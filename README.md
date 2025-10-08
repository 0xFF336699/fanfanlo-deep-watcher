# Deep Watcher

一个用于深度监听对象和属性的工具库，特别适用于 React 应用。

## 安装

使用 npm 或 yarn 安装：

```bash
npm install fanfanlo-deep-watcher
# 或者
yarn add fanfanlo-deep-watcher
```

## 使用方法

### 基本用法

```typescript
import { proxyWatch, useProxyWatch } from 'fanfanlo-deep-watcher';

// 创建一个可监听的对象
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

// 监听属性变化
state.user.$watch('name', (newValue, oldValue) => {
  console.log(`Name changed from ${oldValue} to ${newValue}`);
});

// 在 React 组件中使用
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

## API 文档

### `proxyWatch(target: T): T`

创建一个可监听的对象。

### `useProxyWatch(proxy: T, path: string): [T, () => void]`

React Hook，用于在组件中监听代理对象的变化。

### `useWatch(dispatcher, property, defaultValue?, updateName?): [value, unwatch]`

更底层的 React Hook，用于监听特定属性的变化。

## 示例

查看 `examples/react-ts` 目录中的完整示例。

## 开发

1. 克隆仓库
2. 安装依赖：`npm install`
3. 构建：`npm run build`
4. 运行测试：`npm test`

## 许可证

MIT