app.component('user_display', {
    props: {
        lives: {
            type: Number,
            required: true
        }
    },
    template: /*html*/`
    <div class="p_display">
        <div class="p_container">
          <div ><img v-bind:src="image" class="p_image"/></div>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
          <p v-if="available">Available</p>
          <p v-else>Out of stock</p>
        <p>hobbies: {{ hunter }}</p>
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
          <input type="button" value="Like" @click="addLike" @add_like="update_likes" />
          <input
            type="button"
            value="Dislike"
            :disabled="!options[selectedOption].likes"
            @click="removeLike"
          />
        </div>
        <review_list v-if="comments_reviews.length" :comments_reviews="comments_reviews"/>
        <comment_box @submit_comment="comment_rate"/>
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
            ],
            comments_reviews: []
        }
    },
    methods: {
        addLike() {
            this.$emit(add_like);
            // this.options[this.selectedOption].likes += 1;
        },
        removeLike() {
            if (this.options[this.selectedOption].likes > 0) {
                this.options[this.selectedOption].likes -= 1;
            }
        },
        updateOption(index) {
            this.selectedOption = index;
        },
        comment_rate(review) {
            this.comment_rate.push(review)
        }
    },
    computed: {
        title() {
            return this.options[this.selectedOption].alias + ' ' + this.product;
        },
        available() {
            return this.options[this.selectedOption].likes > 0;
        },
        starStatus() {
            const ratings = this.options[this.selectedOption].likes;
            if (ratings > 10 && ratings <= 20) {
                return "Star";
            } else if (ratings > 20) {
                return "Super Star";
            } else {
                return "Normal Joe";
            }
        },
        hunter() {
            if (this.lives >= 5) {
                return "Occasionally hunts, and has " + this.lives + " lives";
            }
            return "Number of lives " + this.lives + ", Too lazy to hunt"
        },
    },
})