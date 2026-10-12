(function() {
  'use strict';

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var tenantId = currentScript ? (currentScript.getAttribute('data-tenant') || 'baghdad-lab') : 'baghdad-lab';
  var scriptSrc = currentScript ? currentScript.src : window.location.origin;
  var baseUrl = scriptSrc.indexOf('http') === 0 ? scriptSrc.split('/').slice(0, 3).join('/') : window.location.origin;
  var chatUrl = baseUrl + '/chat?tenant=' + encodeURIComponent(tenantId);

  // Avoid multiple injections
  if (document.getElementById('flowdesk-chat-widget-root')) return;

  var container = document.createElement('div');
  container.id = 'flowdesk-chat-widget-root';
  container.style.cssText = 'position: fixed; bottom: 24px; left: 24px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; direction: rtl;';

  // Floating Button
  var button = document.createElement('button');
  button.id = 'flowdesk-chat-btn';
  button.style.cssText = 'width: 60px; height: 60px; border-radius: 30px; background: linear-gradient(135deg, #4f46e5, #4338ca); border: none; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5); cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none;';
  button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  // Tooltip Badge
  var badge = document.createElement('div');
  badge.style.cssText = 'position: absolute; top: -38px; left: 0; background: #0f172a; color: #e2e8f0; font-size: 11px; font-weight: bold; padding: 6px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none; opacity: 1; transition: opacity 0.3s;';
  badge.innerText = 'تحدث مع المساعد الذكي 👋';
  container.appendChild(badge);

  // Chat Window Frame
  var frameWrapper = document.createElement('div');
  frameWrapper.id = 'flowdesk-chat-frame-wrapper';
  frameWrapper.style.cssText = 'display: none; position: fixed; bottom: 96px; left: 24px; width: 400px; max-width: calc(100vw - 48px); height: 620px; max-height: calc(100vh - 120px); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); background: #0a0f1d; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);';

  var iframe = document.createElement('iframe');
  iframe.src = chatUrl;
  iframe.style.cssText = 'width: 100%; height: 100%; border: none; background: transparent;';
  frameWrapper.appendChild(iframe);

  var isOpen = false;
  button.onclick = function() {
    isOpen = !isOpen;
    if (isOpen) {
      frameWrapper.style.display = 'block';
      badge.style.opacity = '0';
      button.style.transform = 'scale(0.9) rotate(90deg)';
      button.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
      frameWrapper.style.display = 'none';
      badge.style.opacity = '1';
      button.style.transform = 'scale(1) rotate(0deg)';
      button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    }
  };

  container.appendChild(button);
  document.body.appendChild(container);
  document.body.appendChild(frameWrapper);
})();
