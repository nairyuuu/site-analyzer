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
    
        //   for (const index of Array(27).keys()) {
        //     const character = index ? String.fromCharCode(index + 96) : '_'
    
        //     technologies = {
        //       ...technologies,
        //       ...(await (
        //         console.log(`js/technologies/${character}.json`),
        //         await fetch(chrome.runtime.getURL(`js/technologies/${character}.json`))
        //       ).json()),
        //     }
        //   }
          technologies = {
              ...technologies,
              ...(await (
              await fetch(chrome.runtime.getURL(`js/technologies/r.json`))
              ).json())};
    
          // Object.keys(technologies).forEach((name) => {
          // })
    
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

    detectedTechnologies(url, technologies = []) {
      const hostname = new URL(url).hostname; // Extract hostname from the URL
  
      const groupedTechnologies = [];
      technologies.forEach(({ name, cats }) => {
          // Find the technology in anhlong.technologies to get the icon
          const techData = anhlong.technologies.find((tech) => tech.name === name);
  
          cats.forEach((catId) => {
              // Access the category name using the category ID
              const categoryName = anhlong.categories[catId]?.name || "Uncategorized";
              let category = groupedTechnologies.find((group) => group.category === categoryName);
  
              if (!category) {
                  category = { category: categoryName, technologies: [] };
                  groupedTechnologies.push(category);
              }
  
              // Add the technology with its icon
              category.technologies.push({
                  name,
                  icon: techData?.icon || null // Use the icon from anhlong.technologies or null if not found
              });
          });
      });
  
      setChromeStorage(hostname, groupedTechnologies).then(() => {
          Driver.log(`Technologies cached for ${hostname}`, 'driver', 'log');
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

// Enable messaging between scripts
chrome.runtime.onMessage.addListener(Driver.onMessage);

Driver.init()