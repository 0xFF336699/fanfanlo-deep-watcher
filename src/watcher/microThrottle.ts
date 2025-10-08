// 微任务节流
//需求的使用场景是对象有多个属性会被变更，希望的是在当前任务结束前派发一次这个对象更新的事件。
//用promise来储存一个对象变更了，在任务结束前派发该对象变更的事件，因为派发事件后可能再次触发该对象的属性变更，所以我们需要检测该对象是否已经在当前任务派发过事件了，如果派发过了就不再派发该对象的变更事件了。
//现在有个想法是每次向微任务添加事件时储存这个update函数的引用，用来检测如果update时再次触发对象属性变更，导致微任务试图再次调用该update时跳过该update。但是遇到的问题时怎么清理这个微任务的列表？
// 这个功能当前遇到的问题是解决不了所有事件派发完毕后清理储存派发事件列表的问题。

type UpdateFunction = () => void;

let pendingUpdates: Set<UpdateFunction> = new Set();
let isThrottled = false;

function microThrottle(update: UpdateFunction) {
    // 如果当前已经在节流中，直接返回
    if (isThrottled) {
        pendingUpdates.add(update);
        return;
    }

    // 设置节流状态
    isThrottled = true;

    // 使用 Promise 来处理微任务
    Promise.resolve().then(() => {
        // 执行所有待处理的更新
        pendingUpdates.forEach(fn => fn());
        pendingUpdates.clear(); // 清空待处理的更新
        isThrottled = false; // 重置节流状态
    });

    // 执行当前的更新
    update();
}

// 导出微任务节流函数
export { microThrottle };

