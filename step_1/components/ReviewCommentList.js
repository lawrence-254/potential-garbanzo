app.component('review_list', {
    props: {
        comments_reviews: {
            type: Array,
            required: true
        }
    },
    template: /*html*/`
    <div class="review-display">
        <h4>comment review</h4>
        <ul>
            <li v-for="(r_c, index) in comments_reviews" :key="index">
                {{ r_c.ratings }} was given by {{ r_c.name }},</br>who commented {{ r_c.comments }}
            </li>
        </ul>
    </div>`
})