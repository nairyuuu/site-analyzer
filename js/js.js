;(function(){
    try{
        const onMessage = ({ data }) => {
            console.log('onMessage:', data)
        };

        addEventListener('message', onMessage, { once: true });
        console.log('onMessage:', data)
    }catch(e){
        
    }
})();