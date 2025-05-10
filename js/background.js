importScripts(chrome.runtime.getURL('js/utils.js'))

const { setChromeStorage, getChromeStorage } = Utils

const anhlong = { 
    technologies: [],
    categories: [],

    setTechnologies(technologies) {
      anhlong.technologies = Object.entries(technologies).map(([name, data]) => ({ name, ...data }));
    },

    setCategories(categories) {
        anhlong.categories = categories
    }

}

const { setTechnologies, setCategories } = anhlong


const Driver = {
    caches: {},

    async init() {
        await Driver.loadTechnologies()

        
    },

    log(message, source = 'driver', type = 'log') {
        // eslint-disable-next-line no-console
        console[type](message)
    },

    error(error, source = 'driver') {
        Driver.log(error, source, 'error')
    },

    async loadTechnologies() {
        try {
          const categories = await (
            await fetch(chrome.runtime.getURL('categories.json'))
          ).json()
    
          let technologies = {}
    
          for (const index of Array(27).keys()) {
            const character = index ? String.fromCharCode(index + 96) : '_'
    
            technologies = {
              ...technologies,
              ...(await (
                await fetch(chrome.runtime.getURL(`js/technologies/${character}.json`))
              ).json()),
            }
          }
          // technologies = {
          //     ...technologies,
          //     ...(await (
          //     await fetch(chrome.runtime.getURL(`js/technologies/r.json`))
          //     ).json())};

          setTechnologies(technologies)
          setCategories(categories)
        } catch (error) {
          Driver.error(error)
        }
    },

    onMessage({ source, func, args }, sender, callback) {
        if (!func) {
          return
        }
    
        if (func !== 'log') {
          Driver.log({ source, func, args })
        }
    
        if (!Driver[func]) {
          Driver.error(new Error(`Method does not exist: Driver.${func}`))
    
          return
        }
    
        // eslint-disable-next-line no-async-promise-executor
        new Promise(async (resolve) => {
          resolve(Driver[func].call(Driver[func], ...(args || [])))
        })
          .then(callback)
          .catch(Driver.error)
    
        return !!callback
    },

    getTechnologies() {
        return anhlong.technologies
    },

    getHeaders(request) {
      return Driver.caches[request] || {}
    },

    async onWebRequestComplete(request) {
      if (!request.responseHeaders || request.responseHeaders.length === 0) {
        console.warn('No response headers found for request:', request.url);
        return;
      }
      const headers = {};
    
      try {
        request.responseHeaders.forEach((header) => {
          const name = header.name.toLowerCase(); // Convert header name to lowercase
    
          headers[name] = headers[name] || [];
          headers[name].push(
            (header.value || header.binaryValue || '').toString()
          );
        });
        // Store headers in Driver.caches for later use
        Driver.caches[request.url] = headers;
      } catch (error) {
        console.error('Error processing response headers:', error);
      }
    },

    detectedTechnologies(url, technologies = []) {
      const hostname = new URL(url).hostname;
      getChromeStorage(hostname).then((storedData) => {

        let groupedTechnologies = [];
        if (technologies.length > 0) {
          technologies.forEach(({ name, cats }) => {

            const techData = anhlong.technologies.find((tech) => tech.name === name);
    
            cats.forEach((catId) => {
              const categoryName = anhlong.categories[catId]?.name || "Uncategorized";
              let category = groupedTechnologies.find((group) => group.category === categoryName);
    
              if (!category) {
                category = { category: categoryName, technologies: [] };
                groupedTechnologies.push(category);
              }

              const existingTech = category.technologies.find((tech) => tech.name === name);
              if (!existingTech) {
                category.technologies.push({
                  name,
                  icon: techData?.icon || null,
                });
              }
            });
          });
        }

        setChromeStorage(hostname, groupedTechnologies).then(() => {
          Driver.log(`Technologies cached for ${hostname}`, 'driver', 'log');
        });
      });
    }

}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
      // Remove this block to avoid redundant injection
      // chrome.scripting.executeScript({
      //     target: { tabId: tabId },
      //     files: ['src/content.js']
      // });
  }
});

chrome.webRequest.onCompleted.addListener(
  Driver.onWebRequestComplete,
  { urls: ['http://*/*', 'https://*/*'], types: ['main_frame'] },
  ['responseHeaders']
)

// Enable messaging between scripts
chrome.runtime.onMessage.addListener(Driver.onMessage);

Driver.init()