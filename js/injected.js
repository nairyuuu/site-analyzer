
// console.log('Injected script loaded and listening for messages...');
// console.log(window.a);
// window.addEventListener('message', (event) => {
//     // Ensure the message is from the content script and has the expected structure
//     if (event.source !== window || !event.data || event.data.source !== 'content-script') {
//         return;
//     }

//     console.log('Message received from content script:', event.data.payload);

//     // Example logic: Simulate processing the received message
//     const responsePayload = {
//         status: 'success',
//         message: `Processed payload: ${event.data.payload}`,
//     };

//     // Send a response back to the content script
//     window.postMessage({
//         source: 'injected-script',
//         payload: responsePayload,
//     });
// });

;
(function() { console.log("script")})();