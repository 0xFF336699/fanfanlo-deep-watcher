import { proxyWatch } from '../../dist/watcher/index.js';

// Helper function to log messages
function logToElement(elementId, ...args) {
    const logElement = document.getElementById(elementId);
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toISOString()}] ${message}`;
    logElement.prepend(logEntry);
}

// 1. Basic Object Property Watch
const user = {
    id: 1,
    name: 'John Doe',
    details: {
        email: 'john@example.com',
        address: {
            city: 'New York',
            country: 'USA'
        }
    }
};

const { proxy: userProxy, unwatch: unwatchUser } = proxyWatch(
    user,
    'details.address.city',
    (newVal, oldVal) => {
        logToElement('basicLog', `City changed from "${oldVal}" to "${newVal}"`);
    }
);

// 2. Array Operations Watch
const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
];

const { proxy: itemsProxy, unwatch: unwatchItems } = proxyWatch(
    items,
    'length',
    (newLength, oldLength) => {
        logToElement('arrayLog', `Array length changed from ${oldLength} to ${newLength}`);
    }
);

// Watch specific array index
proxyWatch(
    items,
    '1.name',
    (newVal, oldVal) => {
        logToElement('arrayLog', `Item at index 1 name changed from "${oldVal}" to "${newVal}"`);
    }
);

// 3. Undefined Property Watch
const config = {
    theme: 'light',
    // settings will be added later
};

const { proxy: configProxy, unwatch: unwatchConfig } = proxyWatch(
    config,
    'settings.notifications.enabled',
    (newVal) => {
        logToElement('undefinedLog', `Notifications enabled: ${newVal}`);
    },
    (info) => {
        logToElement('undefinedLog', `Property "${info.prop}" is undefined. Full path: ${info.propertyChain}`);
    }
);

// Set up event listeners
document.getElementById('updateName').addEventListener('click', () => {
    userProxy.details.address.city = 'Los Angeles';
});

document.getElementById('updateNested').addEventListener('click', () => {
    // This will trigger the watcher because we're modifying a nested property
    userProxy.details = {
        ...userProxy.details,
        address: {
            ...userProxy.details.address,
            city: 'Chicago'
        }
    };
});

document.getElementById('pushItem').addEventListener('click', () => {
    const newId = itemsProxy.length + 1;
    itemsProxy.push({ id: newId, name: `Item ${newId}` });
});

document.getElementById('popItem').addEventListener('click', () => {
    itemsProxy.pop();
});

document.getElementById('updateArrayItem').addEventListener('click', () => {
    if (itemsProxy.length > 0) {
        itemsProxy[0].name = `Updated at ${new Date().toLocaleTimeString()}`;
    }
});

document.getElementById('addUndefined').addEventListener('click', () => {
    // This will trigger the onUndefined handler first, then the onUpdate handler
    configProxy.settings = {
        notifications: {
            enabled: true
        }
    };
});

// Initial logs
logToElement('basicLog', 'Watching user.details.address.city');
logToElement('arrayLog', 'Watching array operations');
logToElement('undefinedLog', 'Watching undefined property: settings.notifications.enabled');
