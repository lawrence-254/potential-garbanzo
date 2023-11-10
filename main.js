const app = Vue.createApp({
    data() {
        return {
            product: 'blue cat',
            description: 'an overzealous cat filled with envy and revenge',
            image: './assets/images/cat-1.jpeg',
            available: true,
            details: ['chases birds', 'friendly to rats', 'blue eyes'],
            options: [
                { id: 007, product: 'james', alias: 'bond' },
                { id: 13, product: 'lucky', alias: 'summer' }
            ],
            likes: 10
        }
    }
})