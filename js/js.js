;(function(){
    try{
        const onMessage = ({ data }) => {

            if (!data.anhlong || !data.anhlong.technologies) {
                return
              }
        
            const { technologies } = data.anhlong

            postMessage({
                source: 'js',
                anhlong: {
                  js: technologies.reduce((technologies, { name, chains }) => {
                    chains.forEach((chain, index) => {
                      const value = chain
                        .split('.')
                        .reduce(
                          (value, method) =>
                            value &&
                            value instanceof Object &&
                            Object.prototype.hasOwnProperty.call(value, method)
                              ? value[method]
                              : '__UNDEFINED__',
                          window
                        )
        
                      if (value !== '__UNDEFINED__') {
                        technologies.push({
                          name,
                          chain,
                          value:
                            typeof value === 'string' || typeof value === 'number'
                              ? value
                              : !!value,
                        })
                      }
                    })
        
                    return technologies
                  }, []),
                },
              })
        };
        addEventListener('message', onMessage, { once: true });
    }catch(e){
        
    }
})();