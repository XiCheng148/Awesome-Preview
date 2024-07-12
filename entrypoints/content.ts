// import openPopup from './openPopup'

import onBeforeJump from './utils/onBeforeJump'
export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    onBeforeJump();
  },
});
