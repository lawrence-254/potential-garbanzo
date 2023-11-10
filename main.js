const app = Vue.createApp({
    data() {
        return {
            product: 'blue cat',
            alias: 'black swan',
            description: 'an overzealous cat filled with envy and revenge',
            selectedOption: 0,
            image: './assets/images/cat-1.jpeg',
            details: ['chases birds', 'friendly to rats', 'blue eyes'],
            options: [
                { id: 007, product: 'james', alias: 'bond', image: './assets/images/cat-2.jpeg', likes: 10 },
                { id: 13, product: 'lucky', alias: 'summer', image: './assets/images/cat-1.jpeg', likes: 4 }
            ],
            likes: 0
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
        updateOption(index) {
            this.selectedOption = index
        }
    },
    computed: {
        title() {
            return this.alias + ' ' + this.product
        },
        available() {
            return this.options[selectedOption].likes
        },
        starStatus() {
            ratings = this.options[selectedOption].likes
            if (ratings > 10 <= 20) {
                return "Star"
            } else if (ratings > 20) {
                return " Super Star"
            } else {
                return "Normal Joe"
            }

            return this.starStatus
        }
    }
})