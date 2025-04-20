
const Utils = {

    /**
     * Save data to Chrome storage
     * @param {string} key - The key under which the data will be stored.
     * @param {any} value - The data to store.
     * @returns {Promise<void>} - A promise that resolves when the data is saved.
     */
    setChromeStorage(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    },

    /**
     * Retrieve data from Chrome storage
     * @param {string} key - The key of the data to retrieve.
     * @returns {Promise<any>} - A promise that resolves with the retrieved data.
     */
    getChromeStorage(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([key], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result[key]);
                }
            });
        });
    }
}