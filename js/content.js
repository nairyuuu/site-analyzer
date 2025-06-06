function inject(src, id, message) {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');

      script.onload = () => {
        const onMessage = ({ data }) => {
          if (data && data.source === id) {
            window.removeEventListener('message', onMessage);
            script.remove();
            resolve(data.anhlong);
          }
        };

        window.addEventListener('message', onMessage);

        window.postMessage({
          source: 'content-script',
          anhlong: message,
        });
      };

      script.onerror = (error) => {
        console.error(`Failed to load script: ${src}`, error);
        reject(new Error(`Failed to load script: ${src}`));
      };

      script.setAttribute('src', chrome.runtime.getURL(src));
      document.body.appendChild(script);
    } catch (error) {
      console.error('Error in inject function:', error);
      reject(error);
    }
  });
}

function getJs(technologies) {
  return inject('js/js.js', 'js', {
    technologies: technologies
    .filter(({ js, scriptSrc }) => js && (Object.keys(js).length || (scriptSrc && scriptSrc.length)))
    .map(({ name, js, scriptSrc, cats }) => ({ name, chains: Object.keys(js || {}), scriptSrc, cats })),
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

async function getHeaders(technologies) {
  const headers = await Content.driver('getHeaders', location.href);

  if (!headers) {
    console.warn('No headers received.');
    return [];
  }

  const detectedTechnologies = [];

  technologies.forEach(({ name, headers: headerPatterns, cats }) => {
    if (headerPatterns) {
      Object.entries(headerPatterns).forEach(([headerName, pattern]) => {
        const headerValues = headers[headerName.toLowerCase()]; // Normalize header name to lowercase

        if (headerValues && Array.isArray(headerValues)) {
          headerValues.forEach((headerValue) => {
            try {
              const regex = new RegExp(pattern.split('\\;')[0]); // Extract regex before `;`
              const match = headerValue.match(regex);

              if (match) {
                const version = pattern.includes('\\;version:') ? match[1] : null; // Extract version if defined
                detectedTechnologies.push({
                  name,
                  cats,
                  header: headerName,
                  value: headerValue,
                  version,
                });
              }
            } catch (error) {
              console.error(`Error processing header pattern for ${name}:`, error);
            }
          });
        }
      });
    }
  });

  return detectedTechnologies;
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
        const url = location.href;
      
        const headers = (await getHeaders(technologies)) || [];
        const js = (await getJs(technologies))?.js || [];
        const dom = (await getDom(technologies))?.dom || [];

        const allDetectedTechnologies = [...headers, ...js, ...dom];

        await Content.driver('detectedTechnologies', [url, allDetectedTechnologies]);
      },

};

// Enable messaging between scripts
chrome.runtime.onMessage.addListener(Content.onMessage)

if (/complete|interactive|loaded/.test(document.readyState)) {
  Content.init()
} else {
  document.addEventListener('DOMContentLoaded', Content.init)
}
