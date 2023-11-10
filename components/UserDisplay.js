app.component('user_display', {
    template:
        /*html*/
        `<div class="p_display">
        <div class="p_container">
          <div class="p_image"><img v-bind:src="image" /></div>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
          <p v-if="available">Available</p>
          <p v-else>Out of stock</p>
          <ul>
            <h5>characteristics</h5>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
          <ul>
            <h5>similar products</h5>
            <li
              v-for="option, index in options"
              :key="option.id"
              @mouseover="updateOption(index)"
            >
              {{ option.alias }}
            </li>
          </ul>
          <input type="button" value="Like" @click="addLike" />
          <input
            type="button"
            value="Dislike"
            :disabled="!likes"
            @click="removeLike"
          />
        </div>
      </div>`,
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
            ]
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