;(function () {
    try {
        const onMessage = ({ data }) => {
            if (!data.anhlong || !data.anhlong.technologies) {
                return;
            }

            const { technologies } = data.anhlong;

            const toScalar = (value) =>
                typeof value === 'string' || typeof value === 'number' ? value : !!value;

            removeEventListener('message', onMessage);

            postMessage({
                source: 'dom',
                anhlong: {
                    dom: technologies.reduce((detectedTechnologies, { name, dom, cats }) => {
                        Object.keys(dom).forEach((selector) => {
                            let nodes = [];

                            try {
                                nodes = document.querySelectorAll(selector); // Select DOM nodes
                            } catch (error) {
                                // Continue if the selector is invalid
                            }

                            if (!nodes.length) {
                                return;
                            }
                            nodes.forEach((node) => {
                                // Ensure dom[selector] is an array
                                const rules = Array.isArray(dom[selector]) ? dom[selector] : [dom[selector]];
                                rules.forEach(({ properties }) => {
                                    if (properties) {
                                        Object.keys(properties).forEach((property) => {
                                            const matchingProperty = Object.getOwnPropertyNames(node).find((key) => {
                                                return key.includes(property);
                                            });
                                
                                            if (matchingProperty) {
                                                const value = node[matchingProperty];
                                
                                                if (typeof value !== 'undefined') {
                                                    detectedTechnologies.push({
                                                        name,
                                                        cats,
                                                        selector,
                                                        property: matchingProperty, // Use the actual matching property name
                                                        value: toScalar(value),
                                                    });
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                        });
                        return detectedTechnologies;
                    }, []),
                },
            });
        };

        addEventListener('message', onMessage);
    } catch (e) {

    }
})();