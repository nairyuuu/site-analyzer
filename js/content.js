function inject(src, id, message) {
    return new Promise((resolve) => {
        // Inject a script tag into the page to access methods of the window object
        const script = document.createElement('script');

        script.onload = () => {
            const onMessage = ({ data }) => {
                window.removeEventListener('message', onMessage);
                resolve(data);
            };

            window.addEventListener('message', onMessage);

            window.postMessage({
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
      .filter(({ js }) => Object.keys(js).length)
      .map(({ name, js }) => ({ name, chains: Object.keys(js) })),
  })
}


const Content = {  
    async init(){
        try {
            const technologies = await Content.driver('getTechnologies')
            console.log('technologies', technologies)
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
    
        const js = await getJs(technologies)
        //const dom = await getDom(technologies)
    
    },

};

// Enable messaging between scripts
chrome.runtime.onMessage.addListener(Content.onMessage)

if (/complete|interactive|loaded/.test(document.readyState)) {
  Content.init()
} else {
  document.addEventListener('DOMContentLoaded', Content.init)
}
