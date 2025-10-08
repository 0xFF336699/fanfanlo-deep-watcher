import { proxyWatch, toProxy } from '../src';

// 定义类型
interface User {
  name: string;
  age?: number;
  address?: {
    city: string;
    street?: string;
  };
  tags?: string[];
}

// 1. 基本使用示例
function basicExample() {
  console.log('=== 基本使用示例 ===');
  const user: User = { 
    name: 'John',
    address: {
      city: 'New York'
    },
    tags: ['developer', 'designer']
  };

  // 监听 name 属性
  const { proxy: userProxy, unwatch } = proxyWatch(
    user,
    'name',
    (newValue, oldValue) => {
      console.log(`name 从 "${oldValue}" 变为 "${newValue}"`);
    }
  );

  // 修改被监听的属性
  userProxy.name = 'Alice'; // 会触发回调
  userProxy.name = 'Bob';   // 会再次触发回调

  // 取消监听
  unwatch();
  userProxy.name = 'Charlie'; // 不会触发回调，因为已经取消监听
}

// 2. 监听嵌套属性
function nestedPropertyExample() {
  console.log('\n=== 监听嵌套属性示例 ===');
  const user: User = { 
    name: 'John',
    address: {
      city: 'New York',
      street: '5th Avenue'
    }
  };

  // 监听嵌套属性
  proxyWatch(
    user,
    'address.city',
    (newValue, oldValue) => {
      console.log(`城市从 "${oldValue}" 变为 "${newValue}"`);
    }
  );

  // 修改嵌套属性
  user.address.city = 'San Francisco'; // 会触发回调
  user.address.street = 'Market St';   // 不会触发回调，因为只监听了 city
}

// 3. 处理未定义的属性
function undefinedPropertyExample() {
  console.log('\n=== 处理未定义属性示例 ===');
  const user: User = { name: 'John' };

  // 监听一个可能不存在的属性
  proxyWatch(
    user,
    'age',
    (newValue, oldValue) => {
      console.log(`年龄从 ${oldValue} 变为 ${newValue}`);
    },
    (info) => {
      console.log(`属性 ${info.path} 未定义`);
    }
  );

  // 设置一个之前不存在的属性
  user.age = 30; // 会触发回调
}

// 4. 数组操作
function arrayExample() {
  console.log('\n=== 数组操作示例 ===');
  const user: User = { 
    name: 'John',
    tags: ['developer']
  };

  // 监听数组元素
  const { proxy } = proxyWatch(
    user,
    'tags.1',
    (newValue, oldValue) => {
      console.log(`tags[1] 从 "${oldValue}" 变为 "${newValue}"`);
    }
  );

  // 修改数组
  if (proxy.tags) {
    proxy.tags.push('designer'); // 添加元素，不会触发回调，因为索引1之前不存在
    proxy.tags[1] = 'manager';   // 修改元素，会触发回调
    proxy.tags[0] = 'senior';    // 不会触发回调，因为监听的是索引1
  }
}

// 5. 使用 toProxy 创建可监听对象
function toProxyExample() {
  console.log('\n=== 使用 toProxy 示例 ===');
  // 使用 toProxy 创建可监听对象
  const user = toProxy<User>({
    name: 'John',
    address: {
      city: 'New York'
    }
  });

  // 监听属性
  proxyWatch(
    user,
    'address.city',
    (newValue, oldValue) => {
      console.log(`城市从 "${oldValue}" 变为 "${newValue}"`);
    }
  );

  // 修改嵌套属性
  user.address.city = 'San Francisco'; // 会触发回调
}

// 运行所有示例
function runAllExamples() {
  basicExample();
  nestedPropertyExample();
  undefinedPropertyExample();
  arrayExample();
  toProxyExample();
}

// 执行示例
runAllExamples();
