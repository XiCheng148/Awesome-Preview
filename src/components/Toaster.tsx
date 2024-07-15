import { useToaster } from 'react-hot-toast/headless';
import cx from 'classnames';

export default function Toaster() {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, calculateOffset, updateHeight } = handlers;

  return (
    <div
      onMouseEnter={startPause}
      onMouseLeave={endPause}
      className="pointer-events-none fixed inset-2 z-[2147483647]"
    >
      {toasts.map((toast) => {
        const offset = calculateOffset(toast, {
          reverseOrder: false,
          gutter: 8,
        });

        const ref = (el: HTMLDivElement | null) => {
          if (el && typeof toast.height !== 'number') {
            const height = el.getBoundingClientRect().height;
            updateHeight(toast.id, height);
          }
        };

        return (
          <div
            key={toast.id}
            ref={ref}
            {...toast.ariaProps}
            style={{
              transform: `translate(-50%, ${offset}px)`,
            }}
            className={cx(
              'absolute left-1/2 flex w-48 items-center justify-center rounded-lg bg-zinc-50 py-1.5 shadow transition duration-300 dark:bg-zinc-900 dark:text-zinc-100',
              {
                'opacity-100': toast.visible,
                'opacity-0': !toast.visible,
              }
            )}
          >
            <div>{toast.icon}</div>
            <div className="px-4 text-base">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
}
