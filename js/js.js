;(function () {
  try {
    const onMessage = ({ data }) => {
      if (!data.anhlong || !data.anhlong.technologies) {
        return;
      }

      const { technologies } = data.anhlong;

      const detectedTechnologies = technologies.reduce((detected, { name, chains, scriptSrc, cats }) => {
        // Detect using `chains` (existing logic)
        chains.forEach((chain) => {
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
            );

          if (value !== '__UNDEFINED__') {
            detected.push({
              name,
              cats,
              chain,
              value: typeof value === 'string' || typeof value === 'number' ? value : !!value,
            });
          }
        });

        // Detect using `scriptSrc`
        if (scriptSrc && Array.isArray(scriptSrc)) {
          const scripts = Array.from(document.querySelectorAll('script[src]'));
          scripts.forEach((script) => {
            const src = script.getAttribute('src');
            scriptSrc.forEach((pattern) => {
              try {
                const regex = new RegExp(pattern.split('\\;')[0]);
                const match = src.match(regex);
                if (match) {
                  const version = pattern.includes('\\;version:') ? match[1] : null;
                  detected.push({
                    name,
                    cats,
                    scriptSrc: src,
                    version,
                  });
                }
              } catch (error) {
                console.error(`Invalid regex pattern: ${pattern}`, error);
              }
            });
          });
        }

        return detected;
      }, []);

      postMessage({
        source: 'js',
        anhlong: {
          js: detectedTechnologies,
        },
      });
    };

    addEventListener('message', onMessage, { once: true });
  } catch (e) {
    console.error('Error in js.js:', e);
  }
})();