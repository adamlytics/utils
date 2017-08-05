import onLoad from './scriptOnLoad.js';
import nextTick from 'async/nextTick';

export default function(options, fn) {
  if (!options) throw new Error('Cant load nothing...');

  // Allow for the simplest case, just passing a `src` string.
  if (typeof options === 'string') options = { src: options };

  const https = document.location.protocol === 'https:' ||
      document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = https ? 'https:' + options.src : 'http:' + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) options.src = options.https;
  else if (!https && options.http) options.src = options.http;

  // Make the `<script>` element and insert it before the first script on the
  // page, which is guaranteed to exist since this Javascript is running.
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = options.src;

  // If we have a fn, attach event handlers, even in IE. Based off of
  // the Third-Party Javascript script loading example:
  // https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html
  if (typeof fn === 'function') {
    onLoad(script, fn);
  }

  const addScriptToHead = () => {
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  };

  if (navigator.appName === 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/))) {
    // Append after event listeners are attached for IE.
    nextTick(addScriptToHead);
  } else {
    addScriptToHead();
  }

  // Return the script element in case they want to do anything special, like
  // give it an ID or attributes.
  return script;
}
