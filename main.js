const app = Vue.createApp({
    data() {
        return {
            product: 'blue cat',
            description: 'an overzealous cat filled with envy and revenge',
            image: './assets/images/cat-1.jpeg',
            available: true,
            details: ['chases birds', 'friendly to rats', 'blue eyes'],
            options: [
                { id: 007, product: 'james', alias: 'bond', image: './assets/images/cat-2.jpeg' },
                { id: 13, product: 'lucky', alias: 'summer', image: './assets/images/cat-1.jpeg' }
            ],
            likes: 10
        }
    },
    methods: {
        addLike() {
            this.likes += 1
        },
        removeLike() {
            if (this.likes > 0) {
                this.likes -= 1
            }
        },
        updateImage(optionImage) {
            this.image = optionImage
        }
    }
})