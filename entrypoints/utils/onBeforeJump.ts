import openPopup from './openPopup';

// 辅助函数：查找最近的祖先 <a> 标签
function findClosestAnchor(element: any) {
    while (element && element !== document) {
        if (element.tagName === 'A') {
            return element;
        }
        element = element.parentElement;
    }
    return null;
}

function shouldOpenPopup(isEnable: boolean, url?: string, cb?: Function) {
    if (isEnable) {
        return url && openPopup(url);
    } else {
        return cb && cb();
    }
}

export default function onBeforeJump() {
    let isEnable = false;
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Shift') {
            if (!isEnable) {
                isEnable = true
            }
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            if (isEnable) {
                isEnable = false
            };
        }
    });
    // 拦截所有点击事件
    document.addEventListener('click', function (event) {
        const anchor = findClosestAnchor(event.target);
        if (anchor) {
            event.preventDefault();
            const url = anchor.href;
            console.log('拦截 <a> 标签点击:', url);
            // 在这里处理你想要的逻辑
            shouldOpenPopup(isEnable, url, () => {
                window.location.href = url;
            });
        }
    });

    // 拦截 window.location.assign 和 window.location.replace
    // const originalAssign = window.location.assign;
    // window.location.assign = function (url) {
    //     console.log('拦截 window.location.assign:', url);
    //     // 在这里处理你想要的逻辑
    //     // originalAssign.call(window.location, url); // 如果需要继续跳转，取消注释
    //     return shouldOpenPopup(isEnable, url, () => {
    //         originalAssign.call(window.location, url);
    //     });
    // };

    // const originalReplace = window.location.replace;
    // window.location.replace = function (url) {
    //     console.log('拦截 window.location.replace:', url);
    //     // 在这里处理你想要的逻辑
    //     return shouldOpenPopup(isEnable, url, () => {
    //         originalReplace.call(window.location, url);
    //     })
    // };

    // 拦截 window.open
    const originalWindowOpen = window.open;
    window.open = function (url, name, specs) {
        console.log('拦截 window.open:', url);
        // 在这里处理你想要的逻辑
        return shouldOpenPopup(isEnable, url, () => {
            originalWindowOpen.apply(this, arguments);
        });
    };

    // 拦截 history API
    const originalPushState = history.pushState;
    history.pushState = function (state, title, url) {
        console.log('拦截 history.pushState:', url);
        // 在这里处理你想要的逻辑
        return shouldOpenPopup(isEnable, url, () => {
            originalPushState.apply(this, arguments);
        })
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (state, title, url) {
        console.log('拦截 history.replaceState:', url);
        // 在这里处理你想要的逻辑
        return shouldOpenPopup(isEnable, url, () => {
            originalReplaceState.apply(this, arguments);
        })
    };

    // 拦截表单提交
    document.addEventListener('submit', function (event) {
        event.preventDefault();
        const form = event.target;
        const action = form.action;
        console.log('拦截表单提交:', action);
        // 在这里处理你想要的逻辑
        shouldOpenPopup(isEnable, action, () => {
            form.submit();
        })
    });

    // 监听 popstate 事件
    window.addEventListener('popstate', function (event) {
        console.log('拦截 popstate 事件:', window.location.href);
        // 在这里处理你想要的逻辑
        shouldOpenPopup(isEnable, window.location.href, () => {
            window.open(window.location.href);
        });
    });
}
