function inject(src, id, message) {
  return new Promise((resolve) => {
      // Inject a script tag into the page to access methods of the window object
      const script = document.createElement('script');

      script.onload = () => {
          const onMessage = ({ data }) => {
              // Filter messages to ensure they are from the injected script
              if (data && data.source === id) {
                  window.removeEventListener('message', onMessage);
                  script.remove();
                  resolve(data.anhlong);
              }
          };

          window.addEventListener('message', onMessage);

          // Send a message to the injected script with a unique identifier
          window.postMessage({
              source: 'content-script',
              anhlong: message,
          });
      };

      script.setAttribute('src', chrome.runtime.getURL(src));
      document.body.appendChild(script);
  });
}

function getJs(technologies) {
  return inject('js/js.js', 'js', {
    technologies: technologies
      .filter(({ js, scriptSrc }) => Object.keys(js).length || (scriptSrc && scriptSrc.length)) // Include technologies with `js` or `scriptSrc`
      .map(({ name, js, scriptSrc, cats }) => ({ name, chains: Object.keys(js), scriptSrc, cats })), // Pass `scriptSrc` to the injected script
  });
}

function getDom(technologies) {
  const _technologies = technologies
    .filter(({ dom }) => dom && dom.constructor === Object)
    .map(({ name, dom, cats }) => ({ name, dom, cats }));

  return inject('js/dom.js', 'dom', {
    technologies: _technologies.filter(({ dom }) =>
      Object.values(dom)
        .flat()
        .some(({ properties }) => properties)
    ),
  });
}

const Content = {  
    async init(){
        try {
            const technologies = await Content.driver('getTechnologies')
            
            await Content.onGetTechnologies(technologies)

            // // Delayed second pass to capture async JS
            // await new Promise((resolve) => setTimeout(resolve, 5000))

            // const js = await getJs(technologies)

            // await Content.driver('analyzeJs', [url, js])
        } catch (error) {
            Content.driver('error', error)
        }
    },

    // Listen for messages from the background script
    // and pass them to the appropriate method
    onMessage({ source, func, args }, sender, callback) {
        if (!func) {
          return
        }
    
        Content.driver('log', { source, func, args })
    
        if (!Content[func]) {
          Content.error(new Error(`Method does not exist: Content.${func}`))
    
          return
        }
    
        Promise.resolve(Content[func].call(Content[func], ...(args || [])))
          .then(callback)
          .catch(Content.error)
    
        return !!callback
    },

    // Explicit calls from within the content script
    // to the background script
    driver(func, args) {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            {
              source: 'content.js',
              func,
              args:
                args instanceof Error
                  ? [args.toString()]
                  : args
                  ? Array.isArray(args)
                    ? args
                    : [args]
                  : [],
            },
            (response) => {
              chrome.runtime.lastError
                ? func === 'error'
                  ? resolve()
                  : Content.driver(
                      'error',
                      new Error(
                        `${
                          chrome.runtime.lastError.message
                        }: Driver.${func}(${JSON.stringify(args)})`
                      )
                    )
                : resolve(response)
            }
          )
        })
      },

    async onGetTechnologies(technologies = []) {
        const url = location.href
    
        const js = (await getJs(technologies))?.js || [];
        const dom = (await getDom(technologies))?.dom || [];

        await Promise.all(
        [Content.driver('detectedTechnologies', [url, js])
         ,Content.driver('detectedTechnologies', [url, dom])
        ])
      ;
    
    },

};

// Enable messaging between scripts
chrome.runtime.onMessage.addListener(Content.onMessage)

if (/complete|interactive|loaded/.test(document.readyState)) {
  Content.init()
} else {
  document.addEventListener('DOMContentLoaded', Content.init)
}
